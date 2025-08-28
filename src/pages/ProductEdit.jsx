import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';
import './ProductForm.scss';
import { CATEGORY_MAP, MAIN_CATEGORIES } from '../utils/categories';

const apiBase = import.meta.env.VITE_API_URL || 'https://panukonline.com';
const api = axios.create({ baseURL: apiBase });

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
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const subOptions = useMemo(() => CATEGORY_MAP[form.main_category] || [], [form.main_category]);

  useEffect(() => {
    const token = localStorage.getItem('access');
    api.get(`/api/products/${id}/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => {
        const p = res.data;
        setForm({
          main_category: p.main_category,
          sub_category: p.sub_category,
          name: p.name,
          price: p.price,
          brand: p.brand || '',
          material: p.material || '',
          model_name: p.model_name || '',
          cotton_percentage: p.cotton_percentage ?? '',
          color: p.color || '',
          size: p.size || '',
          weight: p.weight || '',
          description: p.description || '',
        });
        setExistingImages(p.images || []);
      })
      .catch(() => setErrors({ general: 'Failed to load product' }))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setForm(prev => ({ ...prev, sub_category: '' }));
  }, [form.main_category]);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const onFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setNewImages(newFiles);
  };

  const removeNewImage = (indexToRemove) => {
    setNewImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
      newImages.forEach(file => fd.append('images', file));

      const token = localStorage.getItem('access');
      await api.put(`/api/products/${id}/`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/admin/products');
    } catch (err) {
      setErrors({ general: err.response?.data?.detail || 'Failed to save changes' });
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
              <div className="loading-spinner"></div>
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
            <div className="general-error">{errors.general}</div>
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
                    {MAIN_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                  {errors.main_category && (
                    <div className="error-text">{errors.main_category}</div>
                  )}
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
                    <option value="" disabled>Select a sub-category...</option>
                    {subOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.sub_category && (
                    <div className="error-text">{errors.sub_category}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">Basic Information</div>
              
              <div className="form-group">
                <label>
                  Product Name <span className="required">*</span>
                </label>
                <input 
                  name="name" 
                  value={form.name} 
                  onChange={onChange} 
                  placeholder="e.g., Classic Slim Fit Cotton Shirt" 
                />
                {errors.name && (
                  <div className="error-text">{errors.name}</div>
                )}
              </div>

              <div className="two-col">
                <div className="form-group">
                  <label>
                    Price <span className="required">*</span>
                  </label>
                  <div className="price-field-wrapper">
                    <input 
                      name="price" 
                      type="number" 
                      step="0.01" 
                      value={form.price} 
                      onChange={onChange} 
                      placeholder="999.00" 
                    />
                  </div>
                  {errors.price && (
                    <div className="error-text">{errors.price}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Brand <span className="optional">(optional)</span>
                  </label>
                  <input 
                    name="brand" 
                    value={form.brand} 
                    onChange={onChange} 
                    placeholder="e.g., Nike, Adidas"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">Product Details</div>
              
              <div className="two-col">
                <div className="form-group">
                  <label>
                    Material <span className="optional">(optional)</span>
                  </label>
                  <input 
                    name="material" 
                    value={form.material} 
                    onChange={onChange} 
                    placeholder="e.g., 100% Cotton"
                  />
                </div>

                <div className="form-group">
                  <label>Model Name <span className="optional">(optional)</span></label>
                  <input
                    name="model_name"
                    value={form.model_name}
                    onChange={onChange}
                    placeholder="e.g., 511 Slim, Air Max 90"
                  />
                </div>
              </div>

              <div className="two-col">
                <div className="form-group">
                  <label>Cotton Percentage <span className="optional">(optional)</span></label>
                  <div className="cotton-field-wrapper">
                    <input
                      name="cotton_percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={form.cotton_percentage}
                      onChange={onChange}
                      placeholder="80"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Color <span className="optional">(optional)</span>
                  </label>
                  <input 
                    name="color" 
                    value={form.color} 
                    onChange={onChange} 
                    placeholder="e.g., Navy Blue, White"
                  />
                </div>
              </div>

              <div className="two-col">
                <div className="form-group">
                  <label>
                    Size <span className="optional">(optional)</span>
                  </label>
                  <input 
                    name="size" 
                    value={form.size} 
                    onChange={onChange} 
                    placeholder="e.g., S, M, L, XL"
                  />
                </div>

                <div className="form-group">
                  <label>
                    Weight <span className="optional">(optional)</span>
                  </label>
                  <input 
                    name="weight" 
                    value={form.weight} 
                    onChange={onChange} 
                    placeholder="e.g., 250g"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  Description <span className="optional">(optional)</span>
                </label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={onChange} 
                  rows={4}
                  placeholder="Describe the product features, materials, fit, and other details..."
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">Product Images</div>
              
              <div className="form-group">
                <label>Current Images</label>
                {existingImages.length > 0 ? (
                  <div className="existing-images-grid">
                    {existingImages.map((img, index) => (
                      <div key={img.id || index} className="existing-image-card">
                        <img 
                          src={img.url || imgUrl(img.image)} 
                          alt={`Product image ${index + 1}`}
                          className="existing-image"
                        />
                        <div className="image-overlay">
                          <span className="image-label">Image {index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-images-message">
                    <div className="no-images-icon">🖼️</div>
                    <div className="no-images-text">No images uploaded yet</div>
                    <div className="no-images-subtext">Add some images to showcase your product</div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Add New Images</label>
                <div className={`image-upload-section ${newImages.length > 0 ? 'has-files' : ''}`}>
                  <label htmlFor="image-upload" className="upload-label">
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">
                      {newImages.length > 0 ? 'Add More Images' : 'Upload New Images'}
                    </div>
                    <div className="upload-subtext">
                      Click to browse or drag and drop multiple images
                    </div>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFileChange}
                  />
                  
                  {newImages.length > 0 && (
                    <div className="image-preview-grid">
                      {newImages.map((file, index) => (
                        <div key={index} className="image-preview-card">
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => removeNewImage(index)}
                            title="Remove image"
                          >
                            ×
                          </button>
                          <div className="image-icon">🖼️</div>
                          <div className="image-name">{file.name}</div>
                          <div className="image-size">{formatFileSize(file.size)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              disabled={saving}
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}