import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext, PRODUCT_SERVICE_URL } from '../AppContext';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, setIsCartOpen } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        console.error('Fetch product details error:', err);
        setError(err.response?.status === 404
          ? 'Product not found.'
          : 'Could not fetch products detail. Products Service might be offline.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setIsCartOpen(true); // Open the slide cart
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto' }}>
        <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>
        <button onClick={() => navigate('/products')} className="btn btn-secondary">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <Link to="/products" className="btn btn-secondary" style={{ marginBottom: '30px', display: 'inline-flex', alignItems: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Products
      </Link>

      {product && (
        <div className="details-container">
          <div className="details-image-panel glass-panel">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&auto=format&fit=crop&q=80'}
              alt={product.name}
              className="details-img"
            />
          </div>

          <div className="details-info">
            <span className="details-category">{product.category}</span>
            <h1 className="details-title">{product.name}</h1>
            <div className="details-price">${parseFloat(product.price).toFixed(2)}</div>
            <p className="details-desc">{product.description}</p>

            <div className="quantity-selector">
              <span style={{ color: '#94a3b8', fontWeight: '500' }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button onClick={handleDecrement} className="qty-btn">-</button>
                <span className="qty-val">{quantity}</span>
                <button onClick={handleIncrement} className="qty-btn">+</button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="btn btn-primary"
              style={{ width: '100%', maxWidth: '280px', padding: '14px 20px', fontSize: '1.05rem' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
