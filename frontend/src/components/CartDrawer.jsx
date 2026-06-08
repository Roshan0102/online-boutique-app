import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';

const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    getCartTotal,
    checkout,
    token
  } = useContext(AppContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    setError(null);
    setSuccess(false);

    if (!token) {
      setError('Please login to place an orders.');
      setTimeout(() => {
        setIsCartOpen(false);
        navigate('/login');
      }, 1500);
      return;
    }

    setLoading(true);
    try {
      const result = await checkout();
      setSuccess(true);
      console.log('Checkout completed:', result);

      // Auto redirect to orders page after success
      setTimeout(() => {
        setSuccess(false);
        setIsCartOpen(false);
        navigate('/orders');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to complete orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-drawer-backdrop" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>
            &times;
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">Order placed successfully! Redirecting...</div>}

        <div className="cart-items-container">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
              <p>Your shopping cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="cart-item">
                <img
                  src={item.product.image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&auto=format&fit=crop&q=80'}
                  alt={item.product.name}
                  className="cart-item-img"
                />

                <div className="cart-item-details">
                  <h4>{item.product.name}</h4>
                  <p>${parseFloat(item.product.price).toFixed(2)} each</p>
                  <div className="cart-item-qty">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      className="cart-item-qty-btn"
                    >
                      -
                    </button>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      className="cart-item-qty-btn"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="cart-item-remove"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-total-section">
            <div className="cart-total-row">
              <span>Total:</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px' }}
              disabled={loading || success}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                  Processing Checkout...
                </span>
              ) : 'Proceed to Checkout'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
