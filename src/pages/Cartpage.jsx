import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import './Cartpage.scss';

export default function Cart() {
  const { items, setQty, removeItem, clear, subtotal } = useCart();
  const navigate = useNavigate();

  const sendToWhatsApp = () => {
    if (!items.length) {
      alert('Your cart is empty!');
      return;
    }

    try {
      // Create a shorter, cleaner message format
      let message = `🛍️ NEW ORDER REQUEST\n\n`;
      
      // Add each item
      items.forEach((item, index) => {
        const itemTotal = (item.price * item.qty).toFixed(2);
        message += `${index + 1}. ${item.name}\n`;
        message += `   Qty: ${item.qty} x ₹${item.price.toFixed(2)} = ₹${itemTotal}\n`;
        if (item.img) {
          message += `   Image: ${item.img}\n`;
        }
        message += '\n';
      });
      
      // Add summary
      message += `💰 ORDER SUMMARY:\n`;
      message += `Total Items: ${items.length}\n`;
      message += `Total Qty: ${items.reduce((sum, item) => sum + item.qty, 0)}\n`;
      message += `Subtotal: ₹${subtotal.toFixed(2)}\n\n`;
      message += `Please confirm this order. Thank you!`;
      
      // Check message length
      if (message.length > 2000) {
        // If too long, create a shorter version
        message = `🛍️ NEW ORDER\n\n`;
        items.forEach((item, index) => {
          message += `${index + 1}. ${item.name} x${item.qty} = ₹${(item.price * item.qty).toFixed(2)}\n`;
        });
        message += `\nTotal: ₹${subtotal.toFixed(2)}\nPlease confirm!`;
      }
      
      console.log('Message:', message);
      console.log('Message length:', message.length);
      
      // Encode for URL
      const encodedMessage = encodeURIComponent(message);
      
      // Replace with your actual WhatsApp number (country code + number, no + sign)
      const phoneNumber = '918129139506'; 
      
      // Create WhatsApp URL
      const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      
      console.log('WhatsApp URL:', whatsappURL);
      
      // Try to open WhatsApp
      const opened = window.open(whatsappURL, '_blank');
      
      if (!opened) {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
          alert('WhatsApp could not be opened. Message copied to clipboard. Please paste it in WhatsApp manually.');
        }).catch(() => {
          alert('Please check if WhatsApp is installed or try again.');
        });
      }
      
    } catch (error) {
      console.error('WhatsApp send error:', error);
      
      // Simple fallback message
      const simpleMessage = `Order from website: ${items.length} items, Total: ₹${subtotal.toFixed(2)}`;
      const fallbackURL = `https://wa.me/918129139506?text=${encodeURIComponent(simpleMessage)}`;
      
      const opened = window.open(fallbackURL, '_blank');
      if (!opened) {
        alert('Error sending to WhatsApp. Please try again or contact us directly.');
      }
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
        {items.map(item => (
          <div className="cart-row" key={item.id}>
            <img className="cart-img" src={item.img || 'https://via.placeholder.com/80'} alt={item.name}/>
            <div className="cart-name">{item.name}</div>

            <div className="cart-qty">
              <button onClick={() => setQty(item.id, item.qty - 1)}>-</button>
              <input
                type="number"
                min="1"
                value={item.qty}
                onChange={(e) => setQty(item.id, Number(e.target.value)||1)}
              />
              <button onClick={() => setQty(item.id, item.qty + 1)}>+</button>
            </div>

            <div className="cart-price">₹ {item.price.toFixed(2)}</div>
            <div className="cart-line">₹ {(item.price * item.qty).toFixed(2)}</div>

            <button className="cart-remove" onClick={() => removeItem(item.id)}>Remove</button>
          </div>
        ))}
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