import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import panukLogo from '../assets/panuk-logo.png.png';
import './Login.scss';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://panukonline.com/',
});

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectUserType = (adminSelected) => {
    setIsAdmin(adminSelected);
    setErrors({});
    setFormData({ username: '', password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Choose endpoint based on toggle
      const endpoint = isAdmin ? '/api/superuser-login/' : '/api/user-login/';
      const { data } = await api.post(endpoint, formData);

      // Frontend enforcement:
      // 1) If Customer is selected but the returned user is a superuser -> block.
      if (!isAdmin && data?.user?.is_superuser) {
        // Clear anything we may have set
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        setErrors({
          general: 'Admins must use the Admin login. Please switch to the Admin tab.',
        });
        return;
      }

      // 2) If Admin is selected but the user is NOT a superuser -> block.
      if (isAdmin && !data?.user?.is_superuser) {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        setErrors({
          general: 'Only admins can use this login. Please use the Customer tab.',
        });
        return;
      }

      // Store tokens (only after checks pass)
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on user type
      if (isAdmin) {
        navigate('/admin/products');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrors({
        general: err.response?.data?.error || 'Login failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  return (
    <div className="login-page">
      <div className="login-container">
        <Link to="/" className="back-home">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>

        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <img src={panukLogo} alt="PAN UK Wedding Hub" className="login-logo" />
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">
              {isAdmin
                ? 'Admin Portal - Sign in to manage your store'
                : 'Sign in to your account to continue'}
            </p>
          </div>

          {/* User Type Toggle (kept) */}
          <div
            className="user-type-toggle"
            style={{
              marginBottom: '24px',
              textAlign: 'center',
              padding: '16px',
              background: 'rgba(242, 179, 7, 0.05)',
              borderRadius: '12px',
              border: '1px solid rgba(242, 179, 7, 0.1)',
            }}
          >
            <div
              style={{
                marginBottom: '12px',
                fontSize: '14px',
                color: '#666',
                fontWeight: '500',
              }}
            >
              Login as:
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => handleSelectUserType(false)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: !isAdmin ? '#f2b307' : '#f5f5f5',
                  color: !isAdmin ? 'white' : '#666',
                }}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleSelectUserType(true)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: isAdmin ? '#f2b307' : '#f5f5f5',
                  color: isAdmin ? 'white' : '#666',
                }}
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {errors.general && (
              <div className="error-message general-error">{errors.general}</div>
            )}

            {/* Username */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <div className="input-container">
                <div className="input-icon"><User size={18} /></div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="form-input"
                  required
                />
              </div>
              {errors.username && <div className="error-message">{errors.username}</div>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-container">
                <div className="input-icon"><Lock size={18} /></div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="form-input"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <button
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner" />
                  <span>Signing In...</span>
                </>
              ) : (
                `Sign In${isAdmin ? ' as Admin' : ''}`
              )}
            </button>
          </form>

          <div className="login-footer">
            {!isAdmin && (
              <>
                <p className="footer-text">
                  Don't have an account?{' '}
                  <Link to="/register" className="footer-link">
                    Sign up here
                  </Link>
                </p>
                <Link to="/forgot-password" className="forgot-password-link">
                  Forgot your password?
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
