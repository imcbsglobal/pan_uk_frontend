// ProductDetail.jsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaWhatsapp, FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './ProductDetail.scss';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://panukonline.com',
});

// --- Helpers that robustly read availability_override keys -----------------
const OV_PREFIX = 'availability_override:';

function parseStoredBool(raw) {
  if (raw === true || raw === 'true' || raw === 1 || raw === '1') return true;
  if (raw === false || raw === 'false' || raw === 0 || raw === '0') return false;
  try {
    const p = JSON.parse(raw);
    if (p === true) return true;
    if (p === false) return false;
  } catch {}
  return null;
}

function readAvailabilityOverrideByCandidates(productId, candidates = []) {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (!key.startsWith(OV_PREFIX)) continue;
      const idPart = key.slice(OV_PREFIX.length);
      if (String(idPart) === String(productId) || candidates.map(String).includes(String(idPart))) {
        const raw = localStorage.getItem(key);
        const b = parseStoredBool(raw);
        return b === null ? (raw ? true : null) : b;
      }
    }
    const rawDirect = localStorage.getItem(`${OV_PREFIX}${String(productId)}`);
    if (rawDirect != null) {
      const b = parseStoredBool(rawDirect);
      return b === null ? (rawDirect ? true : null) : b;
    }
    return null;
  } catch {
    return null;
  }
}

function readJSON(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch {
    return false;
  }
}

// small helper to extract images
function extractImageUrls(product) {
  const urls = [];
  if (Array.isArray(product?.images)) {
    for (const img of product.images) {
      if (!img) continue;
      if (typeof img === 'string') urls.push(img);
      else if (typeof img.image === 'string') urls.push(img.image);
      else if (typeof img.url === 'string') urls.push(img.url);
    }
  }
  if (typeof product?.image === 'string') urls.push(product.image);
  if (typeof product?.image_url === 'string') urls.push(product.image_url);
  if (typeof product?.thumbnail === 'string') urls.push(product.thumbnail);
  return Array.from(new Set(urls.filter(Boolean)));
}

// notify storage key
const NOTIFY_KEY = 'notify_requests';

// WhatsApp number to send the notification message to (change as needed)
const WHATSAPP_NUMBER = '918921816174';

export default function ProductDetail() {
  const { id } = useParams();
  const productParamId = useMemo(() => String(id ?? ''), [id]);
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [inCart, setInCart] = useState(false);

  // resolved availability used to render UI
  const [isAvailable, setIsAvailable] = useState(true);
  const [notifySent, setNotifySent] = useState(false);

  // fetch product and compute initial availability
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErrorMsg('');
    setImages([]);
    setActiveIdx(0);
    setNotifySent(false);

    api.get(`/api/products/${productParamId}/`)
      .then((res) => {
        if (!alive) return;
        const p = res.data;
        setProduct(p);
        const urls = extractImageUrls(p);
        setImages(urls.length ? urls : ['']);

        const candidates = [p?.id, p?.pk, p?.product_id].filter(Boolean);
        const override = readAvailabilityOverrideByCandidates(productParamId, candidates);
        const apiAvailable = (p?.available === undefined || p?.available === null) ? true : !!p.available;
        setIsAvailable(override === null ? apiAvailable : !!override);

        // check notify list
        try {
          const notify = JSON.parse(localStorage.getItem(NOTIFY_KEY) || '[]');
          const exists = Array.isArray(notify) && notify.map(String).includes(String(p?.id ?? productParamId));
          setNotifySent(!!exists);
        } catch {
          setNotifySent(false);
        }

        // check cart presence (keeps original behavior if you still use add/remove)
        try {
          const cart = JSON.parse(localStorage.getItem('cart') || localStorage.getItem('cartItems') || '[]');
          const present = Array.isArray(cart) && cart.some((it) => String(it.id) === String(p?.id) || String(it.id) === productParamId);
          setInCart(!!present);
        } catch {
          setInCart(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load product', err);
        if (!alive) return;
        setErrorMsg('Failed to load product.');
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => { alive = false; };
  }, [productParamId]);

  // in-cart sync
  useEffect(() => {
    const onCartUpdated = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || localStorage.getItem('cartItems') || '[]');
        const present = Array.isArray(cart) && cart.some((it) => String(it.id) === String(product?.id) || String(it.id) === productParamId);
        setInCart(!!present);
      } catch {
        setInCart(false);
      }
    };
    window.addEventListener('cart:updated', onCartUpdated);
    window.addEventListener('storage', onCartUpdated);
    return () => {
      window.removeEventListener('cart:updated', onCartUpdated);
      window.removeEventListener('storage', onCartUpdated);
    };
  }, [product, productParamId]);

  // keyboard nav
  const showPrev = useCallback(() => setActiveIdx((i) => (images.length ? (i - 1 + images.length) % images.length : 0)), [images.length]);
  const showNext = useCallback(() => setActiveIdx((i) => (images.length ? (i + 1) % images.length : 0)), [images.length]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'ArrowLeft') showPrev(); if (e.key === 'ArrowRight') showNext(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPrev, showNext]);

  // When override changes in same tab recompute
  useEffect(() => {
    const handler = (e) => {
      const detail = e?.detail || {};
      if (!detail?.id) return;
      if (String(detail.id) === productParamId || String(detail.id) === String(product?.id)) {
        const override = readAvailabilityOverrideByCandidates(productParamId, [product?.id]);
        const apiAvailable = (product?.available === undefined || product?.available === null) ? true : !!product.available;
        setIsAvailable(override === null ? apiAvailable : !!override);
      }
    };
    window.addEventListener('availability:changed', handler);
    return () => window.removeEventListener('availability:changed', handler);
  }, [productParamId, product]);

  // respond to storage events
  useEffect(() => {
    const onStorage = (e) => {
      if (!e?.key) return;
      if (!e.key.startsWith(OV_PREFIX)) return;
      const changedId = e.key.slice(OV_PREFIX.length);
      if (String(changedId) === productParamId || String(changedId) === String(product?.id)) {
        const override = readAvailabilityOverrideByCandidates(productParamId, [product?.id]);
        const apiAvailable = (product?.available === undefined || product?.available === null) ? true : !!product.available;
        setIsAvailable(override === null ? apiAvailable : !!override);
      }
      if (e.key === NOTIFY_KEY) {
        try {
          const notify = JSON.parse(localStorage.getItem(NOTIFY_KEY) || '[]');
          const exists = Array.isArray(notify) && notify.map(String).includes(String(product?.id ?? productParamId));
          setNotifySent(!!exists);
        } catch { setNotifySent(false); }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [productParamId, product]);

  const ensureAuthed = () => {
    const token = localStorage.getItem('access');
    if (token) return true;
    try {
      sessionStorage.setItem('postAuth', JSON.stringify({ action: 'ADD_TO_CART', productId: productParamId, pathname: location.pathname }));
    } catch {}
    navigate('/login');
    return false;
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!isAvailable) {
      alert('Sorry — this item is currently out of stock.');
      return;
    }
    if (!ensureAuthed()) return;

    const cart = readJSON('cart', []);
    if (!cart.some((it) => String(it.id) === String(product.id) || String(it.id) === productParamId)) {
      cart.push({
        id: product.id ?? productParamId,
        name: product.name,
        price: Number(product.price || 0),
        image: images[0] || '',
        qty: 1,
        available: isAvailable,
        main_category: product.main_category ?? product.category ?? '',
        sub_category: product.sub_category ?? '',
      });
      writeJSON('cart', cart);
      setInCart(true);
      try { window.dispatchEvent(new Event('cart:updated')); } catch {}
    }
  };

  const handleRemoveFromCart = () => {
    const cart = readJSON('cart', []);
    const next = cart.filter((it) => !(String(it.id) === String(product.id) || String(it.id) === productParamId));
    writeJSON('cart', next);
    setInCart(false);
    try { window.dispatchEvent(new Event('cart:updated')); } catch {}
  };

  // Compose the WhatsApp message for notify
  const composeNotifyMessage = (p) => {
    const productId = p?.id ?? productParamId;
    // Customize this text to your preference
    return `Please notify me when this product is available:\nProduct: ${p?.name || 'Unknown'}\nID: ${productId}\nThank you.`;
  };

  // NEW: Notify flow that DOES NOT add the product to cart.
  // - store notify request locally (so button becomes disabled)
  // - open WhatsApp with the templated message
  const handleNotify = () => {
    if (!product) return;

    // Save notify request locally
    try {
      const notify = JSON.parse(localStorage.getItem(NOTIFY_KEY) || '[]');
      const productId = product.id ?? productParamId;
      if (!Array.isArray(notify)) notify.length = 0;
      if (!notify.map(String).includes(String(productId))) {
        notify.push(productId);
        localStorage.setItem(NOTIFY_KEY, JSON.stringify(notify));
        setNotifySent(true);
      } else {
        setNotifySent(true);
      }
    } catch (err) {
      console.error('Notify error', err);
      // still proceed to open WhatsApp even if local storage failed
    }

    // Open WhatsApp with message (wa.me)
    try {
      const message = composeNotifyMessage(product);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      const w = window.open(url, '_blank');
      if (!w) {
        alert('Could not open WhatsApp. Please allow popups and try again.');
      }
    } catch (err) {
      console.error('Failed to open WhatsApp', err);
      alert('Could not open WhatsApp. Please try manually sending a message.');
    }
  };

  if (loading) {
    return (<><Navbar /><div className="pd-wrap"><div className="pd-loading">Loading…</div></div><Footer /></>);
  }
  if (errorMsg || !product) {
    return (<><Navbar /><div className="pd-wrap"><div className="pd-error">{errorMsg || 'Not found'}</div></div><Footer /></>);
  }

  const mainImage = images[activeIdx] || '';

  const additionalDetails = Object.entries(product || {})
    .filter(([key]) => !['id','name','price','description','images','image','thumbnail','created_at','category','sub_category','brand','available','main_category'].includes(key))
    .map(([k,v]) => {
      let display;
      if (Array.isArray(v)) display = v.join(', ');
      else if (typeof v === 'object' && v !== null) display = JSON.stringify(v);
      else display = String(v);
      return `${k.replace(/_/g,' ')}: ${display}`;
    }).join('\n');

  const whatsappMessage = `
🛒 *Order Summary*
--------------------
📦 Product: ${product.name}
💰 Price: ₹${Number(product.price || 0).toFixed(2)}
${!isAvailable ? '🔴 Out of stock\n' : ''}
🏷️ Category: ${product.main_category || product.category || 'N/A'}
🎨 Color: ${product.color || 'N/A'}
🏢 Brand: ${product.brand || 'N/A'}

📝 Description:
${product.description || '—'}

${additionalDetails ? `🔎 Other Details:\n${additionalDetails}` : ''}
`;

  return (
    <>
      <Navbar />
      <main className="pd-wrap">
        <section className="pd-grid">
          <aside className="pd-media">
            <div className="pd-mainwrap">
              {images.length > 1 && (<button className="pd-navbtn pd-navbtn--left" onClick={showPrev}><FaChevronLeft/></button>)}
              {mainImage ? (<figure className="pd-imgframe"><img src={mainImage} alt={product.name} className="pd-mainimg"/></figure>) : (<div className="pd-placeholder">No Image</div>)}
              {images.length > 1 && (<button className="pd-navbtn pd-navbtn--right" onClick={showNext}><FaChevronRight/></button>)}
            </div>

            {images.length > 1 && (
              <div className="pd-thumbs" role="tablist" aria-label="Product thumbnails">
                {images.map((url,i)=>((
                  <button key={url+i} className={`pd-thumb ${i===activeIdx ? 'pd-thumb--active':''}`} onClick={()=>setActiveIdx(i)} aria-selected={i===activeIdx}>
                    {url ? <img src={url} alt={`Thumb ${i+1}`} /> : <div className="pd-thumb-ph" />}
                  </button>
                )))}
              </div>
            )}
          </aside>

          <article className="pd-info">
            <div className="pd-head">
              <h1 className="pd-title">{product.name}</h1>
              <div className="pd-badges">
                <div className="product-card__meta" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {!isAvailable && (
                    <span className="pd-badge pd-badge--danger">Out of stock</span>
                  )}
                </div>

              </div>
            </div>

            <div className="pd-price-row">
              <div className="pd-price">₹ {Number(product.price || 0).toFixed(2)}</div>
              <div className="pd-cta">
                {/* if product is available show Add/Remove as before; if not, show Notify button */}
              </div>
            </div>

            <div className="pd-details card">
              <h2 className="pd-subtitle">Product Details</h2>
              <table className="pd-table">
                <tbody>
                  {Object.entries(product).map(([key,value])=>{
                    if (['id','name','price','description','images','image','thumbnail','created_at','category','sub_category','brand','available','main_category'].includes(key)) return null;
                    let display;
                    if (Array.isArray(value)) display = value.join(', ');
                    else if (typeof value === 'object' && value !== null) display = JSON.stringify(value);
                    else display = String(value);
                    return <tr key={key}><td className="pd-key">{key.replace(/_/g,' ')}</td><td className="pd-value">{display}</td></tr>;
                  })}
                </tbody>
              </table>
            </div>

            <div className="pd-description card">
              <h2 className="pd-subtitle">Description</h2>
              <p className="pd-desc-text">{product.description || '—'}</p>
            </div>

            <div className="pd-actions">
              <button className="pd-btn pd-btn--ghost" onClick={() => navigate('/cart')}>Go to Cart</button>
              <button className="pd-btn pd-btn--ghost" onClick={() => navigate(-1)}>Back</button>

              {isAvailable ? (
                // available: normal add to cart / remove behavior
                <button
                  className={`pd-btn ${inCart ? 'pd-btn--danger' : 'pd-btn--primary'}`}
                  onClick={inCart ? handleRemoveFromCart : handleAddToCart}
                >
                  <FaShoppingCart size={16}/> <span>{inCart ? 'Remove' : 'Add to Cart'}</span>
                </button>
              ) : (
                // out of stock: show notify button (disabled if already requested)
                <button
                  className={`pd-btn ${notifySent ? 'pd-btn--outline' : 'pd-btn--primary'}`}
                  onClick={handleNotify}
                  disabled={notifySent}
                  title={notifySent ? 'You will be notified' : 'Notify me when back in stock'}
                >
                  <span>{notifySent ? 'You will be notified' : 'Notify me'}</span>
                </button>
              )}
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
