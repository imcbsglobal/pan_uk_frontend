import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AdminLayout from "../layouts/AdminLayout";
import { CATEGORY_MAP, MAIN_CATEGORIES } from "../utils/categories";
import "./ProductsList.scss";

// ---- Axios base + interceptors --------------------------------------------
const apiBase = import.meta.env.VITE_API_URL || 'https://panukonline.com';
const api = axios.create({ baseURL: apiBase });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // navigate('/login');
    }
    return Promise.reject(err);
  }
);

export default function ProductsList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  const [mainCat, setMainCat] = useState('all');
  const [subCat, setSubCat] = useState('all');

  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/products/');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('Load products failed:', e?.response?.status, e?.response?.data);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const subOptions = useMemo(() => {
    if (mainCat === 'all') return [];
    return CATEGORY_MAP[mainCat] || [];
  }, [mainCat]);

  useEffect(() => {
    setSubCat('all');
  }, [mainCat]);

  const filteredItems = useMemo(() => {
    return items.filter((p) => {
      const mainOk = mainCat === 'all' || p.main_category === mainCat;
      const subOk = subCat === 'all' || p.sub_category === subCat;
      return mainOk && subOk;
    });
  }, [items, mainCat, subCat]);

  const imgUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${apiBase}${path}`;
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This will also remove it from all shopping carts.')) return;

    setDeletingId(id);

    const prev = items;
    setItems((curr) => curr.filter((p) => p.id !== id));

    try {
      await api.delete(`/api/products/${id}/`);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 500) {
        try {
          await api.post('/api/products/bulk-delete/', { ids: [id] });
        } catch (fallbackErr) {
          setItems(prev);
          alert('Failed to delete product (fallback also failed).');
          console.error('Bulk-delete fallback failed:', fallbackErr);
        }
      } else {
        setItems(prev);
        alert(status === 404 ? 'Product not found.' :
              status === 403 ? 'No permission to delete this product.' :
              'Failed to delete product.');
        console.error('Delete failed:', err);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert("No products selected!");
      return;
    }
    if (!window.confirm("Delete selected products?")) return;

    try {
      await api.post('/api/products/bulk-delete/', { ids: selectedIds });
      setItems((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
      setSelectedIds([]);
      alert("Selected products deleted!");
    } catch (err) {
      console.error("Bulk delete failed:", err);
      alert("Failed to delete products.");
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
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
          <div>
            <button
              className="btn btn--primary"
              onClick={() => navigate('/admin/products/new')}
            >
              + Add New Product
            </button>
            <button
              className="btn btn--danger"
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              style={{ marginLeft: '10px' }}
            >
              Delete Selected
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="filter-field">
            <label>Main Category</label>
            <select value={mainCat} onChange={(e) => setMainCat(e.target.value)}>
              <option value="all">All</option>
              {MAIN_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
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
              {subOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : filteredItems.length === 0 ? (
          <div className="empty">
            <p>No products match your filter.</p>
            <button className="btn" onClick={clearFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredItems.map((p) => {
              const first = p.images?.[0];
              const src = first ? (first.url || imgUrl(first.image)) : '';
              const isDeleting = deletingId === p.id;
              return (
                <div className="product-card" key={p.id}>
                  <div
                    className="product-card__thumb"
                    onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {src ? (
                      <img src={src} alt={p.name} />
                    ) : (
                      <div className="no-img">No Image</div>
                    )}
                  </div>

                  <div className="product-card__body">
                    <div className="product-card__title" title={p.name}>
                      {p.name}
                    </div>
                    <div className="product-card__meta">
                      <span className="badge">{p.main_category}</span>
                      {p.sub_category && (
                        <span className="badge badge--sub">{p.sub_category}</span>
                      )}
                    </div>
                    <div className="product-card__price">
                      ₹ {Number(p.price).toFixed(2)}
                    </div>
                  </div>

                  <div className="product-card__actions">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleSelect(p.id)}
                    />
                    <button
                      className="btn btn--ghost"
                      onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                      disabled={isDeleting}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn--danger"
                      onClick={() => handleDelete(p.id)}
                      disabled={isDeleting}
                      title={isDeleting ? 'Deleting…' : 'Delete'}
                    >
                      {isDeleting ? 'Deleting…' : 'Delete'}
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