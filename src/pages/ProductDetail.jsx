import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaWhatsapp, FaShoppingCart } from 'react-icons/fa';
import './ProductDetail.scss';

const apiBase = import.meta.env?.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: apiBase });

// Normalize image url from either {url} or {image}
function imgUrl(path) {
  if (!path) return '';
  if (typeof path === 'string' && path.startsWith('http')) return path;
  return `${apiBase}${path}`;
}
function getImageUrl(img) {
  if (!img) return '';
  return img.url ? img.url : imgUrl(img.image);
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // local, reorderable copy for swap behavior
  const [localImages, setLocalImages] = useState([]);

  // cart UI feedback
  const [addedMsg, setAddedMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    setErr(null);
    const token = localStorage.getItem('access');
    api
      .get(`/api/products/${id}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => setP(res.data || {}))
      .catch((e) => {
        console.error('Product fetch failed:', e);
        setErr(e?.message || 'Failed to load product');
        setP(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Initialize localImages when product changes
  useEffect(() => {
    const imgs = Array.isArray(p?.images) ? p.images.filter(Boolean) : [];
    setLocalImages(imgs);
  }, [p]);

  const hasImages = localImages.length > 0;
  const mainImage = hasImages ? getImageUrl(localImages[0]) : '';
  const thumbnails = hasImages ? localImages.slice(1) : [];

  // Swap clicked thumbnail with main image (index 0)
  const handleThumbClick = (thumbIdx) => {
    const idx = thumbIdx + 1; // 0 is main
    setLocalImages((prev) => {
      if (!prev || prev.length <= idx) return prev;
      const next = [...prev];
      [next[0], next[idx]] = [next[idx], next[0]];
      return next;
    });
  };

  // WhatsApp message
  const whatsappHref = useMemo(() => {
    const title = p?.name ? `Inquiry about: ${p.name}` : 'Product inquiry';
    const price = (p?.price ?? '') !== '' ? `\nPrice: ₹${Number(p.price).toFixed(2)}` : '';
    const sku = p?.id ? `\nProduct ID: ${p.id}` : '';
    const link = typeof window !== 'undefined' ? `\nLink: ${window.location.href}` : '';
    const txt = encodeURIComponent(`${title}${price}${sku}${link}`);
    return `https://wa.me/?text=${txt}`;
  }, [p]);

  // --- CART: add to localStorage ---
  const addToCart = () => {
    if (!p) return;

    // read existing
    const raw = localStorage.getItem('cart');
    let cart = [];
    try { cart = raw ? JSON.parse(raw) : []; } catch { cart = []; }

    // build an item key that includes variant-like fields
    const key = `${p.id || 'noid'}|${p.color || ''}|${p.size || ''}`;

    const item = {
      key, // internal dedupe key
      id: p.id,
      name: p.name || 'Product',
      price: Number(p.price || 0),
      image: mainImage || (p.images?.[0] ? getImageUrl(p.images[0]) : ''),
      color: p.color || null,
      size: p.size || null,
      weight: p.weight || null,
      brand: p.brand || null,
      qty: 1,
    };

    const idx = cart.findIndex((c) => c.key === key);
    if (idx !== -1) {
      cart[idx].qty += 1;
    } else {
      cart.push(item);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setAddedMsg('Added to cart ✔');
    window.clearTimeout(window.__pd_toast);
    window.__pd_toast = window.setTimeout(() => setAddedMsg(''), 2200);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pd-container">
          <div className="pd-skeleton">Loading…</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!p) {
    return (
      <>
        <Navbar />
        <div className="pd-container">
          {err ? <div className="pd-alert pd-alert--error">{String(err)}</div> : null}
          Product not found.
          <div style={{ marginTop: 12 }}>
            <button className="pd-btn" onClick={() => navigate(-1)}>Back</button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="pd-container">
        {err ? <div className="pd-alert pd-alert--warn">{String(err)}</div> : null}
        {addedMsg ? <div className="pd-toast">{addedMsg}</div> : null}

        <div className="pd-grid">
          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-img">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={p.name || 'Product image'}
                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/800x800?text=Image+Unavailable'; }}
                />
              ) : (
                <img
                  src="https://via.placeholder.com/800x800?text=No+Image"
                  alt={p.name || 'No image'}
                />
              )}
            </div>

            {thumbnails.length > 0 && (
              <div className="pd-thumbs" role="list">
                {thumbnails.map((img, i) => {
                  const u = getImageUrl(img);
                  return (
                    <button
                      key={img?.id || u || i}
                      type="button"
                      className="pd-thumb"
                      onClick={() => handleThumbClick(i)}
                      aria-label={`View image ${i + 2}`}
                      title="Click to swap with main image"
                    >
                      <img
                        src={u || 'https://via.placeholder.com/160x160?text=No+Img'}
                        alt=""
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/160x160?text=No+Img'; }}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <div className="pd-breadcrumb">
              {p.main_category ? <span className="pd-crumb">{p.main_category}</span> : null}
              {p.sub_category ? <span className="pd-crumb">/ {p.sub_category}</span> : null}
            </div>

            <h1 className="pd-title">{p.name || 'Untitled Product'}</h1>

            {(p.price ?? '') !== '' && (
              <div className="pd-price">₹ {Number(p.price ?? 0).toFixed(2)}</div>
            )}

            {p.description ? (
              <p className="pd-desc">{p.description}</p>
            ) : null}

            {/* Action buttons */}
            <div className="pd-btn-row">
              <a className="pd-btn pd-btn--whatsapp" href={whatsappHref} target="_blank" rel="noreferrer">
                <FaWhatsapp size={18} />
                <span>Enquire / Order on WhatsApp</span>
              </a>

              <button className="pd-btn pd-btn--primary" onClick={addToCart}>
                <FaShoppingCart size={16} />
                <span>Add to Cart</span>
              </button>

              <button className="pd-btn pd-btn--ghost" onClick={() => navigate('/cart')}>
                Go to Cart
              </button>

              <button className="pd-btn pd-btn--ghost" onClick={() => navigate(-1)}>
                Back
              </button>
            </div>

            {/* Specs */}
            <div className="pd-specs">
              <h2 className="pd-section-title">Product Specs</h2>
              <dl className="pd-specs-grid">
                {p.brand ? (<><dt>Brand</dt><dd>{p.brand}</dd></>) : null}
                {p.material ? (<><dt>Material</dt><dd>{p.material}</dd></>) : null}
                {p.color ? (<><dt>Color</dt><dd>{p.color}</dd></>) : null}
                {p.size ? (<><dt>Size</dt><dd>{p.size}</dd></>) : null}
                {p.weight ? (<><dt>Weight</dt><dd>{p.weight}</dd></>) : null}
                {p.main_category ? (<><dt>Main Category</dt><dd>{p.main_category}</dd></>) : null}
                {p.sub_category ? (<><dt>Sub Category</dt><dd>{p.sub_category}</dd></>) : null}
              </dl>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
