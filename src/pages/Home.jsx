import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.scss';

function Home() {
  return (
    <>
      <Navbar />
      
      {/* Video Banner Section */}
      <section className="video-banner">
        <div className="video-container">
          <video 
            className="banner-video" 
            autoPlay 
            muted 
            loop 
            playsInline
          >
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
              <button className="cta-button">Get Started</button>
            </div>
          </div>
        </div>
      </section>

      <section className="categories-section">
  <div className="container">
    <div className="section-header">
      <h2 className="section-title">Shop by Categories</h2>
      <p className="section-subtitle">Discover our wide range of premium fashion collections</p>
    </div>
    <div className="categories-grid">
      <div className="category-card">
        <div className="category-image">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center" alt="Men's Wear" />
        </div>
        <h3 className="category-title">Men's Wear</h3>
      </div>

      <div className="category-card">
        <div className="category-image">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center" alt="IMT" />
        </div>
        <h3 className="category-title">IMT</h3>
      </div>

      <div className="category-card">
        <div className="category-image">
          <img src="https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=400&h=400&fit=crop&crop=center" alt="Co-ord Set" />
        </div>
        <h3 className="category-title">Co-ord Set</h3>
      </div>

      <div className="category-card">
        <div className="category-image">
          <img src="https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=400&h=400&fit=crop&crop=center" alt="Wedding Suit" />
        </div>
        <h3 className="category-title">Wedding Suit</h3>
      </div>

      <div className="category-card">
        <div className="category-image">
          <img src="https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=400&fit=crop&crop=center" alt="Kids Boys" />
        </div>
        <h3 className="category-title">Kids Boys</h3>
      </div>

      <div className="category-card">
        <div className="category-image">
          <img src="https://images.unsplash.com/photo-1556306535-38febf6782e7?w=400&h=400&fit=crop&crop=center" alt="Accessories" />
        </div>
        <h3 className="category-title">Accessories</h3>
      </div>

      <div className="category-card">
        <div className="category-image">
          <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center" alt="Footwear" />
        </div>
        <h3 className="category-title">Footwear</h3>
      </div>

      <div className="category-card">
        <div className="category-image">
          <img src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop&crop=center" alt="Crocs" />
        </div>
        <h3 className="category-title">Crocs</h3>
      </div>

      <div className="category-card">
        <div className="category-image">
          <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&crop=center" alt="Watch" />
        </div>
        <h3 className="category-title">Watch</h3>
      </div>

      <div className="category-card">
        <div className="category-image">
          <img src="https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=400&fit=crop&crop=center" alt="Cap" />
        </div>
        <h3 className="category-title">Cap</h3>
      </div>

      <div className="category-card">
        <div className="category-image">
          <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&crop=center" alt="Jewellery" />
        </div>
        <h3 className="category-title">Jewellery</h3>
      </div>

      <div className="category-card">
        <div className="category-image">
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center" alt="Combo" />
        </div>
        <h3 className="category-title">Combo</h3>
      </div>
    </div>
  </div>
</section>

{/* Products Section */}
<section className="products-section">
  <div className="container-fuild">
    <div className="section-header">
      <h2 className="section-title">Featured Products</h2>
      <p className="section-subtitle">Discover our latest collection of premium fashion</p>
    </div>
    <div className="products-grid">
      <div className="product-card">
        <div className="product-image">
          <img src="https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop&crop=center" alt="Drift Fit Polyester Stretch Dobby Trouser" />
          <div className="product-overlay">
            <button className="quick-view-btn">Quick View</button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-title">Drift Fit Polyester Stretch Dobby Trouser</h3>
          <div className="product-price">₹ 2,499</div>
          <div className="product-colors">
            <span className="color-option" style={{backgroundColor: '#2c3e50'}}></span>
            <span className="color-option" style={{backgroundColor: '#34495e'}}></span>
            <span className="color-count">+3</span>
          </div>
        </div>
      </div>

      <div className="product-card">
        <div className="product-image">
          <img src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop&crop=center" alt="Slim Fit Cotton Seersucker Dobby Shirt" />
          <div className="product-overlay">
            <button className="quick-view-btn">Quick View</button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-title">Slim Fit Cotton Seersucker Dobby Shirt</h3>
          <div className="product-price">₹ 2,399</div>
          <div className="product-colors">
            <span className="color-option" style={{backgroundColor: '#ecf0f1'}}></span>
            <span className="color-option" style={{backgroundColor: '#d4c5b9'}}></span>
            <span className="color-count">+3</span>
          </div>
        </div>
      </div>

      <div className="product-card">
        <div className="product-image">
          <img src="https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop&crop=center" alt="Drift Fit Cotton Stretch Jean" />
          <div className="product-overlay">
            <button className="quick-view-btn">Quick View</button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-title">Drift Fit Cotton Stretch Jean</h3>
          <div className="product-price">₹ 2,899</div>
          <div className="product-colors">
            <span className="color-option" style={{backgroundColor: '#2c3e50'}}></span>
            <span className="color-option" style={{backgroundColor: '#34495e'}}></span>
            <span className="color-count">+1</span>
          </div>
        </div>
      </div>

      <div className="product-card">
        <div className="product-image">
          <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=center" alt="Premium Casual Blazer" />
          <div className="product-overlay">
            <button className="quick-view-btn">Quick View</button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-title">Premium Casual Blazer</h3>
          <div className="product-price">₹ 3,999</div>
          <div className="product-colors">
            <span className="color-option" style={{backgroundColor: '#2c3e50'}}></span>
            <span className="color-option" style={{backgroundColor: '#8b4513'}}></span>
            <span className="color-count">+2</span>
          </div>
        </div>
      </div>

      <div className="product-card">
        <div className="product-image">
          <img src="https://images.unsplash.com/photo-1621976360623-004223992275?w=400&h=500&fit=crop&crop=center" alt="Classic Formal Shirt" />
          <div className="product-overlay">
            <button className="quick-view-btn">Quick View</button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-title">Classic Formal Shirt</h3>
          <div className="product-price">₹ 1,899</div>
          <div className="product-colors">
            <span className="color-option" style={{backgroundColor: '#ffffff', border: '1px solid #ddd'}}></span>
            <span className="color-option" style={{backgroundColor: '#87ceeb'}}></span>
            <span className="color-count">+4</span>
          </div>
        </div>
      </div>

      <div className="product-card">
        <div className="product-image">
          <img src="https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop&crop=center" alt="Comfort Fit Chino Pants" />
          <div className="product-overlay">
            <button className="quick-view-btn">Quick View</button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-title">Comfort Fit Chino Pants</h3>
          <div className="product-price">₹ 2,199</div>
          <div className="product-colors">
            <span className="color-option" style={{backgroundColor: '#d4c5b9'}}></span>
            <span className="color-option" style={{backgroundColor: '#2c3e50'}}></span>
            <span className="color-count">+3</span>
          </div>
        </div>
      </div>

      <div className="product-card">
        <div className="product-image">
          <img src="https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=500&fit=crop&crop=center" alt="Premium Polo T-Shirt" />
          <div className="product-overlay">
            <button className="quick-view-btn">Quick View</button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-title">Premium Polo T-Shirt</h3>
          <div className="product-price">₹ 1,599</div>
          <div className="product-colors">
            <span className="color-option" style={{backgroundColor: '#2c3e50'}}></span>
            <span className="color-option" style={{backgroundColor: '#e74c3c'}}></span>
            <span className="color-count">+5</span>
          </div>
        </div>
      </div>

      <div className="product-card">
        <div className="product-image">
          <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop&crop=center" alt="Classic Denim Jacket" />
          <div className="product-overlay">
            <button className="quick-view-btn">Quick View</button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-title">Classic Denim Jacket</h3>
          <div className="product-price">₹ 3,499</div>
          <div className="product-colors">
            <span className="color-option" style={{backgroundColor: '#4682b4'}}></span>
            <span className="color-option" style={{backgroundColor: '#2c3e50'}}></span>
            <span className="color-count">+2</span>
          </div>
        </div>
      </div>

      <div className="product-card">
        <div className="product-image">
          <img src="https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop&crop=center" alt="Summer Casual Shorts" />
          <div className="product-overlay">
            <button className="quick-view-btn">Quick View</button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-title">Summer Casual Shorts</h3>
          <div className="product-price">₹ 1,299</div>
          <div className="product-colors">
            <span className="color-option" style={{backgroundColor: '#d4c5b9'}}></span>
            <span className="color-option" style={{backgroundColor: '#2c3e50'}}></span>
            <span className="color-count">+4</span>
          </div>
        </div>
      </div>

      <div className="product-card">
        <div className="product-image">
          <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&crop=center" alt="Long Sleeve Henley T-Shirt" />
          <div className="product-overlay">
            <button className="quick-view-btn">Quick View</button>
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-title">Long Sleeve Henley T-Shirt</h3>
          <div className="product-price">₹ 1,799</div>
          <div className="product-colors">
            <span className="color-option" style={{backgroundColor: '#2c3e50'}}></span>
            <span className="color-option" style={{backgroundColor: '#95a5a6'}}></span>
            <span className="color-count">+3</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      
      <Footer />
    </>
  );
}

export default Home;