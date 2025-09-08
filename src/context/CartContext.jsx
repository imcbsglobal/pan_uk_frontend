import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const CartContext = createContext(null);

// Change this to your live API (or set in .env as VITE_API_URL)
const API_BASE = import.meta.env.VITE_API_URL || 'https://panukonline.com';
const api = axios.create({ baseURL: API_BASE });

// --- Helpers ---
async function getCartId() {
  let id = localStorage.getItem('cartId');
  if (!id) {
    try {
      const { data } = await api.post('/api/carts/'); // <-- adjust to your backend
      id = data.cartId;
      localStorage.setItem('cartId', id);
    } catch (err) {
      console.error('Failed to create cartId', err);
    }
  }
  return id;
}

// simple debounce so we don’t spam server
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function CartProvider({ children }) {
  // initial cart from localStorage
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
      return [];
    }
  });

  // keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // add item
  const addItem = (product, qty = 1) => {
    const id = product.id ?? product._id ?? product.pk;
    if (id == null) return;

    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: (next[idx].qty || 1) + qty };
        return next;
      }
      return [
        ...prev,
        {
          id,
          name: product.name || product.title || 'Item',
          price: Number(product.price) || 0,
          qty,
          image:
            product.image ||
            product.img ||
            product.images?.[0]?.url ||
            product.images?.[0]?.image ||
            '',
        },
      ];
    });
  };

  // update qty
  const setQty = (id, qty) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, qty: Math.max(1, Number(qty) || 1) } : it
      )
    );
  };

  // remove item
  const removeItem = (id) => setItems((prev) => prev.filter((it) => it.id !== id));

  // clear cart
  const clear = () => setItems([]);

  // subtotal
  const subtotal = useMemo(
    () =>
      items.reduce(
        (s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0),
        0
      ),
    [items]
  );

  // --- DB sync ---
  const syncToServer = useMemo(
    () =>
      debounce(async (payload) => {
        try {
          const cartId = await getCartId();
          if (!cartId) return;
          await api.put(`/api/carts/${cartId}`, payload);
        } catch (err) {
          console.error('Cart sync failed', err);
        }
      }, 500),
    []
  );

  useEffect(() => {
    const payload = {
      items: items.map(({ id, qty, price, name, image }) => ({
        id,
        qty,
        price,
        name,
        image,
      })),
      subtotal,
    };
    syncToServer(payload);
  }, [items, subtotal, syncToServer]);

  // --- Load cart from DB on first mount ---
  useEffect(() => {
    (async () => {
      try {
        const cartId = localStorage.getItem('cartId');
        if (!cartId) return;
        const { data } = await api.get(`/api/carts/${cartId}`);
        if (Array.isArray(data?.items)) setItems(data.items);
      } catch (err) {
        console.error('Failed to load cart from DB', err);
      }
    })();
  }, []);

  const value = { items, addItem, setQty, removeItem, clear, subtotal };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
