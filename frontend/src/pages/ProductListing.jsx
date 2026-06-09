import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AppContext, PRODUCT_SERVICE_URL } from '../AppContext';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart, setIsCartOpen } = useContext(AppContext);

  // List of categories for filtering
  const categories = ['All', 'Electronics', 'Audio', 'Wearables', 'Accessories'];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = selectedCategory === 'All'
          ? `${PRODUCT_SERVICE_URL}/api/products`
          : `${PRODUCT_SERVICE_URL}/api/products?category=${selectedCategory}`;

        const response = await axios.get(url);
        setProducts(response.data);
      } catch (err) {
        console.error('Fetch products error:', err);
        setError('Could not fetch productss. Make sures the Product Services is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleAddToCart = (e, product) => {
    e.preventDefault(); // Prevent navigating if wrapped in Link
    addToCart(product, 1);
    setIsCartOpen(true); // Open the slide cart automatically for visual feedback!
  };

  return (
    <div className="products-page">
      <div className="products-layout">
        {/* Sidebar Filter */}
        <aside className="sidebar-filters glass-panel">
          <h3 className="filter-title">Categories</h3>
          <ul className="category-list">
            {categories.map((cat) => (
              <li
                key={cat}
                className={`category-item ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Grid Content */}
        <main className="products-main">
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Products ({selectedCategory})</h2>
            <div className="badge badge-indigo">
              {products.length} {products.length === 1 ? 'item' : 'items'} found
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Fetching curated products...</p>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : products.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px', textAlignment: 'center', color: '#94a3b8' }}>
              No products found in this category.
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card glass-panel">
                  <Link to={`/products/${product.id}`} className="product-img-wrapper">
                    <img
                      src={product.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      className="product-img"
                    />
                  </Link>

                  <div className="product-card-body">
                    <span className="product-card-category">{product.category}</span>
                    <h3 className="product-card-title">
                      <Link to={`/products/${product.id}`}>{product.name}</Link>
                    </h3>
                    <p className="product-card-desc">{product.description}</p>

                    <div className="product-card-footer">
                      <span className="product-card-price">${parseFloat(product.price).toFixed(2)}</span>
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="btn btn-primary"
                        style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"></circle>
                          <circle cx="20" cy="21" r="1"></circle>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductListing;
