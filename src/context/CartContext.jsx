import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const CartContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || 'https://panukonline.com/';
const api = axios.create({ baseURL: API_BASE });

// --- Helpers ---
function makeLocalCartId() {
  const localId = `local-cart-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  localStorage.setItem('cartId', localId);
  console.warn('[Cart] Using local fallback cartId:', localId);
  return localId;
}

function isLocalCartId(id) {
  return typeof id === 'string' && id.startsWith('local-cart-');
}

async function tryCreateServerCart(headers = {}) {
  const endpointsToTry = ['/api/carts/', '/api/cart/', '/carts/', '/cart/'];
  for (const ep of endpointsToTry) {
    try {
      console.log(`[Cart] Attempting to create cart via ${ep}`);
      const resp = await api.post(ep, {}, { headers });
      if (resp?.status >= 200 && resp?.status < 300) {
        const id =
          resp.data?.id ||
          resp.data?.cartId ||
          resp.data?.cart_id ||
          resp.data?.pk ||
          resp.data;
        if (id) {
          localStorage.setItem('cartId', String(id));
          console.log('[Cart] Created cartId from server:', id, 'via', ep);
          return String(id);
        }
        console.warn('[Cart] Create cart returned 2xx but no id in body:', resp.data, 'from', ep);
      }
    } catch (err) {
      console.warn(`[Cart] create cart failed at ${ep}`, err?.response?.status || err?.message);
      continue;
    }
  }
  return null;
}

// Get or create cart id. If server creation fails we return a local cart id.
export async function getCartId() {
  const saved = localStorage.getItem('cartId');
  if (saved) return saved;

  const token = localStorage.getItem('access');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const serverId = await tryCreateServerCart(headers);
  if (serverId) return serverId;

  // fallback to local cart id
  return makeLocalCartId();
}

function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
    window.dispatchEvent(new Event('cart:updated'));
  }, [items]);

  const addItem = (product, qty = 1) => {
    const id = product.id ?? product._id ?? product.pk;
    if (id == null) return;

    setItems((prev) => {
      const idx = prev.findIndex((it) => it.id === id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          qty: (next[idx].qty || 1) + qty,
          available: product.available === undefined ? next[idx].available : !!product.available,
        };
        return next;
      }
      return [
        ...prev,
        {
          id,
          key: `${id}-${Date.now()}`,
          name: product.name || product.title || 'Item',
          price: Number(product.price) || 0,
          qty,
          image:
            product.image ||
            product.img ||
            (product.images && (product.images[0]?.url || product.images[0]?.image || '')) ||
            '',
          available: product.available === undefined ? true : !!product.available,
        },
      ];
    });
  };

  const setQty = (keyOrId, qty) => {
    setItems((prev) =>
      prev.map((it) =>
        it.key === keyOrId || it.id === keyOrId ? { ...it, qty: Math.max(1, Number(qty) || 1) } : it
      )
    );
  };

  const removeItem = (keyOrId) =>
    setItems((prev) => prev.filter((it) => it.id !== keyOrId && it.key !== keyOrId));

  const clear = () => setItems([]);

  const subtotal = useMemo(
    () =>
      items.reduce((s, it) => s + (Number(it.price) || 0) * Math.max(1, Number(it.qty) || 1), 0),
    [items]
  );

  // Server sync: skip entirely if cartId is a local fallback
  const syncToServer = useMemo(
    () =>
      debounce(async (payload) => {
        try {
          const cartId = localStorage.getItem('cartId');
          if (!cartId) {
            console.log('[Cart] No cartId yet; skipping server sync for now.');
            return;
          }
          if (isLocalCartId(cartId)) {
            // Skip server sync for local cart ids to avoid 404/CORS noise
            // (local carts are purely client-side)
            // console.debug('[Cart] Local cart id detected; skipping server sync:', cartId);
            return;
          }

          // attempt typical put path; tolerate different path forms
          const endpoints = [
            `/api/carts/${cartId}`,
            `/api/carts/${cartId}/`,
            `/api/cart/${cartId}/`,
            `/carts/${cartId}/`,
            `/cart/${cartId}/`,
          ];
          let ok = false;
          for (const ep of endpoints) {
            try {
              await api.put(ep, payload);
              ok = true;
              console.log('[Cart] Synced to server at', ep);
              break;
            } catch (err) {
              console.warn('[Cart] Sync put failed at', ep, err?.response?.status || err?.message);
              continue;
            }
          }
          if (!ok) {
            console.warn('[Cart] Could not sync cart to any server endpoint; continuing with local cart.');
          }
        } catch (err) {
          console.error('Cart sync failed', err);
        }
      }, 500),
    []
  );

  useEffect(() => {
    const payload = {
      items: items.map(({ id, qty, price, name, image, available }) => ({
        id,
        qty,
        price,
        name,
        image,
        available,
      })),
      subtotal,
    };
    syncToServer(payload);
  }, [items, subtotal, syncToServer]);

  // Load cart from DB on first mount — skip if cartId is a local fallback
  useEffect(() => {
    (async () => {
      try {
        const cartId = localStorage.getItem('cartId');
        if (!cartId) return;
        if (isLocalCartId(cartId)) {
          // local cart - nothing to load from server
          console.log('[Cart] Detected local cartId; skipping server load:', cartId);
          return;
        }

        const endpoints = [
          `/api/carts/${cartId}`,
          `/api/carts/${cartId}/`,
          `/api/cart/${cartId}/`,
          `/carts/${cartId}/`,
          `/cart/${cartId}/`,
        ];
        for (const ep of endpoints) {
          try {
            const { data } = await api.get(ep);
            if (Array.isArray(data?.items)) {
              const normalized = data.items.map((it) => ({
                id: it.id ?? it.product ?? it.pk,
                key: it.key ?? `${it.id}-${Date.now()}`,
                name: it.name ?? it.title ?? 'Item',
                price: Number(it.price) || 0,
                qty: Number(it.qty) || 1,
                image: it.image ?? it.img ?? (it.images && (it.images[0]?.url || it.images[0]?.image)) ?? '',
                available: it.available === undefined ? true : !!it.available,
              }));
              setItems(normalized);
              console.log('[Cart] Loaded cart from server via', ep);
              return;
            }
            if (Array.isArray(data)) {
              setItems(data);
              console.log('[Cart] Loaded cart array from server via', ep);
              return;
            }
          } catch (err) {
            console.warn('[Cart] Failed to load cart from', ep, err?.response?.status || err?.message);
            continue;
          }
        }
      } catch (err) {
        console.error('Failed to load cart from DB', err);
      }
    })();
  }, []);

  const value = { items, addItem, setQty, removeItem, clear, subtotal };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
