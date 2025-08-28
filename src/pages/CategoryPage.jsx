import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.scss';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: apiBase });

function deslugify(slug = '') {
  return slug.replace(/-/g, ' ');
}
function imgUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${apiBase}${path}`;
}

export default function CategoryPage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // If Navbar sent the raw name through state, use it. Fallback to deslug from URL.
  // Examples:
  //  - "Jeans"
  //  - "Men's Wear Jeans"
  //  - "Kids and Boys Jeans"
  const categoryName = (location.state && location.state.raw) || deslugify(slug || '');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');
    api
      .get('/api/products/', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [slug]);

  /**
   * Category-aware filtering:
   * - If user navigated with "Main Sub" (e.g., "Men's Wear Jeans"),
   *   only show products where BOTH main_category and sub_category match.
   * - If user navigated with just a parent (e.g., "Men's Wear"),
   *   match main_category only.
   * - If user navigated with just a sub (e.g., "Jeans"),
   *   match sub_category only.
   */
  const filtered = useMemo(() => {
    const c = categoryName.trim().toLowerCase();

    return items.filter((p) => {
      const main = p.main_category?.toLowerCase().trim();
      const sub = p.sub_category?.toLowerCase().trim();

      // exact full "main sub" match
      if (main && sub && `${main} ${sub}` === c) return true;

      // exact main-only match
      if (main === c) return true;

      // exact sub-only match
      if (sub === c) return true;

      return false;
    });
  }, [items, categoryName]);

  const goProduct = (id) => navigate(`/product/${id}`);

  return (
    <>
      <Navbar />

      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{categoryName}</h2>
            <p className="section-subtitle">Browse all products in this category</p>
          </div>

          <div className="products-grid">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading products...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="no-products-message">
                <h3>No products in this category yet.</h3>
                <p>Check back soon for new arrivals!</p>
              </div>
            ) : (
              filtered.map((p) => {
                const first = p.images?.[0];
                const src = first ? (first.url || imgUrl(first.image)) : '';

                return (
                  <div className="product-card" key={p.id} onClick={() => goProduct(p.id)}>
                    <div className="product-image">
                      {src ? (
                        <img
                          src={src}
                          alt={p.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://via.placeholder.com/400x500?text=Image+Not+Found';
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
