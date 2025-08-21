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

  // If Home sent the raw name through state, use it. Fallback to deslug.
  const categoryName = (location.state && location.state.raw) || deslugify(slug);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');
    api.get('/api/products/', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [slug]);

  // Filter: show products whose sub_category matches the categoryName (case-insensitive).
  // If you also want to match main_category, add that condition.
  const filtered = useMemo(() => {
    const c = categoryName.toLowerCase();
    return items.filter(p =>
      (p.sub_category && p.sub_category.toLowerCase() === c) ||
      (p.main_category && p.main_category.toLowerCase() === c)
    );
  }, [items, categoryName]);

  const goProduct = (id) => navigate(`/product/${id}`);

  return (
    <>
      <Navbar />

      <section className="products-section">
        <div className="container-fuild">
          <div className="section-header">
            <h2 className="section-title">{categoryName}</h2>
            <p className="section-subtitle">Browse all products in this category</p>
          </div>

          <div className="products-grid">
            {loading ? (
              <div>Loading…</div>
            ) : filtered.length === 0 ? (
              <div>No products in this category yet.</div>
            ) : (
              filtered.map((p) => {
                const first = p.images?.[0];
                const src = first ? (first.url || imgUrl(first.image)) : '';

                return (
                  <div className="product-card" key={p.id} onClick={() => goProduct(p.id)}>
                    <div className="product-image">
                      {src ? (
                        <img src={src} alt={p.name} />
                      ) : (
                        <img src="https://via.placeholder.com/400x500?text=No+Image" alt={p.name} />
                      )}
                      <div className="product-overlay">
                        <button className="quick-view-btn">Quick View</button>
                      </div>
                    </div>

                    <div className="product-info">
                      <h3 className="product-title">{p.name}</h3>
                      {p.sub_category ? (
                        <div style={{ fontSize: 13, color: '#6c757d', marginBottom: 6 }}>
                          {p.sub_category}
                        </div>
                      ) : null}
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
