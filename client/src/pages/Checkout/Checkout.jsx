import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import * as api from '../../services/api';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, cartSummary, clearCartLocally } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [submitting, setSubmitting] = useState(false);

  // If cart is empty, redirect back
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await api.placeOrder(address);
      if (res.data.success) {
        clearCartLocally();
        navigate(`/order-confirmation/${res.data.data.id}`);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Error placing order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const shippingCost = cartSummary.subtotal >= 499 ? 0 : 49;
  const total = cartSummary.subtotal + shippingCost;

  return (
    <div className="checkout-page">
      <div className="checkout-main">
        <h1>Checkout</h1>
        
        <div className="checkout-section">
          <div className="checkout-step">1</div>
          <div className="checkout-section-content">
            <h2>Select a delivery address</h2>
            <form id="checkout-form" onSubmit={handlePlaceOrder}>
              <div className="form-group">
                <label>Full name (First and Last name)</label>
                <input type="text" name="name" required value={address.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Mobile number</label>
                <input type="text" name="phone" required value={address.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Flat, House no., Building, Company, Apartment</label>
                <input type="text" name="addressLine1" required value={address.addressLine1} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Area, Street, Sector, Village</label>
                <input type="text" name="addressLine2" value={address.addressLine2} onChange={handleChange} />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Town/City</label>
                  <input type="text" name="city" required value={address.city} onChange={handleChange} />
                </div>
                <div className="form-group half">
                  <label>Pincode</label>
                  <input type="text" name="pincode" required value={address.pincode} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" name="state" required value={address.state} onChange={handleChange} />
              </div>
            </form>
          </div>
        </div>

        <div className="checkout-section">
          <div className="checkout-step">2</div>
          <div className="checkout-section-content">
            <h2>Review items and delivery</h2>
            <div className="checkout-items">
              {cartItems.map((item, idx) => (
                <div key={item.id} className="checkout-item">
                  <img src={item.product.images?.[0]?.imageUrl} alt={item.product.name} />
                  <div className="checkout-item-details">
                    <p className="ci-name">{item.product.name}</p>
                    <p className="ci-price"><strong>₹{parseFloat(item.product.price).toFixed(2)}</strong></p>
                    <p className="ci-qty">Quantity: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="checkout-sidebar">
        <div className="checkout-summary-box">
          <button 
            type="submit" 
            form="checkout-form" 
            className="btn pd-btn-add place-order-btn"
            disabled={submitting}
          >
            {submitting ? 'Processing...' : 'Place your order'}
          </button>
          <p className="terms-text">By placing your order, you agree to Amazon Clone's privacy notice and conditions of use.</p>
          
          <hr/>
          
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Items:</span>
            <span>₹{cartSummary.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery:</span>
            <span>₹{shippingCost.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Total:</span>
            <span>₹{(cartSummary.subtotal + shippingCost).toFixed(2)}</span>
          </div>
          
          <hr/>
          
          <div className="summary-row total-row">
            <span>Order Total:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
