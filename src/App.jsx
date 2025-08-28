// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/Admin_Dashboard';
import ProductsList from './pages/ProductsList';
import ProductForm from './pages/ProductForm';
import ProductEdit from './pages/ProductEdit';

import ProductDetail from './pages/ProductDetail';
import CategoryPage from './pages/CategoryPage';
import AllProducts from './pages/AllProducts'; 
import Cart from './pages/Cartpage';  // ✅ correct import

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/all-products" element={<AllProducts />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<ProductsList />} />
        <Route path="/admin/products/new" element={<ProductForm />} />
        <Route path="/admin/products/:id/edit" element={<ProductEdit />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

         <Route path="/cart" element={<Cart />} />
      </Routes>
    </Router>
  );
}

export default App;
