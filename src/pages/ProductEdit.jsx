import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';
import './ProductForm.scss';
import { CATEGORY_MAP, MAIN_CATEGORIES } from '../utils/categories';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
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

  const onChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const onFileChange = (e) => setNewImages(Array.from(e.target.files || []));

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Product Name is required';
    if (!form.main_category) e.main_category = 'Main Category is required';
    if (!form.sub_category) e.sub_category = 'Sub Category is required';
    if (!form.price || isNaN(Number(form.price))) e.price = 'Valid price is required';
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
        <div style={{ padding:24 }}>Loading…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="products">
      <div className="product-form" style={{ padding: 24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h2 style={{ margin:0 }}>Edit Product</h2>
          <button onClick={() => navigate('/admin/products')} style={{ border:'none', background:'transparent', cursor:'pointer', textDecoration:'underline' }}>
            Back to Products
          </button>
        </div>

        {errors.general && <div style={{ color:'#b00020', marginBottom:12 }}>{errors.general}</div>}

        <form onSubmit={submit} style={{ display:'grid', gap:16, maxWidth:800 }}>
          {/* fields identical to create form */}
          <div>
            <label> Main Category *</label>
            <select name="main_category" value={form.main_category} onChange={onChange} required>
              {MAIN_CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label> Sub Category *</label>
            <select name="sub_category" value={form.sub_category} onChange={onChange} required>
              <option value="" disabled>Select...</option>
              {subOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div><label> Product Name *</label><input name="name" value={form.name} onChange={onChange} /></div>
          <div><label> Price *</label><input name="price" type="number" step="0.01" value={form.price} onChange={onChange} /></div>
          <div><label>Brand</label><input name="brand" value={form.brand} onChange={onChange} /></div>
          <div><label>Material</label><input name="material" value={form.material} onChange={onChange} /></div>
          <div><label>Color</label><input name="color" value={form.color} onChange={onChange} /></div>
          <div><label>Size</label><input name="size" value={form.size} onChange={onChange} /></div>
          <div><label>Weight</label><input name="weight" value={form.weight} onChange={onChange} /></div>
          <div><label>Description</label><textarea name="description" value={form.description} onChange={onChange} rows={4} /></div>

          <div>
            <label>Existing Images</label>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
              {existingImages.length ? existingImages.map(img => (
                <img key={img.id} src={img.url || imgUrl(img.image)} alt="" style={{ width:72, height:72, objectFit:'cover', borderRadius:8, border:'1px solid #eee' }} />
              )) : <div style={{ color:'#777' }}>No images uploaded yet.</div>}
            </div>
          </div>

          <div>
            <label>Add More Images (optional)</label>
            <input type="file" accept="image/*" multiple onChange={onFileChange} />
            <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
              {newImages.map((f, i) => (
                <div key={i} style={{ fontSize:12, background:'#f5f5f5', padding:'4px 8px', borderRadius:8 }}>{f.name}</div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ padding:'10px 16px', border:'none', borderRadius:8, background:'#111', color:'#fff', cursor:'pointer' }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
