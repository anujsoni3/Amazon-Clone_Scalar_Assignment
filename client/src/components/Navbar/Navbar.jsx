import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, Globe } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { cartSummary, lowStockCount, inventoryPulseAt } = useCart();
  const navigate = useNavigate();
  const shouldShowHeaderPopups = !sessionStorage.getItem('amazon-clone-nav-popups-shown');
  const [showShippingNotice, setShowShippingNotice] = useState(shouldShowHeaderPopups);
  const [showDealsNotice, setShowDealsNotice] = useState(shouldShowHeaderPopups);
  const [showSignInPrompt, setShowSignInPrompt] = useState(shouldShowHeaderPopups);
  const [stockPulse, setStockPulse] = useState(false);

  useEffect(() => {
    if (showShippingNotice || showDealsNotice || showSignInPrompt) {
      sessionStorage.setItem('amazon-clone-nav-popups-shown', '1');
    }
  }, [showShippingNotice, showDealsNotice, showSignInPrompt]);

  useEffect(() => {
    if (!inventoryPulseAt) return;
    const activate = setTimeout(() => setStockPulse(true), 0);
    const deactivate = setTimeout(() => setStockPulse(false), 1200);
    return () => {
      clearTimeout(activate);
      clearTimeout(deactivate);
    };
  }, [inventoryPulseAt]);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    const selectedCategory = e.target.category?.value || '';
    const params = new URLSearchParams();

    if (query.trim()) {
      params.set('q', query.trim());
    }

    if (selectedCategory && selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }

    const qs = params.toString();
    if (qs) {
      navigate(`/products?${qs}`);
      return;
    }

    navigate('/products');
  };

  return (
    <header className="navbar-main">
      <div className="navbar-main-inner">
        <Link to="/" className="nav-logo-container nav-border" aria-label="Amazon home">
          <div className="nav-logo" role="img" aria-label="Amazon">
            <span className="nav-logo-text">amazon</span>
            <span className="nav-logo-domain">.in</span>
          </div>
        </Link>

        <div className="nav-location nav-border hide-on-mobile">
          <MapPin size={18} className="location-icon" />
          <div className="location-text">
            <span className="location-line1">Deliver to</span>
            <span className="location-line2">India</span>
          </div>
        </div>

        <form className="nav-search" onSubmit={handleSearch}>
          <select className="search-select hide-on-mobile" name="category" defaultValue="all" aria-label="Search category">
            <option value="all">All</option>
            <option value="electronics">Electronics</option>
            <option value="home-kitchen">Home & Kitchen</option>
            <option value="beauty">Beauty</option>
            <option value="books">Books</option>
            <option value="clothing">Clothing</option>
            <option value="amazon-basics">Amazon Basics</option>
          </select>
          <input 
            type="text" 
            name="search" 
            className="search-input" 
            placeholder="Search Amazon" 
          />
          <button type="submit" className="search-btn">
            <Search size={20} color="#131921" />
          </button>
        </form>

        <div className="nav-right">
          <div className="nav-item nav-border hide-on-mobile nav-language">
            <Globe size={14} />
            <span className="nav-line-2">EN</span>
          </div>

          <div className="nav-item nav-border hide-on-mobile">
            <span className="nav-line-1">Hello, Anuj</span>
            <span className="nav-line-2">Your account</span>
          </div>

          <Link to="/orders/history" className="nav-item nav-border hide-on-mobile">
            <span className="nav-line-1">Returns</span>
            <span className="nav-line-2">& Orders</span>
          </Link>

          <Link to="/wishlist" className="nav-item nav-border hide-on-mobile">
            <span className="nav-line-1">Your</span>
            <span className="nav-line-2">Wishlist</span>
          </Link>

          <Link to="/cart" className={`nav-cart nav-border ${stockPulse ? 'nav-cart-stock-pulse' : ''}`}>
            <div className="cart-icon-container">
              <span className="cart-count">{cartSummary?.totalQty || 0}</span>
              <ShoppingCart size={32} />
            </div>
            <div className="nav-cart-text-wrap hide-on-mobile">
              <span className="cart-text">Cart</span>
              {lowStockCount > 0 && (
                <span className="nav-low-stock-chip" aria-label={`${lowStockCount} low stock items in cart`}>
                  Low stock: {lowStockCount}
                </span>
              )}
            </div>
          </Link>
        </div>
      </div>

      {showShippingNotice && (
        <div className="nav-popup nav-popup-shipping hide-on-mobile" role="status" aria-live="polite">
          <div className="nav-popup-arrow" />
          <p>We're showing you items that ship to <strong>India</strong>. To see items that ship to a different country, change your delivery address.</p>
          <div className="nav-popup-actions">
            <button type="button" className="nav-popup-btn nav-popup-btn-muted" onClick={() => setShowShippingNotice(false)}>Dismiss</button>
            <button
              type="button"
              className="nav-popup-btn nav-popup-btn-primary"
              onClick={() => {
                setShowShippingNotice(false);
                navigate('/checkout');
              }}
            >
              Change Address
            </button>
          </div>
        </div>
      )}

      {showDealsNotice && (
        <div className="nav-popup nav-popup-deals hide-on-mobile" role="status" aria-live="polite">
          <div className="nav-popup-arrow" />
          <p>New: limited-time deals are live for your region. Check top-rated offers before they end.</p>
          <div className="nav-popup-actions">
            <button type="button" className="nav-popup-btn nav-popup-btn-muted" onClick={() => setShowDealsNotice(false)}>Dismiss</button>
            <button
              type="button"
              className="nav-popup-btn nav-popup-btn-primary"
              onClick={() => {
                setShowDealsNotice(false);
                navigate('/products?sort=rating');
              }}
            >
              View Deals
            </button>
          </div>
        </div>
      )}

      {showSignInPrompt && (
        <div className="nav-popup nav-popup-signin hide-on-mobile" role="dialog" aria-label="Sign in prompt">
          <div className="nav-popup-arrow" />
          <p className="nav-signin-title">See personalized recommendations</p>
          <button
            type="button"
            className="nav-popup-btn nav-popup-btn-primary nav-signin-btn"
            onClick={() => {
              setShowSignInPrompt(false);
              navigate('/orders/history');
            }}
          >
            Sign in
          </button>
          <p className="nav-signin-subtext">
            New customer?{' '}
            <button type="button" className="nav-inline-link" onClick={() => setShowSignInPrompt(false)}>
              Start here.
            </button>
          </p>
        </div>
      )}
    </header>
  );
};

export default Navbar;
