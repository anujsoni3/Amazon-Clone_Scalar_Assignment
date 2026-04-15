import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import * as api from '../../services/api';
import { getSizedFallback, normalizeImageUrl, withImageFallback } from '../../utils/image';
import { formatPrice } from '../../utils/price';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const product = item.product;
  const fallbackImage = getSizedFallback(300, 300);
  const imageUrl = normalizeImageUrl(product.images?.[0]?.imageUrl, fallbackImage);

  const handleQtyChange = (e) => {
    updateQuantity(item.id, parseInt(e.target.value, 10));
  };

  const handleRemove = (e) => {
    e.preventDefault();
    removeItem(item.id);
  };

  const handleSaveForLater = async (e) => {
    e.preventDefault();
    try {
      await api.addToWishlist(product.id);
      await removeItem(item.id);
    } catch (error) {
      console.error('Failed to save item for later', error);
      alert('Unable to save item for later right now.');
    }
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <Link to={`/products/${product.id}`}>
          <img src={imageUrl} alt={product.name} onError={(event) => withImageFallback(event, fallbackImage)} />
        </Link>
      </div>
      
      <div className="cart-item-info">
        <Link to={`/products/${product.id}`} className="cart-item-title">
          {product.name}
        </Link>
        <div className="cart-item-stock">In stock</div>
        <div className="cart-item-shipping">Eligible for FREE Shipping</div>
        
        <div className="cart-item-actions">
          <div className="cart-qty-wrapper">
            <select value={item.quantity} onChange={handleQtyChange}>
              {[...Array(Math.max(10, item.quantity)).keys()].map(x => (
                <option key={x+1} value={x+1}>Qty: {x+1}</option>
              ))}
            </select>
          </div>
          <div className="cart-action-divider">|</div>
          <button type="button" className="text-action text-action-btn" onClick={handleRemove}>Delete</button>
          <div className="cart-action-divider">|</div>
          <button type="button" className="text-action text-action-btn" onClick={handleSaveForLater}>Save for later</button>
        </div>
      </div>
      
      <div className="cart-item-price">
        <strong>₹{formatPrice(product.price).full}</strong>
      </div>
    </div>
  );
};

export default CartItem;
