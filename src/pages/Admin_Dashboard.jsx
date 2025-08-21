import { useNavigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <AdminLayout active="home">
      <div style={{ padding: 24 }}>
        <h2 style={{ marginTop: 0 }}>Overview</h2>
        <p>Welcome back! Use the Products section to manage your catalog.</p>
        <button
          onClick={() => navigate('/admin/products/new')}
          style={{ padding:'8px 12px', border:'none', borderRadius:8, background:'#111', color:'#fff', cursor:'pointer' }}
        >
          + Add New Product
        </button>
      </div>
    </AdminLayout>
  );
}
