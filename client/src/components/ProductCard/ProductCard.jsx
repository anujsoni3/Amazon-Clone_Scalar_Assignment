import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../StarRating/StarRating';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const imageUrl = product.images?.[0]?.imageUrl || 'https://via.placeholder.com/200';
  
  // Format price helper
  const formatPrice = (price) => {
    const p = parseFloat(price).toFixed(2);
    const [whole, fraction] = p.split('.');
    return { whole, fraction };
  };

  const { whole, fraction } = formatPrice(product.price);

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="pc-image-link">
        <img src={imageUrl} alt={product.name} className="pc-image" />
      </Link>
      
      <div className="pc-content">
        <Link to={`/products/${product.id}`} className="pc-title-link">
          <h2 className="pc-title">{product.name}</h2>
        </Link>
        
        <div className="pc-rating">
          <StarRating rating={parseFloat(product.rating)} count={product.reviewCount} />
        </div>
        
        <div className="pc-price-block">
          <span className="pc-currency">₹</span>
          <span className="pc-price-whole">{whole}</span>
          <span className="pc-price-fraction">{fraction}</span>
        </div>
        
        <div className="pc-delivery">
          <span>FREE Delivery</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
