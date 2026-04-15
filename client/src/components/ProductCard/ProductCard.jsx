import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../StarRating/StarRating';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addItemToCart } = useCart();
  const imageUrl = product.images?.[0]?.imageUrl || 'https://via.placeholder.com/200';
  const isOutOfStock = product.stockQty <= 0;
  
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
        <div className="pc-badge-row">
          <span className="pc-choice-badge">Amazon's Choice</span>
          <span className="pc-prime">prime</span>
        </div>

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
          <span>FREE Delivery Tomorrow</span>
        </div>
        
        <button 
          className="btn pc-add-btn" 
          disabled={isOutOfStock}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addItemToCart(product.id, 1);
          }}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
