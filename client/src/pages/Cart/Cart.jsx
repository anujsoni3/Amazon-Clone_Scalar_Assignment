import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/CartItem/CartItem';
import Loader from '../../components/Loader/Loader';
import { formatPrice } from '../../utils/price';
import './Cart.css';

const Cart = () => {
  const { cartItems, cartSummary, loading } = useCart();
  const navigate = useNavigate();
  const freeDeliveryThreshold = 499;
  const amountLeft = Math.max(freeDeliveryThreshold - cartSummary.subtotal, 0);
  const freeDeliveryProgress = Math.min((cartSummary.subtotal / freeDeliveryThreshold) * 100, 100);

  if (loading) return <Loader fullPage />;

  return (
    <div className="cart-page">
      <div className="cart-main">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <a href="#" className="text-action hide-on-mobile">Deselect all items</a>
          <span className="cart-price-header hide-on-mobile">Price</span>
        </div>
        
        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <h2>Your Amazon Cart is empty.</h2>
            <p>Check your Saved for later items below or continue shopping.</p>
          </div>
        ) : (
          <div className="cart-items-list">
            {cartItems.map(item => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        )}
        
        {cartItems.length > 0 && (
          <div className="cart-subtotal-bottom">
            Subtotal ({cartSummary.totalQty} items): <strong>₹{formatPrice(cartSummary.subtotal).full}</strong>
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="cart-sidebar">
          <div className="cart-summary-box">
            <div className="cart-free-shipping">
              <span className="success-icon">✓</span>
              <div>
                {amountLeft === 0 ? (
                  <>
                    <span className="free-shipping-text">Your order is eligible for FREE Delivery.</span>
                    <br/>
                    <span className="free-shipping-sub">Select this option at checkout. Details</span>
                  </>
                ) : (
                  <>
                    <span className="free-shipping-text">Add ₹{formatPrice(amountLeft).full} more for FREE Delivery.</span>
                    <br/>
                    <span className="free-shipping-sub">Order above ₹{freeDeliveryThreshold} to unlock delivery savings.</span>
                  </>
                )}
              </div>
            </div>

            <div className="delivery-progress-wrap" aria-label="Free delivery progress">
              <div className="delivery-progress-bar">
                <span style={{ width: `${freeDeliveryProgress}%` }}></span>
              </div>
              <p className="delivery-progress-caption">{Math.round(freeDeliveryProgress)}% toward FREE Delivery</p>
            </div>
            
            <div className="cart-subtotal">
              Subtotal ({cartSummary.totalQty} items): <strong>₹{formatPrice(cartSummary.subtotal).full}</strong>
            </div>
            
            <div className="cart-gift">
              <input type="checkbox" id="gift" />
              <label htmlFor="gift">This order contains a gift</label>
            </div>
            
            <button 
              className="btn pd-btn-add proceed-btn"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Buy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
