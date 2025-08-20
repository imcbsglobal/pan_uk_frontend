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
  LogOut,
  Glasses,
  Wallet,
  ShoppingBag,
  Diamond,
  GraduationCap,
  FlaskConical,
  Sparkle,
  Gift,
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

  // --- login status checker ---
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("access");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsLoggedIn(true);
          setUser(parsedUser);
        } catch (error) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("user");
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    const interval = setInterval(checkLoginStatus, 5000);

    return () => {
      window.removeEventListener("storage", checkLoginStatus);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  const handleMobileDropdown = (menu) => {
    setMobileDropdowns((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setMobileDropdowns({});
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
        setMobileDropdowns({});
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        setMobileDropdowns({});
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  // ---- Menu Items with valid Lucide icons ----
  const menuItems = [
    {
      id: "mens",
      icon: Shirt,
      label: "Men's Wear",
      hasDropdown: true,
      items: [
        { icon: Shirt, label: "Shirt" },
        { icon: Zap, label: "T-Shirt" },
        { icon: Users, label: "Jeans" },
        { icon: Package, label: "Cotton Pant" },
        { icon: Footprints, label: "Footwear" },
        { icon: ShoppingBag, label: "Co-ords" },
        { icon: Watch, label: "Watches" },
        { icon: Package, label: "Track" },
        { icon: GraduationCap, label: "Caps" },
        { icon: Diamond, label: "Jewellery" },
        { icon: Glasses, label: "Sunglasses" },
        { icon: Wallet, label: "Wallets" },
        { icon: Gift, label: "Combo set" },
      ],
    },
    {
      id: "kidsboys",
      icon: Baby,
      label: "Kids and Boys",
      hasDropdown: true,
      items: [
        { icon: Shirt, label: "Shirt" },
        { icon: Package, label: "Pants" },
        { icon: Zap, label: "T-shirt" },
        { icon: Users, label: "Jeans" },
        { icon: ShoppingBag, label: "Co-ords" },
        { icon: Gift, label: "Combo set" },
        { icon: Package, label: "Track" },
        { icon: Package, label: "Shorts" },
        { icon: Footprints, label: "Footwear" },
        { icon: Package, label: "Belt" },
        { icon: GraduationCap, label: "Cap" },
        { icon: Glasses, label: "Sunglasses" },
        { icon: Crown, label: "Suit" },
        { icon: Crown, label: "Sherwani" },
      ],
    },
    {
      id: "unisex",
      icon: Smile,
      label: "Unisex",
      hasDropdown: true,
      items: [
        { icon: Shirt, label: "Shirt" },
        { icon: Zap, label: "T-shirt" },
        { icon: Users, label: "Jeans" },
        { icon: Footprints, label: "Footwear" },
        { icon: ShoppingBag, label: "Co-ords" },
        { icon: Package, label: "Track" },
        { icon: Watch, label: "Watch" },
        { icon: GraduationCap, label: "Cap" },
        { icon: Glasses, label: "Sunglasses" },
        { icon: Diamond, label: "Jewellery" },
      ],
    },
    {
      id: "imported",
      icon: Gem,
      label: "Imported",
      hasDropdown: true,
      items: [
        { icon: Shirt, label: "Shirt" },
        { icon: Zap, label: "T-shirt" },
        { icon: HardHat, label: "Jacket" },
        { icon: Users, label: "Jeans" },
        { icon: Diamond, label: "Jewellery" },
        { icon: Glasses, label: "Sunglasses" },
        { icon: Watch, label: "Watches" },
        { icon: FlaskConical, label: "Perfume" },
        { icon: Sparkle, label: "Lotion" },
        { icon: GraduationCap, label: "Cap" },
        { icon: Footprints, label: "Footwear" },
        { icon: Package, label: "Crocs" },
      ],
    },
    {
      id: "weddinghub",
      icon: Crown,
      label: "Wedding Suit",
      hasDropdown: true,
      items: [
        { icon: Crown, label: "Suit" },
        { icon: Crown, label: "Sherwani" },
        { icon: Crown, label: "Jodhpuri" },
        { icon: Crown, label: "Kurthas" },
        { icon: Crown, label: "Dress code" },
      ],
    },
  ];

  return (
    <nav className="navbar">
      {/* ---- Top Section ---- */}
      <div className="top-row">
        <div className="nav-left">
          <div className="logo">
            <Link to="/">
              <img src={panukLogo} alt="PAN UK Wedding Hub" className="logo-image" />
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
                  <button onClick={handleLogout} className="logout-btn" title="Logout">
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <strong>
                  <Link to="/login">Login</Link>
                </strong>
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
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? (
            <>
              <X size={20} />
              <span style={{ marginLeft: "8px" }}>Close Menu</span>
            </>
          ) : (
            <>
              <Menu size={20} />
              <span style={{ marginLeft: "8px" }}>Browse Categories</span>
            </>
          )}
        </button>

        <ul className={`menu-list ${isMobileMenuOpen ? "mobile-open" : ""}`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isMobileDropdownOpen = mobileDropdowns[item.id];

            return (
              <li
                key={item.id}
                data-tooltip={item.label}
                onClick={() => {
                  if (window.innerWidth <= 768 && item.hasDropdown) handleMobileDropdown(item.id);
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.hasDropdown && (
                  <>
                    <ChevronDown size={14} className="dropdown-arrow desktop-only" />
                    <ChevronRight
                      size={14}
                      className={`dropdown-arrow mobile-only ${isMobileDropdownOpen ? "rotated" : ""}`}
                    />
                  </>
                )}

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

                {item.hasDropdown && (
                  <ul className={`dropdown mobile-dropdown ${isMobileDropdownOpen ? "active" : ""}`}>
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
