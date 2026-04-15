import React from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import './Navbar.css';

const CheckoutHeader = () => {
  return (
    <header className="checkout-header">
      <div className="checkout-header-inner">
        <Link to="/" className="checkout-logo" aria-label="Back to Amazon home">
          <span className="checkout-logo-text">amazon</span>
          <span className="checkout-logo-domain">.in</span>
        </Link>

        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-lock" aria-label="Secure checkout">
          <Lock size={16} />
          <span>Secure</span>
        </div>
      </div>
    </header>
  );
};

export default CheckoutHeader;
