import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import { useCart } from '../../context/CartContext';
import * as api from '../../services/api';
import { getSizedFallback, normalizeImageUrl, withImageFallback } from '../../utils/image';
import { formatPrice } from '../../utils/price';
import './Wishlist.css';

const FALLBACK_IMAGE = getSizedFallback(220, 220);

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItemToCart, setNotice } = useCart();

  const fetchWishlist = async () => {
    try {
      const res = await api.getWishlist();
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
      setNotice({ type: 'error', message: 'Unable to load wishlist right now' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (itemId) => {
    try {
      await api.removeFromWishlist(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setNotice({ type: 'success', message: 'Removed from wishlist' });
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
      setNotice({ type: 'error', message: 'Unable to remove item from wishlist' });
    }
  };

  const handleMoveToCart = async (item) => {
    const success = await addItemToCart(item.product.id, 1);
    if (success) {
      await handleRemove(item.id);
    }
  };

  if (loading) return <Loader fullPage />;

  return (
    <div className="wishlist-page">
      <header className="wishlist-header">
        <h1>Your Wish List</h1>
        <p>{items.length} item{items.length !== 1 ? 's' : ''}</p>
      </header>

      {items.length === 0 ? (
        <div className="wishlist-empty">
          <h2>Your wishlist is empty</h2>
          <p>Save items that you like to view and buy them later.</p>
          <Link to="/products" className="wishlist-shop-link">Browse products</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {items.map((item) => {
            const product = item.product;
            return (
              <article key={item.id} className="wishlist-card">
                <Link to={`/products/${product.id}`} className="wishlist-image-wrap">
                  <img
                    src={normalizeImageUrl(product.images?.[0]?.imageUrl, FALLBACK_IMAGE)}
                    alt={product.name}
                    onError={(event) => withImageFallback(event, FALLBACK_IMAGE)}
                  />
                </Link>

                <div className="wishlist-content">
                  <Link to={`/products/${product.id}`} className="wishlist-title">{product.name}</Link>
                  <div className="wishlist-price">₹{formatPrice(product.price).full}</div>
                  <div className={`wishlist-stock ${product.stockQty > 0 ? 'in' : 'out'}`}>
                    {product.stockQty > 0 ? 'In stock' : 'Currently unavailable'}
                  </div>

                  <div className="wishlist-actions">
                    <button type="button" className="wishlist-btn primary" onClick={() => handleMoveToCart(item)} disabled={product.stockQty <= 0}>
                      Add to Cart
                    </button>
                    <button type="button" className="wishlist-btn" onClick={() => handleRemove(item.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
