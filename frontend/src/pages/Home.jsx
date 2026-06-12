import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight, Filter, RotateCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const Home = ({ searchQuery, showToast }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Sorting State
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Hero Slider State
  const [activeSlide, setActiveSlide] = useState(0);

  // Hero Slides Data
  const slides = [
    {
      title: 'Elevate Your Daily Workspace',
      desc: 'Discover our premium curation of ergonomic gear, mechanical keyboards, and ambient studio accessories.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      tag: 'New Arrivals'
    },
    {
      title: 'Acoustic Perfection Redefined',
      desc: 'Immerse yourself in active noise cancellation headphones and high-fidelity smart sound hubs.',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
      tag: 'Tech Spotlight'
    },
    {
      title: 'Crafted for Modern Travelers',
      desc: 'Handcrafted leather travel gear designed to seamlessly store all your devices and daily essentials.',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=80',
      tag: 'Exclusive Collection'
    }
  ];

  // Auto slide interval
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  // Fetch products from backend when filters, search, or sort changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          keyword: searchQuery || '',
          sortBy,
        };

        if (category && category !== 'All') {
          params.category = category;
        }
        if (minPrice) {
          params.minPrice = minPrice;
        }
        if (maxPrice) {
          params.maxPrice = maxPrice;
        }

        const { data } = await axios.get('http://localhost:5000/api/products', { params });
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        showToast('Failed to load products. Running in offline demo mode.', 'warning');
      }
      setLoading(false);
    };

    fetchProducts();
  }, [category, minPrice, maxPrice, sortBy, searchQuery]);

  // Reset Filters
  const handleResetFilters = () => {
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  // Categories list
  const categoriesList = ['All', 'Electronics', 'Home & Living', 'Apparel'];

  return (
    <div className="container">
      {/* Hero Slideshow */}
      <section className="hero-section">
        <div className="hero-slider">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`hero-slide ${idx === activeSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="hero-overlay"></div>
              <div className="hero-content">
                <span className="hero-tag">{slide.tag}</span>
                <h2>{slide.title}</h2>
                <p>{slide.desc}</p>
                <button
                  onClick={() => {
                    document.getElementById('catalog-grid').scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn-primary"
                >
                  Shop Now <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Slider Dots */}
          <div className="hero-controls">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`hero-dot ${idx === activeSlide ? 'active' : ''}`}
                onClick={() => setActiveSlide(idx)}
              ></span>
            ))}
          </div>
        </div>
      </section>

      {/* Category Chips Selector */}
      <div className="categories-container">
        {categoriesList.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`category-chip ${category === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid Shop Catalog Layout */}
      <div className="shop-layout" id="catalog-grid">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filter-section">
            <h3 className="filter-title">
              <span>Filter By Price</span>
              <Filter size={14} style={{ opacity: 0.7 }} />
            </h3>
            <div className="price-range-inputs">
              <input
                type="number"
                placeholder="Min ($)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <span style={{ color: 'var(--text-tertiary)' }}>—</span>
              <input
                type="number"
                placeholder="Max ($)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Categories</h3>
            <div className="checkbox-group">
              {categoriesList.map((cat) => (
                <label key={cat} className="checkbox-label">
                  <input
                    type="radio"
                    name="category-radio"
                    checked={category === cat}
                    onChange={() => setCategory(cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reset Buttons */}
          <button
            onClick={handleResetFilters}
            className="btn-secondary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              marginTop: '16px'
            }}
          >
            <RotateCcw size={13} /> Reset Filters
          </button>
        </aside>

        {/* Products Grid Section */}
        <main className="products-wrapper">
          <div className="products-header">
            <span className="results-count">
              {loading ? 'Searching products...' : `${products.length} Premium items found`}
            </span>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="newest">Sort By: Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: Highest Reviews</option>
            </select>
          </div>

          {/* Grid Render */}
          {loading ? (
            <div className="flex-center" style={{ minHeight: '300px', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  border: '3px solid var(--border-color)',
                  borderTopColor: 'var(--accent-color)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}
              ></div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading items...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state glass-panel" style={{ borderRadius: 'var(--border-radius-md)' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <h3>No products match your search.</h3>
              <p style={{ marginTop: '8px', fontSize: '14px' }}>
                Try adjusting your price filters, category chips, or searching for other keywords.
              </p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} showToast={showToast} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
