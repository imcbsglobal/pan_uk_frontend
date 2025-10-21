// src/pages/AllProducts.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.scss'; // reuse your existing product card styles
import './ProductDetail.scss';

const apiBase = import.meta.env.VITE_API_URL || 'https://panukonline.com/';
const api = axios.create({ baseURL: apiBase });

function imgUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${apiBase}${path}`; // prefix /media/... with API origin
}

export default function AllProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access');
    api.get('/api/products/', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setItems(res.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const goProduct = (id) => navigate(`/product/${id}`);

  return (
    <>
      <Navbar />
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">All Products</h2>
            <p className="section-subtitle">Explore our full range of premium fashion collections</p>
          </div>

          <div className="products-grid">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading products...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="no-products-message">
                <h3>No products found.</h3>
                <p>Check back soon for new arrivals!</p>
              </div>
            ) : (
              items.map((p) => {
                const first = p.images?.[0];
                const src = first ? (first.url || imgUrl(first.image)) : '';

                return (
                  <div
                    className="product-card"
                    key={p.id}
                    onClick={() => goProduct(p.id)}
                  >
                    <div className="product-image">
                      {src ? (
                        <img
                          src={src}
                          alt={p.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x500?text=Image+Not+Found';
                          }}
                        />
                      ) : (
                        <img
                          src="https://via.placeholder.com/400x500?text=No+Image"
                          alt={p.name}
                        />
                      )}
                      <div className="product-overlay">
                        <button className="quick-view-btn">Quick View</button>
                      </div>
                    </div>

                    <div className="product-info">
                      <h3 className="product-title">{p.name}</h3>

                      <div className="product-categories">
                        {p.main_category && (
                          <span className="category-tag main">{p.main_category}</span>
                        )}
                        {p.sub_category && (
                          <span className="category-tag sub">{p.sub_category}</span>
                        )}
                      </div>

                      <div className="product-price-section">
                        <div className="product-price">₹ {Number(p.price).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}