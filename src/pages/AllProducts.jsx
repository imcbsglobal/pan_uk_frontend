// src/pages/AllProducts.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SEO from '../components/SEO/SEO';
import { getBreadcrumbSchema } from '../utils/seo/structuredData';
import { META_DESCRIPTIONS } from '../utils/seo/keywords';
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
      {/* SEO Meta Tags for All Products Page */}
      <SEO
        title="All Products - Pan UK Kasaragod | Premium Fashion Collection"
        description={META_DESCRIPTIONS.products}
        keywords="Pan UK products, fashion collection Kasaragod, all products Pan UK, clothing Anebagilu, fashion store Dwarka Road, premium clothing Kerala"
        canonical="https://panukonline.com/all-products"
        ogTitle="Browse All Products at Pan UK Kasaragod"
        ogDescription="Explore our complete fashion collection at Pan UK, Mall of Kasaragod. Premium clothing, accessories, footwear & more."
        ogImage="https://panukonline.com/panuk-logo.png"
        structuredData={getBreadcrumbSchema([
          { name: 'Home', url: 'https://panukonline.com/' },
          { name: 'All Products', url: 'https://panukonline.com/all-products' }
        ])}
      />

      <Navbar />
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h1 className="section-title">All Fashion Products at Pan UK Kasaragod</h1>
            <p className="section-subtitle">Explore our complete range of premium fashion collections at Mall of Kasaragod, Anebagilu</p>
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
                          alt={`${p.name} - Pan UK Kasaragod premium fashion store`}
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