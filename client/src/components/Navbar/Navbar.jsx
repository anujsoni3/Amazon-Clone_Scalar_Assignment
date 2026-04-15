import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, Globe } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { cartSummary } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query)}`);
    } else {
      navigate(`/products`);
    }
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
          <select className="search-select hide-on-mobile">
            <option>All</option>
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

          <Link to="/cart" className="nav-cart nav-border">
            <div className="cart-icon-container">
              <span className="cart-count">{cartSummary?.totalQty || 0}</span>
              <ShoppingCart size={32} />
            </div>
            <span className="cart-text hide-on-mobile">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
