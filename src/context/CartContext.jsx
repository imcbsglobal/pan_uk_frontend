import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart") || "[]"); }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.id === product.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      // normalize a minimal shape if your product doesn't already contain img/price
      return [...prev, {
        id: product.id,
        name: product.name,
        price: Number(product.price) || 0,
        img: product?.images?.[0]?.url || product?.images?.[0]?.image || "",
        qty
      }];
    });
  };

  const removeItem = (id) => setItems(prev => prev.filter(x => x.id !== id));
  const setQty = (id, qty) => setItems(prev => prev.map(x => x.id === id ? { ...x, qty: Math.max(1, qty) } : x));
  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((n, x) => n + x.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, x) => s + x.price * x.qty, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQty, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
