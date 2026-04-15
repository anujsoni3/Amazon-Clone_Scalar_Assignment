import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/api';
import Loader from '../../components/Loader/Loader';
import { useCart } from '../../context/CartContext';
import { getSizedFallback, normalizeImageUrl, withImageFallback } from '../../utils/image';
import { formatPrice } from '../../utils/price';
import './OrderHistory.css';

const FALLBACK_IMAGE = getSizedFallback(160, 160);

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItemToCart } = useCart();
  const [addingItemId, setAddingItemId] = useState(null);

  const handleReorder = async (productId) => {
    setAddingItemId(productId);
    await addItemToCart(productId, 1);
    setTimeout(() => setAddingItemId(null), 2000);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.getOrderHistory();
        if (res.data.success) {
          setOrders(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching order history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <Loader fullPage />;

  const statusMap = {
    PENDING: { label: 'Order placed', tone: 'neutral' },
    CONFIRMED: { label: 'Arriving soon', tone: 'info' },
    SHIPPED: { label: 'Shipped', tone: 'info' },
    DELIVERED: { label: 'Delivered', tone: 'success' },
  };

  return (
    <div className="order-hist-page">
      <div className="order-hist-header">
        <h1>Your Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <h3>You have no orders yet.</h3>
          <Link to="/" className="text-link">Continue shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="oc-header">
                <div className="oc-header-left">
                  <div className="oc-info-block">
                    <span className="oc-label">ORDER PLACED</span>
                    <span>{new Date(order.placedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="oc-info-block">
                    <span className="oc-label">TOTAL</span>
                    <span>₹{formatPrice(order.total).full}</span>
                  </div>
                  <div className="oc-info-block">
                    <span className="oc-label">DISPATCH TO</span>
                    <span className="text-link">Anuj Soni</span>
                  </div>
                </div>
                <div className="oc-header-right">
                  <span className="oc-label">ORDER # {order.id.split('-')[0]}...</span>
                  <Link to={`/order-confirmation/${order.id}`} className="text-link">View order details</Link>
                </div>
              </div>
              
              <div className="oc-body">
                <h3 className={`oc-status oc-status-${statusMap[order.status]?.tone || 'neutral'}`}>
                  {statusMap[order.status]?.label || 'Processing'}
                </h3>
                {order.items.map(item => (
                  <div key={item.id} className="oc-item">
                    <img
                      src={normalizeImageUrl(item.product.images?.[0]?.imageUrl, FALLBACK_IMAGE)}
                      alt={item.product.name}
                      onError={(event) => withImageFallback(event, FALLBACK_IMAGE)}
                    />
                    <div className="oc-item-details">
                      <Link to={`/products/${item.productId}`} className="text-link">
                        {item.product.name}
                      </Link>
                      <div className="oc-item-qty">Qty: {item.quantity}</div>
                      <div className="oc-item-price">₹{formatPrice(item.unitPrice).full}</div>
                      <button 
                        onClick={() => handleReorder(item.productId)}
                        className="btn btn-secondary review-btn"
                        disabled={addingItemId === item.productId}
                      >
                        {addingItemId === item.productId ? 'Added to Cart!' : 'Add to Cart (Buy it again)'}
                      </button>
                      <Link to={`/products/${item.productId}`} className="text-link write-review-link">
                        Write a product review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
