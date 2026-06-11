import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AppContext, ORDER_SERVICE_URL } from '../AppContext';

const OrderHistory = () => {
  const { token } = useContext(AppContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);
      try {
        console.log(`[Order History] Fetching ordersss from Orderss Service...`);
        const response = await axios.get(`${ORDER_SERVICE_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setOrders(response.data);
      } catch (err) {
        console.error('Fetch orders error:', err);
        setError('Failed to fetch orders history. Orders Services might be offline.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'badge-warning';
      case 'completed':
      case 'delivered': return 'badge-success';
      default: return 'badge-indigo';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2 className="orders-title">Your Order History</h2>

      {error && <div className="alert alert-error">{error}</div>}

      {orders.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px 40px', textAlignment: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📦</div>
          <h3 style={{ marginBottom: '10px' }}>No orders placed yet</h3>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>You haven't purchased any items. Explore our product catalog and try checking out.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-group-card glass-panel">
              <div className="order-group-header">
                <div className="order-meta-info">
                  <span className="order-id-label">Order #{order.id}</span>
                  <span className="order-date-label">Placed on {formatDate(order.created_at)}</span>
                </div>
                <span className={`badge ${getStatusStyle(order.status)} order-status-badge`}>
                  {order.status}
                </span>
              </div>

              <div className="order-group-items">
                {order.items && order.items.map((item, idx) => (
                  <div key={item.id || idx} className="order-item-row">
                    <span className="order-item-name">
                      {item.product_name || `Product ID #${item.product_id}`}
                    </span>
                    <span className="order-item-qty">Qty: {item.quantity}</span>
                    <span className="order-item-price">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="order-group-footer">
                Total Paid:
                <span className="order-total-price">${parseFloat(order.total_price).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
