import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaWhatsapp, FaShoppingCart } from 'react-icons/fa';
import './ProductDetail.scss';

const apiBase = import.meta.env?.VITE_API_URL || 'https://panukonline.com';
const api = axios.create({ baseURL: apiBase });

// ------------- Safe storage helpers -------------
const memStore = {};
function canUseLocalStorage() {
  try {
    if (typeof window === 'undefined' || !('localStorage' in window)) return false;
    const k = '__ls_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}
const hasLS = canUseLocalStorage();

function readJSON(key, fallback) {
  try {
    const raw = hasLS ? window.localStorage.getItem(key) : memStore[key];
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    const s = JSON.stringify(value);
    if (hasLS) window.localStorage.setItem(key, s);
    memStore[key] = s;
    return true;
  } catch {
    return false;
  }
}

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
  const [inCart, setInCart] = useState(false);

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

  // Check if already in cart (by composite key)
  useEffect(() => {
    if (!p) {
      setInCart(false);
      return;
    }
    const key = `${p.id || 'noid'}|${p.color || ''}|${p.size || ''}`;
    const cart = readJSON('cart', []);
    const exists = cart.some((c) => c.key === key);
    setInCart(exists);
  }, [p]);

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

  // WhatsApp message (includes Model name & Cotton % if present)
  const whatsappHref = useMemo(() => {
    const title = p?.name ? `Inquiry about: ${p.name}` : 'Product inquiry';
    const modelLine = p?.model_name ? `\nModel: ${p.model_name}` : '';
    const cottonProvided = p?.cotton_percentage !== null && p?.cotton_percentage !== undefined && p?.cotton_percentage !== '';
    const cottonLine = cottonProvided ? `\nCotton: ${p.cotton_percentage}%` : '';
    const price = (p?.price ?? '') !== '' ? `\nPrice: ₹${Number(p.price).toFixed(2)}` : '';
    const sku = p?.id ? `\nProduct ID: ${p.id}` : '';
    const link = typeof window !== 'undefined' ? `\nLink: ${window.location.href}` : '';
    const imageLine = mainImage ? `\nImage: ${mainImage}` : '';
    const txt = encodeURIComponent(`${title}${modelLine}${cottonLine}${price}${sku}${imageLine}${link}`);
    return `https://wa.me/919061947005?text=${txt}`;
  }, [p, mainImage]);

  // --- CART: add to storage with verification ---
  const addToCart = () => {
    if (!p) {
      setAddedMsg('Cannot add: product not loaded');
      return;
      navigate(0);
    }
    

    const key = `${p.id || 'noid'}|${p.color || ''}|${p.size || ''}`;
    const baseItem = {
      key,
      id: p.id ?? null,
      name: p.name || 'Product',
      price: Number(p.price || 0),
      image: mainImage || (p.images?.[0] ? getImageUrl(p.images[0]) : ''),
      color: p.color || null,
      size: p.size || null,
      weight: p.weight || null,
      brand: p.brand || null,
      model_name: p.model_name || null,
      cotton_percentage: (p.cotton_percentage !== null && p.cotton_percentage !== undefined) ? p.cotton_percentage : null,
      qty: 1,
    };

    // 1) read existing (both keys)
    let cart = readJSON('cart', []);
    let cartItems = readJSON('cartItems', []); // compatibility with other pages

    // 2) upsert into both arrays
    const upsert = (arr) => {
      const idx = arr.findIndex((c) => c.key === key);
      if (idx !== -1) {
        const next = [...arr];
        next[idx] = { ...next[idx], qty: Number(next[idx].qty || 0) + 1 };
        return next;
        } else {
        return [...arr, baseItem];
      }
    };
    const nextCart = upsert(cart);
    const nextCartItems = upsert(cartItems);

    // 3) write both keys
    const ok1 = writeJSON('cart', nextCart);
    const ok2 = writeJSON('cartItems', nextCartItems);

    // 4) re-read & verify
    const verifyCart = readJSON('cart', []);
    const verified = verifyCart.some((c) => c.key === key);

    if (ok1 && ok2 && verified) {
      setInCart(true);
      setAddedMsg('Added to cart ✔');
      try {
        // Let other components listen: window.addEventListener('cart:updated', ...)
        window.dispatchEvent(new CustomEvent('cart:updated', { detail: { key, qtyAdded: 1 } }));
      } catch {}
    } else {
      console.warn('Add to cart failed: storage write/verify issue', { ok1, ok2, verified });
      setAddedMsg('Could not add to cart. Please check storage permissions.');
    }

    window.clearTimeout(window.__pd_toast);
    window.__pd_toast = window.setTimeout(() => setAddedMsg(''), 2500);
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

              <button
                className={`pd-btn ${inCart ? 'pd-btn--success' : 'pd-btn--primary'}`}
                onClick={addToCart}
              >
                <FaShoppingCart size={16} />
                <span>{inCart ? 'Added to Cart' : 'Add to Cart'}</span>
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
                {/* NEW FIELDS */}
                {p.model_name ? (<><dt>Model</dt><dd>{p.model_name}</dd></>) : null}
                {(p.cotton_percentage !== null && p.cotton_percentage !== undefined && p.cotton_percentage !== '') ? (
                  <><dt>Cotton</dt><dd>{p.cotton_percentage}%</dd></>
                ) : null}

                {/* Existing fields */}
                {p.brand ? (<><dt>Brand</dt><dd>{p.brand}</dd></>) : null}
                {p.material ? (<><dt>Material</dt><dd>{p.material}</dd></>) : null}
                {p.color ? (<><dt>Color</dt><dd>{p.color}</dd></>) : null}
                {p.size ? (<><dt>Size</dt><dd>{p.size}</dd></>) : null}
                {p.weight ? (<><dt>Weight</dt><dd>{p.weight}</dd></>) : null}
                {p.main_category ? (<><dt>Category</dt><dd>{p.main_category}</dd></>) : null}
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
