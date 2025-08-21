import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.scss';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const api = axios.create({ baseURL: apiBase });

function slugify(txt = '') {
  return String(txt).toLowerCase().replace(/\s+/g, '-');
}
function imgUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${apiBase}${path}`;
}

export default function Home() {
  const navigate = useNavigate();

  // Featured products
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // static list you already had
  const categories = useMemo(() => ([
    "Shirt","T-Shirt","Jeans","Cotton Pant","Footwear","Co-ords","Watches","Track","Caps",
    "Jewellery","Sunglasses","Wallets","Combo set","Pants","Shorts","Belt","Suit","Sherwani",
    "Jodhpuri","Kurthas","Dress code","Jacket","Perfume","Lotion",
  ].filter((v, i, a) => a.indexOf(v) === i)), []);

  const images = {
    "Shirt": "https://avatars.mds.yandex.net/i?id=5c76768530d0bb6b2bfd944b0b4c01be05f64263-15273796-images-thumbs&n=13",
    "T-Shirt": "https://threadcurve.com/wp-content/uploads/2020/06/types-of-t-shirts-June252020-1-min.jpg",
    "Jeans": "https://avatars.mds.yandex.net/i?id=12ca4c51bac06cb8e7320723ebb31863520e7562-5294211-images-thumbs&n=13",
    "Cotton Pant": "https://avatars.mds.yandex.net/i?id=f794272c1a0f622dbeba3a7ec4faae4590c1d34b-10576314-images-thumbs&n=13",
    "Footwear": "https://avatars.mds.yandex.net/i?id=c980cc0f23b52ede5f8e17700b04a34b0d653726-5524434-images-thumbs&n=13",
    "Co-ords": "https://avatars.mds.yandex.net/i?id=5cf076039615d9e29be5a61f8f8c3819c34c0b66-4266390-images-thumbs&n=13",
    "Watches": "https://avatars.mds.yandex.net/i?id=b280c5c152e73ed68d3e2d058df4a2738588dbdf-4432378-images-thumbs&n=13",
    "Track": "https://avatars.mds.yandex.net/i?id=34958bbc815f723e69c42771d58b27b0a2b35ab5-12474456-images-thumbs&n=13",
    "Caps": "https://avatars.mds.yandex.net/i?id=3105fd968064bc197bbd8abe1cfe85a6b98bc5db7d9e1bb3-12530517-images-thumbs&n=13",
    "Jewellery": "https://avatars.mds.yandex.net/i?id=aac501e3aa6355247e80366cb9534abc5413c1ca-7094423-images-thumbs&n=13",
    "Sunglasses": "https://avatars.mds.yandex.net/i?id=df45a19acc0a41c5ff9f745b266ed6c711c94adb-4580574-images-thumbs&n=13",
    "Wallets": "https://avatars.mds.yandex.net/i?id=522af53e28f6007585df5b35cc6807a03ba922ee-8255800-images-thumbs&n=13",
    "Combo set": "https://avatars.mds.yandex.net/i?id=c20ff565c49f1371c8c3c3cf417eddfa7343f8cd-6959765-images-thumbs&n=13",
    "Pants": "https://avatars.mds.yandex.net/i?id=1e85b06aeb0859683c1be0a724d2b5ee4d81e56c-4568431-images-thumbs&n=13",
    "Shorts": "https://avatars.mds.yandex.net/i?id=8e9f532140c0ad0e811914d38f89f287450ac803-10456573-images-thumbs&n=13",
    "Belt": "https://avatars.mds.yandex.net/i?id=1af1a8c0495302c5f7d4d7ba22a7d03f183630ca-9185952-images-thumbs&n=13",
    "Suit": "https://avatars.mds.yandex.net/i?id=57c2afbfa5e4b05a12f0ca4a9aa3c82f4c776166-5298842-images-thumbs&n=13",
    "Sherwani": "https://avatars.mds.yandex.net/i?id=ae5ce3a99bed2cb044cf89a67d1f0547a2244da7-5437458-images-thumbs&n=13",
    "Jodhpuri": "https://avatars.mds.yandex.net/i?id=44460250d1758fab14d2713e2c0500d9373b8d85-12347000-images-thumbs&n=13",
    "Kurthas": "https://avatars.mds.yandex.net/i?id=a18891cd007b8331e65298eca2e4108600f37f8d-9229079-images-thumbs&n=13",
    "Dress code": "https://avatars.mds.yandex.net/i?id=794617b79a5b7b32bb4224d97c4ff891e38ad380-12421240-images-thumbs&n=13",
    "Jacket": "https://avatars.mds.yandex.net/i?id=b160d192a607a291524398ab408f3a53c12287a8-5277625-images-thumbs&n=13",
    "Perfume": "https://avatars.mds.yandex.net/i?id=956c0fc59bd7e39b5feff9dec271e4e2-5245347-images-thumbs&n=13",
    "Lotion": "https://avatars.mds.yandex.net/i?id=324083e619add493028bfacab69e147ec9acc371-11395806-images-thumbs&n=13",
  };

  useEffect(() => {
    const token = localStorage.getItem('access');
    api.get('/api/products/', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setItems(res.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // click handlers
  const goCategory = (name) => navigate(`/category/${slugify(name)}`, { state: { raw: name } });
  const goProduct = (id) => navigate(`/product/${id}`);

  return (
    <>
      <Navbar />

      {/* Video Banner Section */}
      <section className="video-banner">
        <div className="video-container">
          <video className="banner-video" autoPlay muted loop playsInline>
            <source
              src="https://videos.pexels.com/video-files/853800/853800-hd_1920_1080_25fps.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>

          {/* Overlay content */}
          <div className="video-overlay">
            <div className="banner-content">
              <h1 className="banner-title">Welcome to Our Website</h1>
              <p className="banner-subtitle">Discover amazing experiences with us</p>
              <button className="cta-button" onClick={() => goCategory('Shirt')}>
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section (clickable) */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Categories</h2>
            <p className="section-subtitle">Discover our wide range of premium fashion collections</p>
          </div>

          <div className="categories-grid">
            {categories.map((category, index) => (
              <div
                className="category-card"
                key={index}
                onClick={() => goCategory(category)}
                role="button"
              >
                <div className="category-image">
                  <img src={images[category]} alt={category} />
                </div>
                <h3 className="category-title">{category}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section (Featured Products) */}
      <section className="products-section">
        <div className="container-fuild">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Discover our latest collection of premium fashion</p>
          </div>

          <div className="products-grid">
            {loading ? (
              <div>Loading…</div>
            ) : (
              items.slice(0, 8).map((p) => {
                const first = p.images?.[0];
                const src = first ? (first.url || imgUrl(first.image)) : '';
                return (
                  <div className="product-card" key={p.id} onClick={() => goProduct(p.id)}>
                    <div className="product-image">
                      {src ? (
                        <img src={src} alt={p.name} />
                      ) : (
                        <img
                          src="https://via.placeholder.com/400x500?text=No+Image"
                          alt={p.name}
                        />
                      )}

                      {/* Overlay to preserve your style */}
                      <div className="product-overlay">
                        <button className="quick-view-btn">Quick View</button>
                      </div>
                    </div>

                    <div className="product-info">
                      {/* product name */}
                      <h3 className="product-title">{p.name}</h3>

                      {/* main category */}
                      {p.main_category ? (
                        <div style={{ fontSize: 13, color: '#495057', marginBottom: 4 }}>
                          {p.main_category}
                        </div>
                      ) : null}

                      {/* sub category */}
                      {p.sub_category ? (
                        <div style={{ fontSize: 13, color: '#6c757d', marginBottom: 6 }}>
                          {p.sub_category}
                        </div>
                      ) : null}

                      {/* price */}
                      <div className="product-price">₹ {Number(p.price).toFixed(2)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}
