import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Simple admin dashboard placeholder component
function AdminDashboard() {
  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={{ 
      padding: '40px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '32px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '20px'
        }}>
          <h1 style={{ 
            margin: 0, 
            color: '#1a1a1a',
            fontSize: '28px',
            fontWeight: '700'
          }}>
            Admin Dashboard
          </h1>
          <button 
            onClick={handleLogout}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'background 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.background = '#c0392b'}
            onMouseOut={(e) => e.target.style.background = '#e74c3c'}
          >
            Logout
          </button>
        </div>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '24px', 
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{ 
            color: '#333', 
            marginBottom: '16px',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            Welcome to Admin Panel
          </h2>
          <p style={{ 
            color: '#666', 
            lineHeight: '1.6',
            margin: '0 0 20px 0'
          }}>
            This is a placeholder admin dashboard. You can build your admin features here including:
          </p>
          <ul style={{ 
            color: '#666', 
            lineHeight: '1.6',
            paddingLeft: '20px'
          }}>
            <li>Product Management</li>
            <li>Order Management</li>
            <li>User Management</li>
            <li>Analytics & Reports</li>
            <li>Settings & Configuration</li>
          </ul>
        </div>
        
        <div style={{ 
          marginTop: '24px',
          padding: '20px',
          background: 'linear-gradient(135deg, #f2b307, #e6a406)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>Quick Stats</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Your admin portal is ready for customization. Start building your e-commerce management system!
          </p>
        </div>
      </div>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, requireAdmin = false }) {
  const token = localStorage.getItem('access');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (requireAdmin && !user.is_superuser) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;