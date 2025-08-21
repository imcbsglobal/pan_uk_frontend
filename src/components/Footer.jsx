import { Mail, Phone, MapPin } from "lucide-react";
import panukLogo from "../assets/panuk-logo.png.png";
import "./Footer.scss";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Company Info */}
        <div className="footer-section">
          <div className="footer-logo">
            <img 
              src={panukLogo} 
              alt="PAN UK Wedding Hub" 
              className="footer-logo-image"
            />
          </div>
          <p className="footer-description">
            Discover premium wedding fashion collections with our wide range of quality clothing and accessories for gents and boys for every special occasion.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="/about">About Us</a></li>
            <li><a href="/shop">Shop</a></li>
            <li><a href="/categories">Categories</a></li>
            <li><a href="/new-arrivals">New Arrivals</a></li>
            <li><a href="/sale">Sale</a></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div className="footer-section">
          <h4 className="footer-title">Customer Service</h4>
          <ul className="footer-links">
            <li><a href="/contact">Contact Us</a></li>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms-conditions">Terms & Conditions</a></li>
            <li><a href="/shipping">Shipping Info</a></li>
            <li><a href="/returns">Returns</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4 className="footer-title">Contact Info</h4>
          <div className="contact-info">
            <div className="contact-item">
              <Mail size={16} />
              <span>panuk0075@gmail.com</span>
            </div>
            <div className="contact-item">
              <Phone size={16} />
              <span>+91 9746010505</span>
            </div>
            <div className="contact-item">
              <MapPin size={16} />
              <span>MALL OF KASARAGOD MG ROAD KASARAGOD
                </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <p>&copy; 2024 PAN UK Wedding Hub. All rights reserved.</p>
            <div className="footer-legal">
              <a href="/privacy-policy">Privacy Policy</a>
              <span className="separator">|</span>
              <a href="/terms-conditions">Terms & Conditions</a>
              <span className="separator">|</span>
              <a href="/contact">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;