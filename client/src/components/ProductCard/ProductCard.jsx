import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarRating from '../StarRating/StarRating';
import { useCart } from '../../context/CartContext';
import { demoProducts } from '../../data/demoCatalog';
import { getSizedFallback, normalizeImageUrl, withImageFallback } from '../../utils/image';
import { formatPrice } from '../../utils/price';
import './ProductCard.css';

const ProductCard = ({ product, stockUpdated = false }) => {
  const { addItemToCart } = useCart();
  const navigate = useNavigate();
  const [actionState, setActionState] = useState('idle');
  const [imageIndex, setImageIndex] = useState(0);
  const fallbackImage = getSizedFallback(600, 400, product.name.slice(0, 24));
  const imageCandidates = useMemo(() => {
    const primaryUrls = (product.images || [])
      .map((img) => normalizeImageUrl(img.imageUrl, fallbackImage))
      .filter((url) => url && url !== fallbackImage);

    const backupUrls = demoProducts
      .filter((item) => item.id !== product.id)
      .flatMap((item) => item.images || [])
      .map((img) => normalizeImageUrl(img.imageUrl, fallbackImage))
      .filter((url) => url && url !== fallbackImage);

    const uniqueUrls = [...new Set([...primaryUrls, ...backupUrls])];

    return uniqueUrls.length > 0 ? uniqueUrls : [fallbackImage];
  }, [product.id, product.images, fallbackImage]);

  const imageUrl = imageCandidates[Math.min(imageIndex, imageCandidates.length - 1)] || fallbackImage;
  const isOutOfStock = product.stockQty <= 0;

  const { whole, fraction } = formatPrice(product.price);

  return (
    <div
      className={`product-card ${stockUpdated ? 'stock-updated' : ''}`}
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/products/${product.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(`/products/${product.id}`);
        }
      }}
    >
      <Link to={`/products/${product.id}`} className="pc-image-link">
        <img
          src={imageUrl}
          alt={product.name}
          className="pc-image"
          onError={(event) => {
            if (imageIndex < imageCandidates.length - 1) {
              setImageIndex((prev) => prev + 1);
              return;
            }
            withImageFallback(event, fallbackImage);
          }}
        />
      </Link>
      
      <div className="pc-content">
        <div className="pc-badge-row">
          <span className="pc-choice-badge">Amazon's Choice</span>
          <span className="pc-prime">prime</span>
          {stockUpdated && <span className="pc-stock-badge">Stock updated</span>}
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
          <span className="pc-price-fraction">.{fraction}</span>
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
            addItemToCart(product.id, 1, product).then((success) => {
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
