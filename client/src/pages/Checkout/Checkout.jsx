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
  const [activeStep, setActiveStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('card');

  // If cart is empty, redirect back
  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const isAddressComplete = () => {
    return [
      address.name,
      address.phone,
      address.addressLine1,
      address.city,
      address.state,
      address.pincode,
    ].every((value) => value.trim() !== '');
  };

  const continueToPayment = () => {
    if (!isAddressComplete()) {
      alert('Please complete all required delivery fields before continuing.');
      return;
    }
    setActiveStep(2);
  };

  const continueToReview = () => {
    setActiveStep(3);
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
        <h1>Checkout ({cartSummary.totalQty} items)</h1>
        
        <section className={`checkout-section ${activeStep === 1 ? 'active' : ''}`}>
          <button type="button" className="checkout-section-head" onClick={() => setActiveStep(1)}>
            <span className="checkout-step">1</span>
            <h2>Select a delivery address</h2>
          </button>

          {activeStep === 1 && (
          <div className="checkout-section-content">
            <form id="checkout-form">
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

              <button type="button" className="step-action-btn" onClick={continueToPayment}>Use this address</button>
            </form>
          </div>
          )}
        </section>

        <section className={`checkout-section ${activeStep === 2 ? 'active' : ''}`}>
          <button type="button" className="checkout-section-head" onClick={() => setActiveStep(2)}>
            <span className="checkout-step">2</span>
            <h2>Select a payment method</h2>
          </button>

          {activeStep === 2 && (
          <div className="checkout-section-content">
            <div className="payment-tabs" role="tablist" aria-label="Payment methods">
              <button type="button" className={selectedPayment === 'card' ? 'active' : ''} onClick={() => setSelectedPayment('card')}>Credit or debit card</button>
              <button type="button" className={selectedPayment === 'upi' ? 'active' : ''} onClick={() => setSelectedPayment('upi')}>UPI</button>
              <button type="button" className={selectedPayment === 'netbanking' ? 'active' : ''} onClick={() => setSelectedPayment('netbanking')}>Net Banking</button>
              <button type="button" className={selectedPayment === 'cod' ? 'active' : ''} onClick={() => setSelectedPayment('cod')}>Cash on Delivery</button>
            </div>

            <div className="payment-content">
              {selectedPayment === 'card' && (
                <div className="payment-form-grid">
                  <div className="form-group">
                    <label>Card number (demo)</label>
                    <input type="text" placeholder="4111 1111 1111 1111" readOnly />
                  </div>
                  <div className="form-row">
                    <div className="form-group half">
                      <label>Expiry</label>
                      <input type="text" placeholder="MM/YY" readOnly />
                    </div>
                    <div className="form-group half">
                      <label>CVV</label>
                      <input type="password" placeholder="***" readOnly />
                    </div>
                  </div>
                </div>
              )}

              {selectedPayment === 'upi' && <p className="payment-help">Pay securely using any UPI app. (Static demo mode)</p>}
              {selectedPayment === 'netbanking' && <p className="payment-help">Choose your bank at the next step. (Static demo mode)</p>}
              {selectedPayment === 'cod' && <p className="payment-help">Pay by cash upon delivery. Additional verification may apply.</p>}
            </div>

            <button type="button" className="step-action-btn" onClick={continueToReview}>Use this payment method</button>
          </div>
          )}
        </section>

        <section className={`checkout-section ${activeStep === 3 ? 'active' : ''}`}>
          <button type="button" className="checkout-section-head" onClick={() => setActiveStep(3)}>
            <span className="checkout-step">3</span>
            <h2>Review items and delivery</h2>
          </button>

          {activeStep === 3 && (
            <div className="checkout-section-content">
              <div className="checkout-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="checkout-item">
                    <img src={item.product.images?.[0]?.imageUrl} alt={item.product.name} />
                    <div className="checkout-item-details">
                      <p className="ci-name">{item.product.name}</p>
                      <p className="ci-price"><strong>₹{parseFloat(item.product.price).toFixed(2)}</strong></p>
                      <p className="ci-qty">Quantity: {item.quantity}</p>
                      <p className="ci-pay">Payment: {selectedPayment.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="checkout-sidebar">
        <div className="checkout-summary-box">
          <button 
            type="button"
            className="btn pd-btn-add place-order-btn"
            disabled={submitting || activeStep !== 3 || !isAddressComplete()}
            onClick={handlePlaceOrder}
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
