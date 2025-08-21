// src/pages/AllProducts.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.scss'; // reuse your existing product card styles
import './ProductDetail.scss';


const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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
            <p className="section-subtitle">Explore our full range of products</p>
          </div>

          <div className="products-grid">
            {loading ? (
              <div>Loading…</div>
            ) : items.length === 0 ? (
              <div>No products found.</div>
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

                      {/* main category */}
                      {p.main_category && (
                        <div style={{ fontSize: 13, color: '#495057', marginBottom: 4 }}>
                          {p.main_category}
                        </div>
                      )}

                      {/* sub category */}
                      {p.sub_category && (
                        <div style={{ fontSize: 13, color: '#6c757d', marginBottom: 6 }}>
                          {p.sub_category}
                        </div>
                      )}

                      <div className="product-price">₹ {Number(p.price).toFixed(2)}</div>
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
