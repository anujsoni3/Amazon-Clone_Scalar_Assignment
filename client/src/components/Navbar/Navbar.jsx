import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, Menu } from 'lucide-react';
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
    <header>
      {/* Top Main Nav */}
      <div className="navbar-main">
        {/* Logo */}
        <Link to="/" className="nav-logo-container nav-border">
          <div className="nav-logo">
            <h2 style={{color: 'white', margin: 0}}>Amazon</h2>
          </div>
        </Link>

        {/* Location (Visual only) */}
        <div className="nav-location nav-border hide-on-mobile">
          <MapPin size={18} className="location-icon" />
          <div className="location-text">
            <span className="location-line1">Deliver to</span>
            <span className="location-line2">India</span>
          </div>
        </div>

        {/* Search Bar */}
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

        {/* Right Section */}
        <div className="nav-right">
          {/* Account */}
          <div className="nav-item nav-border hide-on-mobile">
            <span className="nav-line-1">Hello, Anuj</span>
            <span className="nav-line-2">Account & Lists</span>
          </div>

          {/* Orders */}
          <Link to="/orders/history" className="nav-item nav-border hide-on-mobile">
            <span className="nav-line-1">Returns</span>
            <span className="nav-line-2">& Orders</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="nav-cart nav-border">
            <div className="cart-icon-container">
              <span className="cart-count">{cartSummary?.totalQty || 0}</span>
              <ShoppingCart size={32} />
            </div>
            <span className="cart-text hide-on-mobile">Cart</span>
          </Link>
        </div>
      </div>

      {/* Secondary Nav Bar */}
      <div className="navbar-secondary">
        <div className="nav-secondary-item menu-btn">
          <Menu size={20} /> All
        </div>
        <Link to="/products?category=electronics" className="nav-secondary-item hide-on-mobile">Electronics</Link>
        <Link to="/products?category=books" className="nav-secondary-item hide-on-mobile">Books</Link>
        <Link to="/products?category=clothing" className="nav-secondary-item hide-on-mobile">Clothing</Link>
        <Link to="/products?category=home-kitchen" className="nav-secondary-item">Home & Kitchen</Link>
        <Link to="/products?category=beauty" className="nav-secondary-item hide-on-mobile">Beauty</Link>
      </div>
    </header>
  );
};

export default Navbar;
