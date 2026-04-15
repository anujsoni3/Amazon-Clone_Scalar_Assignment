import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../../services/api';
import Loader from '../../components/Loader/Loader';
import { formatPrice } from '../../utils/price';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.getOrderById(id);
        if (res.data.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching order', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <Loader fullPage />;
  if (!order) return <div style={{padding: '40px', textAlign:'center'}}>Order not found!</div>;

  return (
    <div className="order-conf-page">
      <div className="order-conf-box">
        <div className="success-checkmark">✓</div>
        <h1>Order placed, thank you!</h1>
        <p>Confirmation will be sent to your registered email.</p>
        
        <div className="order-details-card">
          <div className="od-row">
            <span className="od-label">Order Number:</span>
            <span className="od-value">{order.id}</span>
          </div>
          <div className="od-row">
            <span className="od-label">Delivery expected:</span>
            <span className="od-value" style={{color: '#007600', fontWeight: 'bold'}}>In 3-4 days</span>
          </div>
        </div>

        <div className="order-summary-card">
          <h3>Order Summary</h3>
          <div className="od-row">
            <span className="od-label">Items:</span>
            <span className="od-value">₹{formatPrice(order.subtotal).full}</span>
          </div>
          <div className="od-row">
            <span className="od-label">Postage & Packing:</span>
            <span className="od-value">₹{formatPrice(order.shippingCost).full}</span>
          </div>
          <hr />
          <div className="od-row">
            <span className="od-label" style={{fontWeight: 'bold'}}>Order Total:</span>
            <span className="od-value" style={{fontWeight: 'bold', color: '#B12704'}}>
              ₹{formatPrice(order.total).full}
            </span>
          </div>
        </div>

        <div className="continue-shopping">
          <Link to="/" className="btn btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
