// Cartpage.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cartpage.scss';

// ===== helpers: storage =====
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

// Prefer "cart", fall back to "cartItems"
function readCart() {
  const a = readJSON('cart', []);
  if (a.length) return a;
  return readJSON('cartItems', []);
}

// Keep both keys in sync and broadcast update
function writeCart(next) {
  writeJSON('cart', next);
  writeJSON('cartItems', next);
  try {
    window.dispatchEvent(new CustomEvent('cart:updated'));
  } catch {}
}

// ===== helpers: formatting / images =====
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

// ===== key resolver =====
function getItemKey(item) {
  return item.key ?? item.id ?? `${item.name}-${item.variant ?? ''}`;
}

export default function CartPage() {
  const navigate = useNavigate();

  // Source of truth for UI is local state mirrored from storage
  const [items, setItems] = useState(() => readCart());

  const syncFromStorage = useCallback(() => {
    setItems(readCart());
  }, []);

  useEffect(() => {
    const onCartUpdated = () => syncFromStorage();
    const onStorage = (e) => {
      if (!e || e.key === 'cart' || e.key === 'cartItems') syncFromStorage();
    };

    // initial sync in case something was added before entering this page
    syncFromStorage();

    window.addEventListener('cart:updated', onCartUpdated);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('cart:updated', onCartUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, [syncFromStorage]);

  // ===== actions =====
  const setQtyByKey = (key, nextQty) => {
    const q = Math.max(1, Number(nextQty) || 1);
    const next = readCart().map((it) =>
      getItemKey(it) === key ? { ...it, qty: q } : it
    );
    writeCart(next);
    setItems(next); // instant UI
  };

  const removeByKey = (key) => {
    const next = readCart().filter((it) => getItemKey(it) !== key);
    writeCart(next);
    setItems(next); // instant UI
  };

  const clearCart = () => {
    writeCart([]);
    setItems([]);
  };

  // ===== derived values =====
  const subtotal = useMemo(() => {
    return (items || []).reduce(
      (s, it) => s + (Number(it.price) || 0) * Math.max(1, Number(it.qty) || 1),
      0
    );
  }, [items]);

  const sendToWhatsApp = () => {
    if (!items?.length) {
      alert('Your cart is empty!');
      return;
    }
    let message = `🛍️ NEW ORDER REQUEST\n\n`;
    items.forEach((item, i) => {
      const price = Number(item.price) || 0;
      const qty = Math.max(1, Number(item.qty) || 1);
      const itemTotal = (price * qty).toFixed(2);
      message += `${i + 1}. ${item.name || 'Item'}\n   Qty: ${qty} x ₹${price.toFixed(
        2
      )} = ₹${itemTotal}\n`;
      const imgUrl = resolveItemImage(item);
      if (imgUrl) message += `   Image: ${imgUrl}\n`;
      message += '\n';
    });
    message += `Subtotal: ₹${subtotal.toFixed(2)}`;

    const url = `https://wa.me/918921816174?text=${encodeURIComponent(message)}`;
    const opened = window.open(url, '_blank');
    if (!opened) alert('Please allow popups and try again.');
  };

  // ===== UI =====
  if (!items?.length) {
    return (
      <div className="cart-page empty">
        <h2>Your cart is empty</h2>
        <button className="btn solid" onClick={() => navigate('/')}>
          Go shopping
        </button>
      </div>
    );
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

          return (
            <div className="cart-row" key={key}>
              <img className="cart-img" src={imgSrc} alt={item.name || 'Product'} />

              <div className="cart-name">
                <div className="title">{item.name || 'Item'}</div>
                {item.variant && <div className="muted">Variant: {item.variant}</div>}
              </div>

              <div className="cart-qty">
                <button
                  className="qty-btn"
                  onClick={() => setQtyByKey(key, Math.max(1, qty - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQtyByKey(key, e.target.value)}
                />
                <button className="qty-btn" onClick={() => setQtyByKey(key, qty + 1)}>
                  +
                </button>
              </div>

              <div className="cart-price">{inr(price)}</div>
              <div className="cart-line">{inr(price * qty)}</div>

              <button className="cart-remove" onClick={() => removeByKey(key)}>
                Remove
              </button>
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
          <button className="btn outline" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
          <button className="btn outline" onClick={clearCart}>
            Clear Cart
          </button>
          <button className="btn solid" onClick={sendToWhatsApp}>
            Send to WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
