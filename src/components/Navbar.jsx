import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, 
  ShoppingCart, 
  User, 
  Grid3X3, 
  ShirtIcon as Shirt, 
  Zap, 
  Users, 
  Crown, 
  Baby, 
  Watch, 
  Footprints, 
  Smile, 
  Clock, 
  HardHat, 
  Gem, 
  Package,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut
} from "lucide-react";
import panukLogo from "../assets/panuk-logo.png.png";
import "./Navbar.scss";

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Check login status on component mount and when localStorage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('access');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsLoggedIn(true);
          setUser(parsedUser);
        } catch (error) {
          // If user data is corrupted, clear everything
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    // Check initially
    checkLoginStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', checkLoginStatus);

    // Also check periodically in case token expires
    const interval = setInterval(checkLoginStatus, 5000);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    
    // Update state
    setIsLoggedIn(false);
    setUser(null);
    
    // Redirect to home page
    navigate('/');
    
    // Optional: Show a success message
    // You could add a toast notification here
  };

  const handleMobileDropdown = (menu) => {
    setMobileDropdowns(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Reset all dropdowns when closing mobile menu
    if (isMobileMenuOpen) {
      setMobileDropdowns({});
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
        setMobileDropdowns({});
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        setMobileDropdowns({});
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const menuItems = [
    {
      id: 'mens',
      icon: Shirt,
      label: "Men's Wear",
      hasDropdown: true,
      items: [
        { icon: Shirt, label: 'Shirt' },
        { icon: Zap, label: 'T-Shirt' },
        { icon: Users, label: 'Jeans' },
        { icon: Users, label: 'Cotton Pant' },
        { icon: Users, label: 'Footwear' },
        { icon: Users, label: 'Co-ords' },
        { icon: Users, label: 'Watches' },
        { icon: Users, label: 'Track' },
        { icon: Users, label: 'Caps' },
        { icon: Users, label: 'Jewellery' },
        { icon: Users, label: 'Sunglasses' },
        { icon: Users, label: 'Wallets' },
        { icon: Users, label: 'Combo set' },
      ]
    },
    
    
    {
      id: 'kids and Boys',
      icon: Baby,
      label: 'Kids and Boys',
      hasDropdown: true,
      items: [
        { icon: Shirt, label: 'Shirt' },
        { icon: Users, label: 'Pants' },
        { icon: Shirt, label: 'T-shirt' },
        { icon: Users, label: 'Jeans' },
        { icon: Users, label: 'co-ords' },
        { icon: Users, label: 'Combo set' },
        { icon: Users, label: 'Track' },
        { icon: Users, label: 'Shots' },
        { icon: Users, label: 'Footwear' },
        { icon: Users, label: 'Belt' },
        { icon: Users, label: 'Cap' },
        { icon: Users, label: 'Sunglasses' },
        { icon: Users, label: 'Suit' },
        { icon: Users, label: 'Sharwani' },
      ]
    },
    {
      id: 'Unisex',
      icon: Baby,
      label: 'Unisex',
      hasDropdown: true,
      items: [
        { icon: Shirt, label: 'Shirt' },
        { icon: Users, label: 'T-shirt' },
        { icon: Users, label: 'Jeans' },
        { icon: Users, label: 'Footwear' },
        { icon: Users, label: 'Co-ords' },
        { icon: Users, label: 'Track' },
        { icon: Users, label: 'Watch' },
        { icon: Users, label: 'Cap' },
        { icon: Users, label: 'Sunglasses' },
        { icon: Users, label: 'Jewellery' },
      ]
    },
    {
      id: 'Imported',
      icon: Baby,
      label: 'Imported',
      hasDropdown: true,
      items: [
        { icon: Shirt, label: 'Shirt' },
        { icon: Users, label: 'T-shirt' },
        { icon: Users, label: 'Jacket' },
        { icon: Users, label: 'Jeans' },
        { icon: Users, label: 'Jewellery' },
        { icon: Users, label: 'Sunglasses' },
        { icon: Users, label: 'Watches' },
        { icon: Users, label: 'Perfume' },
        { icon: Users, label: 'Lotion' },
        { icon: Users, label: 'Cap' },
        { icon: Users, label: 'Footwear' },
        { icon: Users, label: 'Crocs' }
      ]
    },
    {
      id: 'wedding Hub',
      icon: Crown,
      label: 'Wedding Suit',
      hasDropdown: true,
      items: [
        { icon: Shirt, label: 'Suit' },
        { icon: Users, label: 'Sharwani' },
        { icon: Users, label: 'Jodhpuri' },
        { icon: Users, label: 'Kurthas' },
        { icon: Users, label: 'Dress code' },
      ]
    },
    
    
    
    
    
  ];

  return (
    <nav className="navbar">
      {/* ---- Top Section ---- */}
      <div className="top-row">
        <div className="nav-left">
          <div className="logo">
            <Link to="/">
              <img 
                src={panukLogo} 
                alt="PAN UK Wedding Hub" 
                className="logo-image"
              />
            </Link>
          </div>
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="search-input" 
              aria-label="Search products"
            />
            <button className="search-btn" aria-label="Search">
              <Search size={16} />
            </button>
          </div>
        </div>

        <div className="nav-right">
          <div className="account">
            <User size={18} />
            <div className="account-text">
              {isLoggedIn ? (
                <div className="logged-in-user">
                  <span className="username">Hi, {user?.username}</span>
                  <button 
                    onClick={handleLogout}
                    className="logout-btn"
                    title="Logout"
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <strong><Link to="/login">Login</Link></strong>
              )}
            </div>
          </div>
          <div className="cart">
            <span className="cart-count">0</span>
            <ShoppingCart size={18} />
            <span>Cart</span>
          </div>
        </div>
      </div>

      {/* ---- Menu Row ---- */}
      <div className="menu-row" ref={menuRef}>
        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <>
              <X size={20} />
              <span style={{ marginLeft: '8px' }}>Close Menu</span>
            </>
          ) : (
            <>
              <Menu size={20} />
              <span style={{ marginLeft: '8px' }}>Browse Categories</span>
            </>
          )}
        </button>

        <ul className={`menu-list ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isMobileDropdownOpen = mobileDropdowns[item.id];
            
            return (
              <li 
                key={item.id}
                data-tooltip={item.label}
                onClick={() => {
                  if (window.innerWidth <= 768 && item.hasDropdown) {
                    handleMobileDropdown(item.id);
                  }
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.hasDropdown && (
                  <>
                    {/* Desktop dropdown arrow */}
                    <ChevronDown 
                      size={14} 
                      className="dropdown-arrow desktop-only" 
                    />
                    {/* Mobile dropdown arrow */}
                    <ChevronRight 
                      size={14} 
                      className={`dropdown-arrow mobile-only ${isMobileDropdownOpen ? 'rotated' : ''}`}
                    />
                  </>
                )}
                
                {/* Desktop Dropdown - Always render, controlled by CSS hover */}
                {item.hasDropdown && (
                  <ul className="dropdown desktop-dropdown">
                    {item.items.map((subItem, index) => {
                      const SubIcon = subItem.icon;
                      return (
                        <li key={index}>
                          <SubIcon size={14} />
                          <span>{subItem.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
                
                {/* Mobile Dropdown */}
                {item.hasDropdown && (
                  <ul className={`dropdown mobile-dropdown ${isMobileDropdownOpen ? 'active' : ''}`}>
                    {item.items.map((subItem, index) => {
                      const SubIcon = subItem.icon;
                      return (
                        <li key={index}>
                          <SubIcon size={14} />
                          <span>{subItem.label}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;