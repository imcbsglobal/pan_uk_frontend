import { useEffect, useMemo, useState, useCallback } from 'react';
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
  if (typeof path === 'string' && path.startsWith('http')) return path;
  return `${apiBase}${path}`;
}
function getImageUrl(img) {
  if (!img) return '';
  return img.url ? img.url : imgUrl(img.image);
}

// ---------- Safe storage helpers (same pattern as ProductDetail) ----------
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

// key used to identify items in cart (keeps parity with ProductDetail)
function cartKey(prod) {
  return `${prod?.id || 'noid'}|${prod?.color || ''}|${prod?.size || ''}`;
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

  // Track which products are currently in the cart (by key) for instant button toggle
  const [cartKeys, setCartKeys] = useState(() => {
    const cart = readJSON('cart', []);
    return new Set(cart.map((c) => c.key));
  });

  // Toast message for add/remove feedback (simple, single-toast for the page)
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(window.__cat_toast);
    window.__cat_toast = window.setTimeout(() => setToast(''), 2000);
  };

  // Fetch products
  useEffect(() => {
    const token = hasLS ? localStorage.getItem('access') : null;
    setLoading(true);
    api
      .get('/api/products/', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        const data = res.data;
        // support both plain array and paginated {results:[]}
        const list = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [slug]);

  // Build a quick lookup set of cart keys from storage
  const recomputeCartKeys = useCallback(() => {
    const cart = readJSON('cart', []);
    setCartKeys(new Set(cart.map((c) => c.key)));
  }, []);

  // Listen for cart changes from other components/tabs
  useEffect(() => {
    const onUpdated = () => recomputeCartKeys();
    const onStorage = (e) => {
      if (e.key === 'cart') recomputeCartKeys();
    };
    window.addEventListener('cart:updated', onUpdated);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('cart:updated', onUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [recomputeCartKeys]);

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

      if (main && sub && `${main} ${sub}` === c) return true; // full match
      if (main === c) return true; // main-only
      if (sub === c) return true; // sub-only

      return false;
    });
  }, [items, categoryName]);

  const goProduct = (id) => navigate(`/product/${id}`);

  // Build WhatsApp link similar to ProductDetail
  const whatsappHref = (p, imageUrl) => {
    const title = p?.name ? `Inquiry about: ${p.name}` : 'Product inquiry';
    const modelLine = p?.model_name ? `\nModel: ${p.model_name}` : '';
    const cottonProvided =
      p?.cotton_percentage !== null &&
      p?.cotton_percentage !== undefined &&
      p?.cotton_percentage !== '';
    const cottonLine = cottonProvided ? `\nCotton: ${p.cotton_percentage}%` : '';
    const price = (p?.price ?? '') !== '' ? `\nPrice: ₹${Number(p.price).toFixed(2)}` : '';
    const sku = p?.id ? `\nProduct ID: ${p.id}` : '';
    const link = typeof window !== 'undefined' ? `\nLink: ${window.location.origin}/product/${p?.id}` : '';
    const imageLine = imageUrl ? `\nImage: ${imageUrl}` : '';
    const txt = encodeURIComponent(`${title}${modelLine}${cottonLine}${price}${sku}${imageLine}${link}`);
    return `https://wa.me/919061947005?text=${txt}`;
  };

  // --- ADD / REMOVE CART on the category cards (mirror logic from ProductDetail) ---
  const addToCart = (p, imageUrl) => {
    const key = cartKey(p);
    const baseItem = {
      key,
      id: p.id ?? null,
      name: p.name || 'Product',
      price: Number(p.price || 0),
      image: imageUrl || (p.images?.[0] ? getImageUrl(p.images[0]) : ''),
      color: p.color || null,
      size: p.size || null,
      weight: p.weight || null,
      brand: p.brand || null,
      model_name: p.model_name || null,
      cotton_percentage:
        p.cotton_percentage !== null && p.cotton_percentage !== undefined
          ? p.cotton_percentage
          : null,
      qty: 1,
    };

    let cart = readJSON('cart', []);
    let cartItems = readJSON('cartItems', []);

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

    const ok1 = writeJSON('cart', nextCart);
    const ok2 = writeJSON('cartItems', nextCartItems);

    const verifyCart = readJSON('cart', []);
    const verified = verifyCart.some((c) => c.key === key);

    if (ok1 && ok2 && verified) {
      showToast('Added to cart ✔');
      setCartKeys((prev) => new Set([...prev, key]));
      try {
        window.dispatchEvent(new CustomEvent('cart:updated', { detail: { key, qtyAdded: 1 } }));
      } catch {}
    } else {
      showToast('Could not add to cart.');
    }
  };

  // Remove ENTIRE ITEM (toggle back to "Add to Cart")
  const removeFromCart = (p) => {
    const key = cartKey(p);
    let cart = readJSON('cart', []);
    let cartItems = readJSON('cartItems', []);

    const current = cart.find((c) => c.key === key);
    const qtyRemoved = Number(current?.qty || 1);

    const nextCart = cart.filter((c) => c.key !== key);
    const nextCartItems = cartItems.filter((c) => c.key !== key);

    const ok1 = writeJSON('cart', nextCart);
    const ok2 = writeJSON('cartItems', nextCartItems);

    if (ok1 && ok2) {
      showToast('Removed from cart ✔');
      setCartKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
      try {
        window.dispatchEvent(new CustomEvent('cart:updated', { detail: { key, qtyRemoved } }));
      } catch {}
    } else {
      showToast('Could not remove from cart.');
    }
  };

  return (
    <>
      <Navbar />

      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{categoryName}</h2>
            <p className="section-subtitle">Browse all products in this category</p>
          </div>

          {toast ? <div className="pd-toast" style={{ position: 'sticky', top: 10, zIndex: 3 }}>{toast}</div> : null}

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

                const key = cartKey(p);
                const inCart = cartKeys.has(key);

                return (
                  <div className="product-card" key={p.id}>
                    <div
                      className="product-image"
                      onClick={() => goProduct(p.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' ? goProduct(p.id) : null}
                    >
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
                        <button className="quick-view-btn" onClick={(e) => { e.stopPropagation(); goProduct(p.id); }}>
                          View Details
                        </button>
                      </div>
                    </div>

                    <div className="product-info">
                      <h3 className="product-title" title={p.name}>{p.name}</h3>

                      <div className="product-categories">
                        {p.main_category && (
                          <span className="category-tag main">{p.main_category}</span>
                        )}
                        {p.sub_category && (
                          <span className="category-tag sub">{p.sub_category}</span>
                        )}
                      </div>

                      <div className="product-price-section">
                        <div className="product-price">₹ {Number(p.price ?? 0).toFixed(2)}</div>
                      </div>

                      {/* Extra details like the Product Detail page */}
                      <div className="product-meta">
                        {p.model_name ? (
                          <div className="meta-row">
                            <span className="meta-label">Model</span>
                            <span className="meta-value">{p.model_name}</span>
                          </div>
                        ) : null}
                        {(p.cotton_percentage !== null && p.cotton_percentage !== undefined && p.cotton_percentage !== '') ? (
                          <div className="meta-row">
                            <span className="meta-label">Cotton</span>
                            <span className="meta-value">{p.cotton_percentage}%</span>
                          </div>
                        ) : null}
                      </div>

                      {/* Action row */}
                      <div className="product-actions">
                        {/* <a
                          className="pd-btn pd-btn--whatsapp"
                          href={whatsappHref(p, src)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Enquire on WhatsApp
                        </a> */}

                        {inCart ? (
                          <button
                            className="pd-btn pd-btn--success"
                            onClick={(e) => { e.stopPropagation(); removeFromCart(p); }}
                            title="Remove this item from cart"
                          >
                            Remove from Cart
                          </button>
                        ) : (
                          <button
                            className="pd-btn pd-btn--primary"
                            onClick={(e) => { e.stopPropagation(); addToCart(p, src); }}
                            title="Add this item to cart"
                          >
                            Add to Cart
                          </button>
                        )}
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
