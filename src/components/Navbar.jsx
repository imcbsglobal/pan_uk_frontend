// src/components/Navbar.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  Grid3X3,
} from "lucide-react";
import panukLogo from "../assets/panuk-logo.png.png";
import "./Navbar.scss";
import axios from "axios";

function slugify(txt = "") {
  return String(txt || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

const apiBase = import.meta.env.VITE_API_URL || "https://panukonline.com";
const api = axios.create({ baseURL: apiBase });

function readCart() {
  try {
    const raw = localStorage.getItem("cart");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function calcCartCount(items) {
  return items.length;
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDropdowns, setMobileDropdowns] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menuError, setMenuError] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const [query, setQuery] = useState("");

  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active category slug: prefer location.state.raw (if available),
  // otherwise read from pathname /category/:slug
  const currentCategory = useMemo(() => {
    try {
      const rawFromState = location?.state?.raw;
      if (rawFromState) return slugify(String(rawFromState));
      const match = (location?.pathname || "").match(/^\/category\/([^\/?#]+)/i);
      if (match && match[1]) {
        try {
          return slugify(decodeURIComponent(match[1]));
        } catch {
          return slugify(match[1]);
        }
      }
      return null;
    } catch {
      return null;
    }
  }, [location]);

  const goCategory = (name) => {
    navigate(`/category/${slugify(name)}`, { state: { raw: name } });
  };

  const handleSubItemClick = (mainLabel, subLabel, e) => {
    if (e) e.stopPropagation();
    const combined = `${mainLabel} ${subLabel}`;
    goCategory(combined);
    setIsMobileMenuOpen(false);
    setMobileDropdowns({});
  };

  // Fetch products for menu
  useEffect(() => {
    const token = localStorage.getItem("access");
    setLoadingMenu(true);
    setMenuError(null);

    const fetchProducts = async (withAuth) => {
      try {
        const res = await api.get("/api/products/", {
          headers: withAuth && token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
          ? data.results
          : [];
        setProducts(list);
      } catch (err) {
        if (withAuth && (err?.response?.status === 401 || err?.response?.status === 403)) {
          return fetchProducts(false);
        }
        console.error("Failed to load products for menu", err);
        setMenuError("Couldn't load categories");
        setProducts([]);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchProducts(false);
  }, []);

  // Build dynamic menu items from product list
  const dynamicMenuItems = useMemo(() => {
    const byMain = new Map();
    for (const p of products) {
      const main = (p.main_category || "").trim();
      const sub = (p.sub_category || "").trim();
      if (!main) continue;
      if (!byMain.has(main)) byMain.set(main, new Set());
      if (sub) byMain.get(main).add(sub);
    }
    const items = [];
    for (const [main, subsSet] of byMain.entries()) {
      const subs = Array.from(subsSet).sort((a, b) => a.localeCompare(b));
      items.push({
        id: slugify(main),
        icon: Grid3X3,
        label: main,
        hasDropdown: subs.length > 0,
        items: subs.map((s) => ({ icon: Grid3X3, label: s })),
      });
    }
    items.sort((a, b) => a.label.localeCompare(b.label));
    return items;
  }, [products]);

  // NOTE: show all categories in the menu but visually highlight the active one
  // (avoids accidental hiding of categories like T-Shirt when Shirt is active).
  // This approach uses exact slug equality to decide active state.

  // Auth monitor
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("access");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsLoggedIn(true);
          setUser(parsedUser);
        } catch {
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

  // Cart tracking
  useEffect(() => {
    const recompute = () => setCartCount(calcCartCount(readCart()));
    recompute();

    const onCartUpdated = () => recompute();
    const onStorage = (e) => {
      if (e.key === "cart") recompute();
    };
    const onVisibility = () => {
      if (!document.hidden) recompute();
    };

    window.addEventListener("cart:updated", onCartUpdated);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("cart:updated", onCartUpdated);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
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
    setMobileDropdowns((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) setMobileDropdowns({});
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

  // Close mobile menu on resize
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

  const handleSearch = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const q = String(query || "").trim();
    if (!q) return;
    navigate(`/category/${slugify(q)}`, { state: { raw: q } });
    setQuery("");
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Top Row */}
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
            />
            <button className="search-btn" aria-label="Search" onClick={handleSearch}>
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

          <div className="cart" onClick={() => navigate("/cart")}>
            <div className="cart-icon">
              <ShoppingCart size={22} className="cart-svg" />
              {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? "99+" : cartCount}</span>}
            </div>
            <span className="cart-label"></span>
          </div>
        </div>
      </div>

      {/* Menu Row */}
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
          {loadingMenu ? (
            <li className="menu-loading">Loading categories…</li>
          ) : menuError ? (
            <li className="menu-error">{menuError}</li>
          ) : dynamicMenuItems.length === 0 ? (
            <li className="menu-empty">No categories yet</li>
          ) : (
            dynamicMenuItems.map((item) => {
              const Icon = item.icon || Grid3X3;
              const isMobileDropdownOpen = mobileDropdowns[item.id];
              const isActive = currentCategory && String(item.id) === String(currentCategory);

              return (
                <li
                  key={item.id}
                  className={`menu-item ${isActive ? "active" : ""}`}
                  data-tooltip={item.label}
                  onClick={() => {
                    if (window.innerWidth <= 768 && item.hasDropdown) handleMobileDropdown(item.id);
                  }}
                  aria-current={isActive ? "true" : undefined}
                >
                  <Icon size={16} />
                  <span
                    className="menu-main-label"
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      if (window.innerWidth <= 768) return;
                      e.stopPropagation();
                      goCategory(item.label);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (window.innerWidth <= 768) return;
                        e.stopPropagation();
                        goCategory(item.label);
                      }
                    }}
                  >
                    {item.label}
                  </span>

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
                      {item.items.map((subItem, idx) => (
                        <li
                          key={idx}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleSubItemClick(item.label, subItem.label, e)}
                          onKeyDown={(e) =>
                            e.key === "Enter" ? handleSubItemClick(item.label, subItem.label, e) : null
                          }
                        >
                          <Grid3X3 size={14} />
                          <span>{subItem.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {item.hasDropdown && (
                    <ul className={`dropdown mobile-dropdown ${isMobileDropdownOpen ? "active" : ""}`}>
                      {item.items.map((subItem, idx) => (
                        <li
                          key={idx}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleSubItemClick(item.label, subItem.label, e)}
                          onKeyDown={(e) =>
                            e.key === "Enter" ? handleSubItemClick(item.label, subItem.label, e) : null
                          }
                        >
                          <Grid3X3 size={14} />
                          <span>{subItem.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })
          )}
        </ul>
      </div>
    </nav>
  );
}
