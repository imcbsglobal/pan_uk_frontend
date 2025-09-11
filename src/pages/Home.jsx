import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from "../context/CartContext.jsx";
import bannerVideo from "../assets/banner.mp4";
import './Home.scss';

const apiBase = import.meta.env.VITE_API_URL || 'https://panukonline.com';
const api = axios.create({ baseURL: apiBase });

/* --------------------------
   Helper utilities
   -------------------------- */
function slugify(txt = '') {
  // Make safe slugs: 'kids&boys' -> 'kids-boys'
  return String(txt)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric (including & and spaces) with '-'
    .replace(/^-+|-+$/g, '')     // trim leading/trailing dashes
    .replace(/-+/g, '-');        // collapse multiple dashes
}

function imgUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${apiBase}${path}`;
}

/* --------------------------
   Category image & discount maps
   -------------------------- */
const CATEGORY_IMAGE_MAP = {
  "Shirt": "https://img.guess.com/image/upload/f_auto,q_auto,fl_strip_profile,e_sharpen:50,,w_800,c_scale/v1/EU/Style/ECOMM/M2YH44WERX0-G7V2",
  "T-Shirt": "https://avatars.mds.yandex.net/i?id=c6308da86b1d608d7b99f496d84fa24b2f6a26d6-5888219-images-thumbs&n=13",
  "Jeans": "https://img.joomcdn.net/bad4a5bc1a5d76e0eba415e65d96c7b569dcaa74_original.jpeg",
  "Cotton Pant": "https://thehouseofrare.com/cdn/shop/products/IMG_0313_4f8d3323-e94d-417e-8da0-4019b31249ff.jpg?v=1689145478",
  "Footwear": "https://i5.walmartimages.com/asr/1ff97059-331f-417e-bdd2-4efd1336ae00.c648244e6bfa27c296b8756a65dfe1ef.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
  "Co-ords": "https://i.pinimg.com/736x/ea/af/60/eaaf60ba914e1c2aef7ac0f566c1b973.jpg",
  "Watches": "https://avatars.mds.yandex.net/i?id=b1841c27fdec5cbfd117ecdbc635f7d1ad110da2-5008667-images-thumbs&n=13",
  "Track": "https://img.joomcdn.net/bda934a74d164ddd24acd823795571480d8ccf79_original.jpeg",
  "Caps": "https://cdn1.ozone.ru/s3/multimedia-r/6423413127.jpg",
  "Jewellery": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn7-XnceHQIsAmp2DxWMJ9ipDfo1rO4rOl-aQU3o9E8hQvr_B0",
  "Sunglasses": "https://cdnimpuls.com/o.anabel.al/media3/-785-0-5f311288b5232.png",
  "Wallets": "https://i.etsystatic.com/21490334/r/il/0be459/2377873457/il_794xN.2377873457_8hti.jpg",
  "Combo set": "https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcT9u0z4_AyddfScwmfZ0lryvGJHhyeTSq7qc9Vq5ioC9psVxoNp",
  "Pants": "https://i.ytimg.com/vi/emXL_7_xVRQ/maxresdefault.jpg",
  "Shorts": "https://img.joomcdn.net/1a21a3923b5d44859c71ee045f81fd020ffd5be4_original.jpeg",
  "Belt": "https://a.lmcdn.ru/pi/img600x866/M/P/MP002XW118Q3_11495663_9_v3_2x.jpg",
  "Suit": "https://fashionhot.club/uploads/posts/2022-11/1668782153_49-fashionhot-club-p-temno-serii-klassicheskii-kostyum-53.jpg",
  "Sherwani": "https://i.pinimg.com/originals/21/c5/b2/21c5b257e9871fae6249dd931e4f947c.jpg",
  "Jodhpuri": "https://images.sareeswholesale.com/Navy-Blue-Thread-Work-Art-Silk-3-Pcs-Jodhpuri-Set-196734.jpg",
  "Kurthas": "https://rukminim2.flixcart.com/image/850/1000/xif0q/ethnic-set/z/3/v/xxl-kurta-and-pyjama-set-crystal-revenue-original-imagrhfmcmhrnhwt.jpeg?q=90&crop=false",
  "Dress code": "https://sc04.alicdn.com/kf/H5178d65553c9407395b9e46362f08b631/220502705/H5178d65553c9407395b9e46362f08b631.jpg",
  "Jacket": "https://avatars.mds.yandex.net/i?id=12467a8d9a2902b6eb71e9dbd656a905_l-5022489-images-thumbs&ref=rim&n=13&w=1500&h=2000",
  "Perfume": "https://i.pinimg.com/736x/da/93/25/da9325eab79b8f642caa0c15937735b9--product-photography-conceptual-photography.jpg",
  "Lotion": "https://avatars.mds.yandex.net/i?id=8da63c3bc850f5528f0e36b26088f6f2188f763a-10088009-images-thumbs&ref=rim&n=33&w=201&h=250",

  // SINGLE combined category (exact name: "kids&boys")
  "kids&boys": "https://avatars.mds.yandex.net/i?id=9c276447320e36d5b5f3d382bbbb07aa_l-8219723-images-thumbs&ref=rim&n=13&w=900&h=1200",
};

const CATEGORY_DISCOUNT_MAP = {
  "Cotton Pant": "Cotton Pant",
  "T-Shirt": "T-Shirt",
  "Jeans": "Jeans",
  "Footwear": "Footwear",
  "Watches": "Watches",
  "Shirt": "Shirt",
  "Co-ords": "Co-ords",
  "Track": "Trackt",
  "Jewellery": "Jewellery",
  "Sunglasses": "Sunglasses",
  "Wallets": "Wallets",
  "Combo set": "Combo set",
  "Pants": "Pants",
  "Shorts": "Shorts",
  "Belt": "Belt",
  "Suit": "Suit",
  "Sherwani": "Sherwani",
  "Jodhpuri": "Jodhpuri",
  "Kurthas": "Kurthas",
  "Dress code": "Dress codes",
  "Jacket": "Jacket",
  "Perfume": "Perfume",
  "Lotion": "Lotion",
  "Caps": "Caps",

  // NEW single label for combined kids & boys category
  "kids&boys": "Kids & Boys",
};

const CATEGORY_IMAGE_FALLBACK = "https://via.placeholder.com/800x1000?text=Category+Image";
const DEFAULT_DISCOUNT = "";

/* --------------------------
   Component
   -------------------------- */
export default function Home() {
  const navigate = useNavigate();
  const { addItem } = useCart ? useCart() : { addItem: () => {} };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Build categories array — ensure exact "kids&boys" string is included.
  const categories = useMemo(() => {
    const list = [
      "Shirt","T-Shirt","Jeans","Cotton Pant","Footwear","Co-ords","Watches","Track","Caps",
      "Jewellery","Sunglasses","Wallets","Combo set","Pants","Shorts","Belt","Suit","Sherwani",
      "Jodhpuri","Kurthas","Dress code","Jacket","Perfume","Lotion",
      // <-- exact string the app should show
      "kids&boys",
    ];
    // keep unique and return
    const unique = list.filter((v, i, a) => a.indexOf(v) === i);
    // debug: uncomment if you need to verify in browser console
    // console.log('Home.jsx - categories:', unique);
    return unique;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access');
    api.get('/api/products/', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setItems(res.data || []))
      .catch((err) => {
        console.error('Failed to load products', err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const goCategory = (name) => {
    const slug = slugify(name || '');
    navigate(`/category/${slug}`, { state: { raw: name }});
  };

  const goProduct = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <>
      <Navbar />

      {/* VIDEO BANNER */}
      <section className="video-banner">
        <div className="video-container">
          <video
            className="banner-video"
            autoPlay
            muted
            playsInline
            onEnded={(e) => { e.target.currentTime = 0; e.target.play(); }}
          >
            <source src={bannerVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          <div className="video-overlay">
            <div className="banner-content">
              <h1 className="banner-title">Welcome to Our Store</h1>
              <p className="banner-subtitle">Shop trending collections &amp; amazing offers</p>
              <button className="cta-button" onClick={() => goCategory(categories[0] || 'all')}>
                Shop Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Categories</h2>
            <p className="section-subtitle">Explore bestselling categories</p>
          </div>

          <div className="categories-grid">
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((category, index) => {
                const categoryName = typeof category === 'string' ? category : (category.name || category.title || '');
                // lookup image by the exact category name; fallback to placeholder
                const imgSrc = CATEGORY_IMAGE_MAP.hasOwnProperty(categoryName)
                  ? CATEGORY_IMAGE_MAP[categoryName]
                  : CATEGORY_IMAGE_FALLBACK;

                const discount = CATEGORY_DISCOUNT_MAP[categoryName] || DEFAULT_DISCOUNT;

                return (
                  <div
                    className="category-card"
                    key={`${categoryName}-${index}`}
                    onClick={() => goCategory(categoryName)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => { if (e.key === 'Enter') goCategory(categoryName); }}
                  >
                    <div className="category-media" aria-hidden>
                      <img src={imgSrc} alt={categoryName} loading="lazy" />
                    </div>

                    <div className="category-label">
                      <span>{categoryName}</span>
                    </div>

                    <div className="category-banner">
                      <div className="banner-text">
                        <div className="discount">{discount}</div>
                        <div className="shop-now">Shop Now</div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-cats">No categories available</div>
            )}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Handpicked just for you</p>
          </div>

          <div className="products-grid">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="loading-text">Loading products...</p>
              </div>
            ) : (
              items.slice(0, 16).map((p) => {
                const first = p.images?.[0];
                const src = first ? (first.url || imgUrl(first.image)) : '';
                return (
                  <div
                    className="product-card"
                    key={p.id}
                    onClick={() => goProduct(p.id)}
                  >
                    <div className="product-image">
                      {src ? (
                        <img src={src} alt={p.name} loading="lazy" />
                      ) : (
                        <img src="https://via.placeholder.com/400x500?text=No+Image" alt={p.name} loading="lazy" />
                      )}

                      <div className="product-overlay">
                        <button
                          className="btn ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            goProduct(p.id);
                          }}
                        >
                          Quick View
                        </button>
                      </div>
                    </div>

                    <div className="product-info">
                      <h3 className="product-title" title={p.name}>{p.name}</h3>

                      <div className="product-meta">
                        {p.brand && <span className="brand">{p.brand}</span>}
                        {(p.main_category || p.sub_category) && (
                          <div className="product-categories">
                            {p.main_category && (
                              <span className="category-tag main">{p.main_category}</span>
                            )}
                            {p.sub_category && (
                              <span className="category-tag sub">{p.sub_category}</span>
                            )}
                          </div>
                        )}
                        {p.description && (
                          <p className="product-desc">
                            {String(p.description).slice(0, 70)}
                            {String(p.description).length > 70 ? '…' : ''}
                          </p>
                        )}
                      </div>

                      <div className="product-bottom">
                        <div className="product-price">₹ {Number(p.price).toFixed(2)}</div>

                        <div className="actions">
                          <button
                            className="btn outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              goProduct(p.id);
                            }}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="view-all-products">
            <button
              className="view-all-btn"
              onClick={() => navigate('/all-products')}
            >
              View More Products
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
