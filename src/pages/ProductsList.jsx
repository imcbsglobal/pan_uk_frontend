import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';
import { CATEGORY_MAP, MAIN_CATEGORIES } from '../utils/categories';
import './ProductsList.scss';

const apiBase = import.meta.env.VITE_API_URL || 'https://panukonline.com';
const api = axios.create({ baseURL: apiBase });

export default function ProductsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [mainCat, setMainCat] = useState('all');
  const [subCat, setSubCat] = useState('all');

  const navigate = useNavigate();

  const load = () => {
    const token = localStorage.getItem('access');
    api.get('/api/products/', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // subcategory options depend on main category
  const subOptions = useMemo(() => {
    if (mainCat === 'all') return [];
    return CATEGORY_MAP[mainCat] || [];
  }, [mainCat]);

  // when main changes, reset sub to "all"
  useEffect(() => { setSubCat('all'); }, [mainCat]);

  // filtered list (client-side)
  const filteredItems = useMemo(() => {
    return items.filter(p => {
      const mainOk = mainCat === 'all' || p.main_category === mainCat;
      const subOk =
        subCat === 'all' ||
        p.sub_category === subCat; // subCat is the label (e.g., "Shirt")
      return mainOk && subOk;
    });
  }, [items, mainCat, subCat]);

  const imgUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${apiBase}${path}`;
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    const token = localStorage.getItem('access');
    try {
      await api.delete(`/api/products/${id}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setItems(prev => prev.filter(p => p.id !== id));
    } catch {
      alert('Failed to delete product');
    }
  };

  const clearFilters = () => {
    setMainCat('all');
    setSubCat('all');
  };

  return (
    <AdminLayout active="products">
      <div className="products-page">
        <div className="products-page__header">
          <h2>Products</h2>
          <button className="btn btn--primary" onClick={() => navigate('/admin/products/new')}>
            + Add New Product
          </button>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="filter-field">
            <label>Main Category</label>
            <select value={mainCat} onChange={(e) => setMainCat(e.target.value)}>
              <option value="all">All</option>
              {MAIN_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-field">
            <label>Sub Category</label>
            <select
              value={subCat}
              onChange={(e) => setSubCat(e.target.value)}
              disabled={mainCat === 'all'}
            >
              <option value="all">All</option>
              {subOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn" onClick={clearFilters}>Clear</button>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty">
            <p>No products match your filter.</p>
            <button className="btn" onClick={clearFilters}>Reset Filters</button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredItems.map((p) => {
              const first = p.images?.[0];
              const src = first ? (first.url || imgUrl(first.image)) : '';
              return (
                <div className="product-card" key={p.id}>
                  <div className="product-card__thumb" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
                    {src ? <img src={src} alt={p.name} /> : <div className="no-img">No Image</div>}
                  </div>

                  <div className="product-card__body">
                    <div className="product-card__title" title={p.name}>{p.name}</div>
                    <div className="product-card__meta">
                      <span className="badge">{p.main_category}</span>
                      {p.sub_category && <span className="badge badge--sub">{p.sub_category}</span>}
                    </div>
                    <div className="product-card__price">₹ {Number(p.price).toFixed(2)}</div>
                  </div>

                  <div className="product-card__actions">
                    <button className="btn btn--ghost" onClick={() => navigate(`/admin/products/${p.id}/edit`)}>
                      Edit
                    </button>
                    <button className="btn btn--danger" onClick={() => handleDelete(p.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
