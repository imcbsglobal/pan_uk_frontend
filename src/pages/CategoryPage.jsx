import { useEffect, useMemo, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.scss';

const apiBase = import.meta.env.VITE_API_URL || 'https://panukonline.com';
const api = axios.create({ baseURL: apiBase });

// --- Cart persistence helpers (server sync) ---
const hasLS = typeof window !== 'undefined' && !!window.localStorage;
const CART_SERVER_MAP = 'cartServerMap';
const getToken = () => (hasLS ? localStorage.getItem('access') : null);
const getIdMap = () => {
  try { return JSON.parse(localStorage.getItem(CART_SERVER_MAP) || '{}'); } catch { return {}; }
};
const setIdMap = (m) => { try { localStorage.setItem(CART_SERVER_MAP, JSON.stringify(m)); return true; } catch { return false; } };

function deslugify(slug = '') {
  return slug.replace(/-/g, ' ');
}
function imgUrl(path) {
  if (!path) return '';
  if (typeof path === 'string' && path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL || 'https://panukonline.com';
  return `${base}${path}`;
}
function getImageUrl(img) {
  if (!img) return '';
  if (typeof img === 'string') return imgUrl(img);
  return img?.image ? imgUrl(img.image) : '';
}

// Safe JSON helpers
function readJSON(key, fallback) {
  if (!hasLS) return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  if (!hasLS) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
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

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  }, []);

  // Fetch category items
  useEffect(() => {
    setLoading(true);
    const token = hasLS ? localStorage.getItem('access') : null;
    api
      .get('/api/products/', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        params: { search: categoryName },
      })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [categoryName]);

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
      const main = (p.main_category || '').toLowerCase();
      const sub = (p.sub_category || '').toLowerCase();
      const [maybeMain, maybeSub] = c.split(' ').length > 1
        ? [c.substring(0, c.lastIndexOf(' ')), c.substring(c.lastIndexOf(' ') + 1)]
        : [c, ''];

      // If title contains both main and sub, require both to match
      if (maybeMain && maybeSub) {
        return main.includes(maybeMain) && sub.includes(maybeSub);
      }

      // If the string matches a known main category term, filter by main
      if (['men', 'mens', "men's wear", 'kids', 'boys', 'kidsboys', 'unisex', 'imported', 'wedding', 'weddinghub'].some((k) => c.includes(k))) {
        return main.includes(maybeMain);
      }

      // otherwise treat as sub-only search
      return sub.includes(c);
    });
  }, [items, categoryName]);

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

      // ------ NEW: persist to server if JWT available ------
      const token = getToken();
      if (token && p?.id) {
        api.post(
          '/api/cart/items/',
          { product_id: p.id, qty: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        ).then((res) => {
          const serverItem = res?.data;
          if (serverItem?.id) {
            const map = getIdMap();
            map[p.id] = serverItem.id;
            setIdMap(map);
          }
        }).catch(() => {});
      }
      // ------------------------------------------------------
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

      // ------ NEW: remove on server if JWT available ------
      const token = getToken();
      if (token && p?.id) {
        const map = getIdMap();
        let itemId = map[p.id];

        const doDelete = (id) => api.delete(`/api/cart/items/${id}/remove/`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(() => {
          // clear mapping if fully removed locally
          const left = readJSON('cart', []).find((x) => x.id === p.id);
          if (!left) {
            const m = getIdMap();
            delete m[p.id];
            setIdMap(m);
          }
        }).catch(() => {});

        if (itemId) {
          doDelete(itemId);
        } else {
          api.get('/api/cart/', { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => {
              const found = (res?.data?.items || []).find((it) => it?.product?.id === p.id);
              if (found?.id) doDelete(found.id);
            }).catch(() => {});
        }
      }
      // ----------------------------------------------------
    } else {
      showToast('Could not remove from cart.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="home-container">
        <div className="home-header">
          <h1 className="home-title">{categoryName}</h1>
          {toast && <div className="home-toast">{toast}</div>}
        </div>

        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <div className="product-grid">
            {filtered.map((p) => {
              const key = cartKey(p);
              const inCart = cartKeys.has(key);
              const src = p.image ? imgUrl(p.image) : (p.images?.[0] ? getImageUrl(p.images[0]) : '');

              return (
                <div
                  key={p.id || Math.random()}
                  className="product-card"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div className="product-image">
                    <img src={src} alt={p.name} loading="lazy" />
                  </div>

                  <div className="product-info">
                    <div className="product-title">{p.name}</div>

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
                      {p.brand ? (
                        <div className="meta-row">
                          <span className="meta-label">Brand</span>
                          <span className="meta-value">{p.brand}</span>
                        </div>
                      ) : null}
                      {p.cotton_percentage !== null && p.cotton_percentage !== undefined ? (
                        <div className="meta-row">
                          <span className="meta-label">Cotton %</span>
                          <span className="meta-value">{p.cotton_percentage}%</span>
                        </div>
                      ) : null}
                      {p.color ? (
                        <div className="meta-row">
                          <span className="meta-label">Color</span>
                          <span className="meta-value">{p.color}</span>
                        </div>
                      ) : null}
                      {p.size ? (
                        <div className="meta-row">
                          <span className="meta-label">Size</span>
                          <span className="meta-value">{p.size}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="product-actions" onClick={(e) => e.stopPropagation()}>
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
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
