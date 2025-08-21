import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.scss'; // reuse styles (optional)

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: apiBase });

function imgUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${apiBase}${path}`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');
    api.get(`/api/products/${id}/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setP(res.data))
      .catch(() => setP(null))
      .finally(() => setLoading(false));
  }, [id]);

  const placeOrder = () => {
    // You can navigate to a checkout page, open WhatsApp, or open a form.
    alert('Order placed! (wire this to your actual order flow)');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>Loading…</div>
        <Footer />
      </>
    );
  }

  if (!p) {
    return (
      <>
        <Navbar />
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
          Product not found.
        </div>
        <Footer />
      </>
    );
  }

  const first = p.images?.[0];
  const hero = first ? (first.url || imgUrl(first.image)) : '';

  return (
    <>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
          <div className="product-image" style={{ height: 500 }}>
            {hero ? (
              <img src={hero} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src="https://via.placeholder.com/600x600?text=No+Image" alt={p.name}
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>

          <div className="product-info" style={{ padding: 20, background: '#fff', borderRadius: 12 }}>
            <h2 className="product-title" style={{ margin: 0 }}>{p.name}</h2>
            {p.sub_category && (
              <div style={{ color: '#6c757d', margin: '8px 0 12px' }}>{p.sub_category}</div>
            )}
            <div className="product-price" style={{ marginBottom: 16 }}>
              ₹ {Number(p.price).toFixed(2)}
            </div>

            {p.description && (
              <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: 20 }}>{p.description}</p>
            )}

            <button
              onClick={placeOrder}
              className="view-all-btn"
              style={{ padding: '12px 20px', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >
              Place Order
            </button>

            <div style={{ marginTop: 16 }}>
              <button
                className="btn"
                onClick={() => navigate(-1)}
                style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: '8px 12px' }}
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* More images */}
        {p.images?.length > 1 && (
          <div style={{ marginTop: 24, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {p.images.slice(1).map(img => {
              const u = img.url || imgUrl(img.image);
              return (
                <img key={img.id || u} src={u} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
