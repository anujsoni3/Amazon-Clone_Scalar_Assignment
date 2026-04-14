import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const product = item.product;
  const imageUrl = product.images?.[0]?.imageUrl || 'https://via.placeholder.com/150';

  const handleQtyChange = (e) => {
    updateQuantity(item.id, parseInt(e.target.value));
  };

  const handleRemove = (e) => {
    e.preventDefault();
    removeItem(item.id);
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <Link to={`/products/${product.id}`}>
          <img src={imageUrl} alt={product.name} />
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
          <a href="#" className="text-action" onClick={handleRemove}>Delete</a>
          <div className="cart-action-divider">|</div>
          <a href="#" className="text-action">Save for later</a>
        </div>
      </div>
      
      <div className="cart-item-price">
        <strong>₹{parseFloat(product.price).toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default CartItem;
