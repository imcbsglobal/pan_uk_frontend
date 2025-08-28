import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';
import './ProductForm.scss';
import { CATEGORY_MAP, MAIN_CATEGORIES } from '../utils/categories';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export default function ProductForm() {
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
    size: [],
    footwear_size: [], // NEW footwear sizes
    weight: '',
    description: '',
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const subOptions = useMemo(() => CATEGORY_MAP[form.main_category] || [], [form.main_category]);

  useEffect(() => {
    setForm(prev => ({ ...prev, sub_category: '' }));
  }, [form.main_category]);

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const onFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setImages(newFiles);
  };

  const removeImage = (indexToRemove) => {
    setImages(prev => prev.filter((_, index) => index !== indexToRemove));
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

Object.entries(form).forEach(([k, v]) => {
  if (Array.isArray(v)) {
    // send arrays as JSON strings
    fd.append(k, JSON.stringify(v));
  } else {
    fd.append(k, v ?? '');
  }
});
images.forEach(file => fd.append('images', file));

    const token = localStorage.getItem('access');
    await api.post('/api/products/', fd, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    navigate('/admin/products');
  } catch (err) {
    setErrors({ general: err.response?.data?.detail || 'Failed to save product' });
  } finally {
    setSaving(false);
  }
};



  return (
    <AdminLayout active="products">
      <div className="product-form">
        <div className="top-bar">
          <h2>Add New Product</h2>
          <button 
            className="back-link-btn"
            onClick={() => navigate('/admin/products')}
          >
            Back to Products
          </button>
        </div>

        {errors.general && (
          <div className="general-error">{errors.general}</div>
        )}

        <form onSubmit={submit} className={saving ? 'loading' : ''}>
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
              <input 
                name="price" 
                type="number" 
                step="0.01" 
                value={form.price} 
                onChange={onChange} 
                placeholder="e.g., 999.00" 
              />
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

            <div className="two-col">
  <div className="form-group">
    <label>Model name <span className="optional">(optional)</span></label>
    <input
      name="model_name"
      value={form.model_name}
      onChange={onChange}
      placeholder="e.g., 511 Slim, Air Max 90"
    />
  </div>

  <div className="form-group">
    <label>Cotton percentage <span className="optional">(optional)</span></label>
    <input
      name="cotton_percentage"
      type="number"
      min="0"
      max="100"
      value={form.cotton_percentage}
      onChange={onChange}
      placeholder="e.g., 80"
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
              {["S", "M", "L", "XL", "XXL"].map((sz) => (
                <label key={sz} style={{ marginRight: "10px" }}>
                  <input
                    type="checkbox"
                    value={sz}
                    checked={form.size.includes(sz)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setForm((prev) => {
                        const newSizes = prev.size.includes(value)
                          ? prev.size.filter((s) => s !== value)
                          : [...prev.size, value];
                        return { ...prev, size: newSizes };
                      });
                    }}
                  />
                  {sz}
                </label>
              ))}
            </div>
            <div className="form-group">
    <label>
      Footwear Size <span className="optional">(optional)</span>
    </label>
    {["6", "7", "8", "9", "10", "11"].map((sz) => (
      <label key={sz} style={{ marginRight: "10px" }}>
        <input
          type="checkbox"
          value={sz}
          checked={form.footwear_size.includes(sz)}
          onChange={(e) => {
            const value = e.target.value;
            setForm((prev) => {
              const newSizes = prev.footwear_size.includes(value)
                ? prev.footwear_size.filter((s) => s !== value)
                : [...prev.footwear_size, value];
              return { ...prev, footwear_size: newSizes };
            });
          }}
        />
        {sz}
      </label>
    ))}
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

          <div className="form-group">
            <label>Product Images</label>
            <div className={`image-upload-section ${images.length > 0 ? 'has-files' : ''}`}>
              <label htmlFor="image-upload" className="upload-label">
                <div className="upload-icon">📷</div>
                <div className="upload-text">
                  {images.length > 0 ? 'Add More Images' : 'Upload Product Images'}
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
              
              {images.length > 0 && (
                <div className="image-preview-grid">
                  {images.map((file, index) => (
                    <div key={index} className="image-preview-card">
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeImage(index)}
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

          <button 
            type="submit" 
            className="submit-btn"
            disabled={saving}
          >
            {saving ? 'Creating Product...' : 'Create Product'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}