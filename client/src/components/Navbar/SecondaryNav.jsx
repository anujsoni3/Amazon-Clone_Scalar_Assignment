import React from 'react';
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import './Navbar.css';

const quickLinks = [
  { label: "Today's Deals", to: '/products?sort=rating' },
  { label: 'Customer Service', to: '/products' },
  { label: 'Registry', to: '/products?category=home-kitchen' },
  { label: 'Gift Cards', to: '/products?category=beauty' },
  { label: 'Sell', to: '/products' },
  { label: 'Electronics', to: '/products?category=electronics' },
  { label: 'Books', to: '/products?category=books' },
  { label: 'Clothing', to: '/products?category=clothing' },
  { label: 'Home & Kitchen', to: '/products?category=home-kitchen' },
  { label: 'Amazon Basics', to: '/products?category=amazon-basics' }
];

const SecondaryNav = () => {
  return (
    <nav className="navbar-secondary" aria-label="Primary navigation">
      <Link className="nav-secondary-item menu-btn" to="/products">
        <Menu size={18} />
        <span>All</span>
      </Link>

      {quickLinks.map((link) => (
        <Link key={link.label} to={link.to} className="nav-secondary-item">
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default SecondaryNav;
