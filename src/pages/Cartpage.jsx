import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import './Cartpage.scss';

// If you use VITE_API_URL like the other pages:
const apiBase = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

function normalizeImageUrl(url) {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (url.startsWith('http')) return url;
  // handle relative paths saved like "/media/xyz.jpg"
  return `${apiBase}${url}`;
}

function resolveItemImage(item) {
  // 1) preferred: item.image (how ProductDetail/CategoryPage save it)
  if (item?.image) return normalizeImageUrl(item.image);
  // 2) legacy: item.img
  if (item?.img) return normalizeImageUrl(item.img);
  // 3) if your cart context kept the original product object:
  const first = item?.images?.[0];
  if (first) {
    const url = first.url || first.image;
    if (url) return normalizeImageUrl(url);
  }
  return '';
}

export default function Cart() {
  const { items, setQty, removeItem, clear, subtotal } = useCart();
  const navigate = useNavigate();

  const sendToWhatsApp = () => {
    if (!items.length) {
      alert('Your cart is empty!');
      return;
    }

    try {
      let message = `🛍️ NEW ORDER REQUEST\n\n`;
      items.forEach((item, index) => {
        const itemTotal = (item.price * item.qty).toFixed(2);
        message += `${index + 1}. ${item.name}\n`;
        message += `   Qty: ${item.qty} x ₹${item.price.toFixed(2)} = ₹${itemTotal}\n`;
        const imgUrl = resolveItemImage(item);
        if (imgUrl) {
          message += `   Image: ${imgUrl}\n`;
        }
        message += '\n';
      });

      message += `💰 ORDER SUMMARY:\n`;
      message += `Total Items: ${items.length}\n`;
      message += `Total Qty: ${items.reduce((s, it) => s + it.qty, 0)}\n`;
      message += `Subtotal: ₹${subtotal.toFixed(2)}\n\n`;
      message += `Please confirm this order. Thank you!`;

      if (message.length > 2000) {
        message = `🛍️ NEW ORDER\n\n`;
        items.forEach((item, idx) => {
          message += `${idx + 1}. ${item.name} x${item.qty} = ₹${(item.price * item.qty).toFixed(2)}\n`;
        });
        message += `\nTotal: ₹${subtotal.toFixed(2)}\nPlease confirm!`;
      }

      const encoded = encodeURIComponent(message);
      const phoneNumber = '918129139506';
      const whatsappURL = `https://wa.me/${phoneNumber}?text=${encoded}`;
      const opened = window.open(whatsappURL, '_blank');

      if (!opened) {
        navigator.clipboard.writeText(message).then(() => {
          alert('WhatsApp could not be opened. Message copied to clipboard. Please paste it in WhatsApp manually.');
        }).catch(() => {
          alert('Please check if WhatsApp is installed or try again.');
        });
      }
    } catch (error) {
      console.error('WhatsApp send error:', error);
      const simple = `Order from website: ${items.length} items, Total: ₹${subtotal.toFixed(2)}`;
      const fallbackURL = `https://wa.me/918129139506?text=${encodeURIComponent(simple)}`;
      const opened = window.open(fallbackURL, '_blank');
      if (!opened) alert('Error sending to WhatsApp. Please try again or contact us directly.');
    }
  };

  if (!items.length) {
    return (
      <div className="cart-page empty">
        <h2>Your cart is empty</h2>
        <button className="btn solid" onClick={() => navigate('/')}>Go shopping</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      <div className="cart-table">
        {items.map(item => {
          const imgSrc = resolveItemImage(item) || 'https://via.placeholder.com/80';
          const key = item.key || item.id; // be resilient if your context uses composite keys
          return (
            <div className="cart-row" key={key}>
              <img
                className="cart-img"
                src={imgSrc}
                alt={item.name}
                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80'; }}
              />

              <div className="cart-name">{item.name}</div>

              <div className="cart-qty">
                <button onClick={() => setQty(item.id, Math.max(1, item.qty - 1))}>-</button>
                <input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={(e) => setQty(item.id, Math.max(1, Number(e.target.value) || 1))}
                />
                <button onClick={() => setQty(item.id, item.qty + 1)}>+</button>
              </div>

              <div className="cart-price">₹ {item.price.toFixed(2)}</div>
              <div className="cart-line">₹ {(item.price * item.qty).toFixed(2)}</div>

              <button className="cart-remove" onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          );
        })}
      </div>

      <div className="cart-summary">
        <div className="row">
          <span>Subtotal</span>
          <strong>₹ {subtotal.toFixed(2)}</strong>
        </div>
        <div className="actions">
          <button className="btn outline" onClick={() => navigate('/')}>Continue Shopping</button>
          {/* <button className="btn outline" onClick={clear}>Clear Cart</button> */}
          <button className="btn solid" onClick={sendToWhatsApp}>Send to WhatsApp</button>
        </div>
      </div>
    </div>
  );
}
