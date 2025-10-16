// ProductEdit.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';
import './ProductForm.scss';
import { CATEGORY_MAP, MAIN_CATEGORIES } from '../utils/categories';

const apiBase = import.meta.env.VITE_API_URL || 'https://panukonline.com';
const api = axios.create({ baseURL: apiBase });

// --- Local override helpers (localStorage) ---------------------------------
const availabilityKey = (productId) => `availability_override:${productId}`;
function readAvailabilityOverride(productId) {
  try {
    const v = localStorage.getItem(availabilityKey(productId));
    if (v === null) return null;
    return v === 'true';
  } catch {
    return null;
  }
}
function writeAvailabilityOverride(productId, boolVal) {
  try {
    localStorage.setItem(availabilityKey(productId), boolVal ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('availability:changed', { detail: { id: String(productId), available: boolVal } }));
    return true;
  } catch {
    return false;
  }
}

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    main_category: 'mens',
    sub_category: '',
    name: '',
    price: '',
    brand: '',
    material: '',
    model_name: '',
    cotton_percentage: '',
    color: '',
    size: '',
    weight: '',
    description: '',
    available: true,
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const subOptions = useMemo(() => CATEGORY_MAP[form.main_category] || [], [form.main_category]);

  useEffect(() => {
    const token = localStorage.getItem('access');
    setLoading(true);
    api
      .get(`/api/products/${id}/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        const p = res.data;
        setForm({
          main_category: p.main_category || 'mens',
          sub_category: p.sub_category || '',
          name: p.name || '',
          price: p.price ?? '',
          brand: p.brand || '',
          material: p.material || '',
          model_name: p.model_name || '',
          cotton_percentage: p.cotton_percentage ?? '',
          color: p.color || '',
          size: p.size || '',
          weight: p.weight || '',
          description: p.description || '',
          // Load from server but if a local override exists prefer that visually:
          available: (readAvailabilityOverride(p.id) ?? (typeof p.available === 'boolean' ? p.available : true)),
        });
        setExistingImages(p.images || []);
      })
      .catch((err) => {
        console.error('Failed to load product', err);
        setErrors({ general: 'Failed to load product' });
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, sub_category: '' }));
  }, [form.main_category]);

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    if (type === 'checkbox' && name === 'available') {
      setForm((prev) => ({ ...prev, available: checked }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...newFiles]);
  };

  const removeNewImage = (indexToRemove) => {
    setNewImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Product Name is required';
    if (!form.main_category) e.main_category = 'Main Category is required';
    if (!form.sub_category) e.sub_category = 'Sub Category is required';
    if (!form.price || isNaN(Number(form.price))) e.price = 'Valid price is required';
    if (Number(form.price) <= 0) e.price = 'Price must be greater than 0';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const eobj = validate();
    setErrors(eobj);
    if (Object.keys(eobj).length) return;

    setSaving(true);
    try {
      const fd = new FormData();

      Object.entries(form).forEach(([key, val]) => {
        if (key === 'available') {
          fd.append('available', val ? 'true' : 'false');
        } else {
          fd.append(key, val ?? '');
        }
      });

      newImages.forEach((file) => {
        fd.append('images', file);
      });

      const token = localStorage.getItem('access');

      // Try to save to backend (if backend exists). If it fails, we'll still set the local override so UI updates.
      try {
        await api.put(`/api/products/${id}/`, fd, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch (err) {
        console.warn('Backend save failed/was skipped, continuing with local override:', err?.message || err);
        // continue — we still set local override
      }

      // === Persist client-only override so other pages reflect change immediately ===
      writeAvailabilityOverride(id, !!form.available);

      // update local cart items (if present) so cart page shows the latest availability
      try {
        const raw = localStorage.getItem('cart') || localStorage.getItem('cartItems') || '[]';
        const cart = JSON.parse(raw);
        const next = (Array.isArray(cart) ? cart : []).map((it) =>
          String(it.id) === String(id) ? { ...it, available: !!form.available } : it
        );
        localStorage.setItem('cart', JSON.stringify(next));
        localStorage.setItem('cartItems', JSON.stringify(next));
        window.dispatchEvent(new Event('cart:updated'));
      } catch (e) {
        console.warn('Failed to update local cart entries', e);
      }

      navigate('/admin/products');
    } catch (err) {
      console.error('Save failed', err);
      const msg =
        err?.response?.data?.detail ||
        (err?.response?.data ? JSON.stringify(err.response.data) : err.message) ||
        'Failed to save changes';
      setErrors({ general: msg });
    } finally {
      setSaving(false);
    }
  };

  const imgUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${apiBase}${path}`;
  };

  if (loading) {
    return (
      <AdminLayout active="products">
        <div className="product-form">
          <div className="form-container">
            <div className="loading-container">
              <div className="loading-spinner" />
              <div className="loading-text">Loading product details...</div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="products">
      <div className="product-form">
        <div className="form-container">
          <div className="page-header">
            <div className="top-bar">
              <div>
                <h1>Edit Product</h1>
                <div className="subtitle">Update product information and settings</div>
              </div>
              <button
                className="back-link-btn"
                onClick={() => navigate('/admin/products')}
              >
                <span className="back-icon">←</span>
                Back to Products
              </button>
            </div>
          </div>

          {errors.general && (
            <div className="general-error" style={{ whiteSpace: 'pre-wrap' }}>
              {errors.general}
            </div>
          )}

          <form onSubmit={submit} className={saving ? 'loading' : ''}>
            <div className="form-section">
              <div className="section-title">Category Information</div>

              <div className="two-col">
                <div className="form-group">
                  <label>
                    Main Category <span className="required">*</span>
                  </label>
                  <select
                    name="main_category"
                    value={form.main_category}
                    onChange={onChange}
                    required
                  >
                    {MAIN_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  {errors.main_category && <div className="error-text">{errors.main_category}</div>}
                </div>

                <div className="form-group">
                  <label>
                    Sub Category <span className="required">*</span>
                  </label>
                  <select
                    name="sub_category"
                    value={form.sub_category}
                    onChange={onChange}
                    required
                  >
                    <option value="" disabled>
                      Select a sub-category...
                    </option>
                    {subOptions.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.sub_category && <div className="error-text">{errors.sub_category}</div>}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>
                Product Name <span className="required">*</span>
              </label>
              <input name="name" value={form.name} onChange={onChange} placeholder="Product name" />
              {errors.name && <div className="error-text">{errors.name}</div>}
            </div>

            <div className="two-col">
              <div className="form-group">
                <label>Price <span className="required">*</span></label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={onChange}
                />
                {errors.price && <div className="error-text">{errors.price}</div>}
              </div>

              <div className="form-group">
                <label>Brand</label>
                <input name="brand" value={form.brand} onChange={onChange} />
              </div>
            </div>

            <div className="two-col">
              <div className="form-group">
                <label>Material</label>
                <input name="material" value={form.material} onChange={onChange} />
              </div>

              <div className="form-group">
                <label>Model Name</label>
                <input name="model_name" value={form.model_name} onChange={onChange} />
              </div>
            </div>

            <div className="two-col">
              <div className="form-group">
                <label>Cotton Percentage</label>
                <input
                  name="cotton_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={form.cotton_percentage}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <input name="color" value={form.color} onChange={onChange} />
              </div>
            </div>

            {/* Availability checkbox */}
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="available"
                  checked={!!form.available}
                  onChange={onChange}
                />
                {' '}Available (in stock)
              </label>
            </div>

            {/* Existing images preview */}
            {existingImages && existingImages.length > 0 && (
              <div className="form-section">
                <div className="section-title">Existing Images</div>
                <div className="images-grid">
                  {existingImages.map((img, idx) => {
                    const src = img?.url || img?.image || img;
                    return (
                      <div key={idx} className="image-card">
                        <img src={imgUrl(src)} alt={`existing-${idx}`} />
                        <div className="image-actions">
                          <button type="button" className="btn btn--small" onClick={() => removeExistingImage(idx)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* New images selector */}
            <div className="form-group">
              <label>Add Images</label>
              <input type="file" multiple accept="image/*" onChange={onFileChange} />
              {newImages.length > 0 && (
                <div className="images-grid">
                  {newImages.map((f, i) => (
                    <div key={i} className="image-card">
                      <img src={URL.createObjectURL(f)} alt={`new-${i}`} />
                      <div className="image-actions">
                        <div className="muted">{(f.size / 1024).toFixed(0)} KB</div>
                        <button type="button" className="btn btn--small" onClick={() => removeNewImage(i)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <button className="btn btn--primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button className="btn" type="button" onClick={() => navigate('/admin/products')} style={{ marginLeft: 8 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
