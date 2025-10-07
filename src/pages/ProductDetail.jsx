// File: ProductDetail.jsx
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

const hasLS = typeof window !== 'undefined' && !!window.localStorage;
const getToken = () => (hasLS ? localStorage.getItem('access') : null);
const readJSON = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k) || 'null') ?? d;
  } catch {
    return d;
  }
};
const writeJSON = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    return true;
  } catch {
    return false;
  }
};

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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const productId = useMemo(() => String(id || ''), [id]);

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [inCart, setInCart] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr('');
    setImages([]);
    setActiveIdx(0);

    api
      .get(`/api/products/${productId}/`)
      .then((res) => {
        if (!alive) return;
        const p = res.data;
        setProduct(p);
        const urls = extractImageUrls(p);
        setImages(urls.length ? urls : ['']);
      })
      .catch(() => alive && setErr('Failed to load product.'))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [productId]);

  useEffect(() => {
    const cart = readJSON('cart', []);
    setInCart(cart.some((it) => String(it.id) === productId));
  }, [productId]);

  const showPrev = useCallback(() => {
    setActiveIdx((i) => (images.length ? (i - 1 + images.length) % images.length : 0));
  }, [images.length]);

  const showNext = useCallback(() => {
    setActiveIdx((i) => (images.length ? (i + 1) % images.length : 0));
  }, [images.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showPrev, showNext]);

  useEffect(() => {
    try {
      if (!product) return;
      const raw = sessionStorage.getItem('postAuth');
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data?.action === 'ADD_TO_CART' && String(data.productId) === productId) {
        sessionStorage.removeItem('postAuth');
        handleAddToCart();
      }
    } catch {}
  }, [product, productId]);

  const ensureAuthed = () => {
    const token = getToken();
    if (token) return true;
    try {
      sessionStorage.setItem(
        'postAuth',
        JSON.stringify({ action: 'ADD_TO_CART', productId, pathname: location.pathname })
      );
    } catch {}
    navigate('/login');
    return false;
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!ensureAuthed()) return;

    const cart = readJSON('cart', []);
    if (!cart.some((it) => String(it.id) === productId)) {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price || 0),
        image: images[0] || '',
        qty: 1,
      });
      writeJSON('cart', cart);
      setInCart(true);
      try {
        window.dispatchEvent(new Event('cart:updated'));
      } catch {}
    }
  };

  const handleRemoveFromCart = () => {
    const cart = readJSON('cart', []);
    const next = cart.filter((it) => String(it.id) !== productId);
    writeJSON('cart', next);
    setInCart(false);
    try {
      window.dispatchEvent(new Event('cart:updated'));
    } catch {}
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="pd-wrap">
          <div className="pd-loading">Loading…</div>
        </div>
        <Footer />
      </>
    );
  }

  if (err || !product) {
    return (
      <>
        <Navbar />
        <div className="pd-wrap">
          <div className="pd-error">{err || 'Not found'}</div>
        </div>
        <Footer />
      </>
    );
  }

  const mainImage = images[activeIdx] || '';

  // Build WhatsApp message
  const additionalDetails = Object.entries(product)
    .filter(([key]) =>
      !['id', 'name', 'price', 'description', 'images', 'image', 'thumbnail', 'created_at', 'category', 'sub_category', 'brand'].includes(key)
    )
    .map(([key, value]) => {
      let displayValue;
      if (Array.isArray(value)) {
        displayValue = value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        displayValue = JSON.stringify(value);
      } else {
        displayValue = String(value);
      }
      return `${key.replace(/_/g, ' ')}: ${displayValue}`;
    })
    .join('\n');

  const whatsappMessage = `
🛒 *Order Summary*
--------------------
📦 Product: ${product.name}
💰 Price: ₹${Number(product.price || 0).toFixed(2)}
🏷️ Category: ${product.category || 'N/A'}
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
              {images.length > 1 && (
                <button className="pd-navbtn pd-navbtn--left" onClick={showPrev} aria-label="previous image">
                  <FaChevronLeft />
                </button>
              )}

              {mainImage ? (
                <figure className="pd-imgframe">
                  <img src={mainImage} alt={product.name} className="pd-mainimg" />
                </figure>
              ) : (
                <div className="pd-placeholder">No Image</div>
              )}

              {images.length > 1 && (
                <button className="pd-navbtn pd-navbtn--right" onClick={showNext} aria-label="next image">
                  <FaChevronRight />
                </button>
              )}
            </div>

            {images.length > 1 && (
              <div className="pd-thumbs" role="tablist" aria-label="Product thumbnails">
                {images.map((url, i) => (
                  <button
                    key={url + i}
                    className={`pd-thumb ${i === activeIdx ? 'pd-thumb--active' : ''}`}
                    onClick={() => setActiveIdx(i)}
                    aria-selected={i === activeIdx}
                  >
                    {url ? <img src={url} alt={`Thumbnail ${i + 1}`} /> : <div className="pd-thumb-ph" />}
                  </button>
                ))}
              </div>
            )}
          </aside>

          <article className="pd-info">
            <div className="pd-head">
              <h1 className="pd-title">{product.name}</h1>
              <div className="pd-badges">
                {product.category && <span className="pd-badge">{product.category}</span>}
                {product.brand && <span className="pd-badge pd-badge--muted">{product.brand}</span>}
              </div>
            </div>

            <div className="pd-price-row">
              <div className="pd-price">₹ {Number(product.price || 0).toFixed(2)}</div>
              <div className="pd-cta">
                <button
                  className={`pd-btn ${inCart ? 'pd-btn--danger' : 'pd-btn--primary'}`}
                  onClick={inCart ? handleRemoveFromCart : handleAddToCart}
                  aria-pressed={inCart}
                >
                  <FaShoppingCart size={16} />
                  <span>{inCart ? 'Remove' : 'Add to Cart'}</span>
                </button>

                <a
                  className="pd-btn pd-btn--outline"
                  href={`https://wa.me/918921816174?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaWhatsapp size={18} />
                  <span>Order via WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="pd-details card">
              <h2 className="pd-subtitle">Product Details</h2>
              <table className="pd-table">
                <tbody>
                  {Object.entries(product).map(([key, value]) => {
                    if (
                      ['id', 'name', 'price', 'description', 'images', 'image', 'thumbnail', 'created_at', 'category', 'sub_category', 'brand'].includes(
                        key
                      )
                    ) {
                      return null;
                    }

                    let displayValue;
                    if (Array.isArray(value)) {
                      displayValue = value.join(', ');
                    } else if (typeof value === 'object' && value !== null) {
                      displayValue = JSON.stringify(value);
                    } else {
                      displayValue = String(value);
                    }

                    return (
                      <tr key={key}>
                        <td className="pd-key">{key.replace(/_/g, ' ')}</td>
                        <td className="pd-value">{displayValue}</td>
                      </tr>
                    );
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
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
