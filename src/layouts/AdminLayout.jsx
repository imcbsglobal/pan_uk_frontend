// src/layouts/AdminLayout.jsx
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Package, Settings, Menu, X, Home } from 'lucide-react';
import '../pages/Admin_Dashboard.scss';

export default function AdminLayout({ active = 'products', children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    else navigate('/login');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/admin-dashboard" className={`nav-item ${active === 'home' ? 'active' : ''}`}>
            <Home size={20} />
            <span>Overview</span>
          </NavLink>

          <NavLink to="/admin/products" className={`nav-item ${active === 'products' ? 'active' : ''}`}>
            <Package size={20} />
            <span>Products</span>
          </NavLink>

          <NavLink to="/admin/settings" className={`nav-item ${active === 'settings' ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content" style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
