import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../StarRating/StarRating';
import { useCart } from '../../context/CartContext';
import { getSizedFallback, normalizeImageUrl, withImageFallback } from '../../utils/image';
import { formatPrice } from '../../utils/price';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addItemToCart } = useCart();
  const [actionState, setActionState] = useState('idle');
  const fallbackImage = getSizedFallback(600, 400);
  const imageUrl = normalizeImageUrl(product.images?.[0]?.imageUrl, fallbackImage);
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
        <img src={imageUrl} alt={product.name} className="pc-image" onError={(event) => withImageFallback(event, fallbackImage)} />
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
            setActionState('adding');
            addItemToCart(product.id, 1).then((success) => {
              setActionState(success ? 'added' : 'idle');
              if (success) {
                setTimeout(() => setActionState('idle'), 1400);
              }
            });
          }}
        >
          {isOutOfStock ? 'Out of Stock' : actionState === 'adding' ? 'Adding...' : actionState === 'added' ? 'Added' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
