// Cartpage.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cartpage.scss';

// --- storage helpers ------------------------------------------------------
const readJSON = (k, f = []) => {
  try {
    const s = localStorage.getItem(k);
    return s ? JSON.parse(s) : f;
  } catch {
    return f;
  }
};
const writeJSON = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

function readCartRaw() {
  const a = readJSON('cart', []);
  if (a.length) return a;
  return readJSON('cartItems', []);
}
function writeCart(next) {
  writeJSON('cart', next);
  writeJSON('cartItems', next);
  try { window.dispatchEvent(new CustomEvent('cart:updated')); } catch {}
}

// --- availability helpers (robust) ----------------------------------------
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

// --- image / formatting ---------------------------------------------------
const apiBase = import.meta.env?.VITE_API_URL || 'https://panukonline.com';
function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http')) return url;
  return `${apiBase}${url}`;
}
function resolveItemImage(item) {
  if (item?.image) return normalizeImageUrl(item.image);
  if (item?.img) return normalizeImageUrl(item.img);
  const first = item?.images?.[0];
  if (first) return normalizeImageUrl(first.url || first.image);
  return '';
}
function inr(n) {
  const num = Number(n || 0);
  return `₹ ${num.toFixed(2)}`;
}

// --- normalize cart items so each has boolean available and categories ----
function normalizeCartItems(rawItems) {
  try {
    const arr = Array.isArray(rawItems) ? rawItems.slice() : [];
    return arr.map((it) => {
      const override = readAvailabilityOverrideByCandidates(it.id, [it?.product_id, it?.pk, it?.id]);
      const availableFromItem = (typeof it.available === 'boolean') ? it.available : (it.available === undefined || it.available === null ? null : !!it.available);
      const finalAvailable = override === null ? (availableFromItem === null ? true : availableFromItem) : !!override;
      return {
        ...it,
        available: finalAvailable,
        main_category: it.main_category ?? it.category ?? '',
        sub_category: it.sub_category ?? '',
        qty: it.qty ?? 1,
      };
    });
  } catch {
    return [];
  }
}

function getItemKey(item) {
  return item.key ?? item.id ?? `${item.name}-${item.variant ?? ''}`;
}

// --- notify helpers -------------------------------------------------------
const NOTIFY_KEY = 'notify_requests';
const WHATSAPP_NUMBER = '918921816174'; // change to your number if needed

function readNotifyList() {
  return readJSON(NOTIFY_KEY, []);
}
function addNotify(productId) {
  try {
    const notify = readNotifyList();
    const pid = String(productId);
    if (!notify.map(String).includes(pid)) {
      notify.push(pid);
      writeJSON(NOTIFY_KEY, notify);
      // trigger storage listeners
      try { window.dispatchEvent(new Event('storage')); } catch {}
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
function isNotified(productId) {
  const notify = readNotifyList();
  return notify.map(String).includes(String(productId));
}
function composeNotifyMessageFor(item) {
  const pid = item?.id ?? item?.product_id ?? 'unknown';
  return `Please notify me when the product is available:\nProduct: ${item?.name || 'Unknown'}\nID: ${pid}\nThank you.`;
}

// -------------------------------------------------------------------------

export default function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => normalizeCartItems(readCartRaw()));

  const syncFromStorage = useCallback(() => setItems(normalizeCartItems(readCartRaw())), []);

  useEffect(() => {
    const onCartUpdated = () => syncFromStorage();
    const onStorage = (e) => {
      if (!e?.key) {
        // storage event without key -> fallback to resync
        syncFromStorage();
        return;
      }
      if (e.key === 'cart' || e.key === 'cartItems' || e.key.startsWith(OV_PREFIX) || e.key === NOTIFY_KEY) syncFromStorage();
    };
    const onAvailChanged = (e) => {
      const detail = e?.detail || {};
      if (!detail?.id) return;
      const pid = String(detail.id);
      setItems((prev) => {
        const next = prev.map((it) => (String(it.id) === pid || String(it.id) === String(detail.id)) ? { ...it, available: detail.available === null || detail.available === undefined ? it.available : !!detail.available } : it);
        writeCart(next);
        return next;
      });
    };

    syncFromStorage();
    window.addEventListener('cart:updated', onCartUpdated);
    window.addEventListener('storage', onStorage);
    window.addEventListener('availability:changed', onAvailChanged);
    return () => {
      window.removeEventListener('cart:updated', onCartUpdated);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('availability:changed', onAvailChanged);
    };
  }, [syncFromStorage]);

  const setQtyByKey = (key, nextQty) => {
    const q = Math.max(1, Number(nextQty) || 1);
    const next = normalizeCartItems(readCartRaw()).map((it) => (getItemKey(it) === key ? { ...it, qty: q } : it));
    writeCart(next);
    setItems(next);
  };

  const removeByKey = (key) => {
    const next = normalizeCartItems(readCartRaw()).filter((it) => getItemKey(it) !== key);
    writeCart(next);
    setItems(next);
  };

  const clearCart = () => {
    writeCart([]);
    setItems([]);
  };

  const subtotal = useMemo(() => (items || []).reduce((s, it) => s + (Number(it.price) || 0) * Math.max(1, Number(it.qty) || 1), 0), [items]);

  // old checkout via WhatsApp (keeps but blocked if any out-of-stock)
  const sendToWhatsApp = () => {
    if (!items?.length) { alert('Your cart is empty!'); return; }
    let message = `🛍️ NEW ORDER REQUEST\n\n`;
    items.forEach((item, i) => {
      const price = Number(item.price) || 0;
      const qty = Math.max(1, Number(item.qty) || 1);
      message += `${i + 1}. ${item.name || 'Item'}\n   Qty: ${qty} x ₹${price.toFixed(2)} = ₹${(price * qty).toFixed(2)}\n`;
      const imgUrl = resolveItemImage(item);
      if (imgUrl) message += `   Image: ${imgUrl}\n`;
      const override = readAvailabilityOverrideByCandidates(item.id, [item?.product_id, item?.pk]);
      const isAvailable = override === null ? (item.available !== false) : !!override;
      if (!isAvailable) message += `   Status: Out of stock\n`;
      message += '\n';
    });
    message += `Subtotal: ₹${subtotal.toFixed(2)}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    const opened = window.open(url, '_blank');
    if (!opened) alert('Please allow popups and try again.');
  };

  // NEW: notify for a single cart item (opens WhatsApp and records notify locally)
  const handleNotifyFromCart = (item) => {
    try {
      // store notify request locally
      const pid = item.id ?? item.product_id ?? item.key;
      addNotify(pid);

      // open WhatsApp
      const msg = composeNotifyMessageFor(item);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
      const opened = window.open(url, '_blank');
      if (!opened) alert('Please allow popups and try again.');
      // force UI update
      setItems(normalizeCartItems(readCartRaw()));
    } catch (err) {
      console.error('Notify send failed', err);
      alert('Could not send notify request. Try again.');
    }
  };

  const anyOutOfStock = items.some(item => {
    const override = readAvailabilityOverrideByCandidates(item.id, [item?.product_id, item?.pk]);
    const isAvailable = override === null ? (item.available !== false) : !!override;
    return !isAvailable;
  });

  if (!items?.length) {
    return (<div className="cart-page empty"><h2>Your cart is empty</h2><button className="btn solid" onClick={() => navigate('/')}>Go shopping</button></div>);
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      <div className="cart-table">
        {items.map((item) => {
          const key = getItemKey(item);
          const qty = Math.max(1, Number(item.qty) || 1);
          const price = Number(item.price) || 0;
          const imgSrc = resolveItemImage(item) || 'https://via.placeholder.com/80';
          const override = readAvailabilityOverrideByCandidates(item.id, [item?.product_id, item?.pk]);
          const isAvailable = override === null ? (item.available !== false) : !!override;
          const alreadyRequested = isNotified(item.id ?? item.product_id ?? key);

          return (
            <div className="cart-row" key={key}>
              <img className="cart-img" src={imgSrc} alt={item.name || 'Product'} />

              <div className="cart-name" style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div className="title">{item.name || 'Item'}</div>
                    {item.variant && <div className="muted">Variant: {item.variant}</div>}
                  </div>
                </div>

                <div className="product-card__meta" style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="badge">{item.main_category || item.category || ''}</span>
                  {item.sub_category && <span className="badge badge--sub">{item.sub_category}</span>}

                  {/* SHOW OUT OF STOCK BADGE IN RED (only when out of stock) */}
                  {!isAvailable && (
                    <span className="pd-badge--danger" style={{ marginLeft: 8 }}>Out of stock</span>
                  )}
                </div>

                {!isAvailable && <div className="muted" style={{ color: '#c00', marginTop: 6 }}>Item is currently out of stock</div>}
              </div>

              <div className="cart-qty">
                <button className="qty-btn" onClick={() => setQtyByKey(key, Math.max(1, qty - 1))} disabled={!isAvailable}>-</button>
                <input type="number" min="1" value={qty} onChange={(e) => setQtyByKey(key, e.target.value)} disabled={!isAvailable} />
                <button className="qty-btn" onClick={() => setQtyByKey(key, qty + 1)} disabled={!isAvailable}>+</button>
              </div>

              <div className="cart-price">{inr(price)}</div>
              <div className="cart-line">{inr(price * qty)}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <button className="cart-remove" onClick={() => removeByKey(key)}>Remove</button>

                {/* If item is out-of-stock, show Notify (WhatsApp) button (disabled if already requested) */}
                {!isAvailable && (
                  <button
                    className="btn outline"
                    onClick={() => handleNotifyFromCart(item)}
                    disabled={alreadyRequested}
                    title={alreadyRequested ? 'Notify request already sent' : 'Notify me when back in stock'}
                  >
                    {alreadyRequested ? 'Requested' : 'Notify'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="cart-summary">
        <div className="row">
          <span>Subtotal</span>
          <strong>{inr(subtotal)}</strong>
        </div>
       <div className="actions">
  <button className="btn outline" onClick={() => navigate('/')}>Continue Shopping</button>
  
  <button
    className="btn solid"
    onClick={sendToWhatsApp}
    disabled={anyOutOfStock}
    style={{
      opacity: anyOutOfStock ? 0.6 : 1,
      cursor: anyOutOfStock ? 'not-allowed' : 'pointer'
    }}
  >
    Checkout via WhatsApp
  </button>

  <button className="btn btn--danger" onClick={clearCart} style={{ marginLeft: 8 }}>
    Clear Cart
  </button>
</div>

      </div>
    </div>
  );
}
