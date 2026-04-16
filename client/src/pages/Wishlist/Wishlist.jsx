import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader/Loader';
import { useCart } from '../../context/CartContext';
import * as api from '../../services/api';
import { getSizedFallback, normalizeImageUrl, withImageFallback } from '../../utils/image';
import { formatPrice } from '../../utils/price';
import './Wishlist.css';

const LOCAL_WISHLIST_KEY = 'amazon-clone-local-wishlist';

const readLocalWishlist = () => {
  try {
    const stored = localStorage.getItem(LOCAL_WISHLIST_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const writeLocalWishlist = (items) => {
  localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(items));
};

const FALLBACK_IMAGE = getSizedFallback(220, 220);

const Wishlist = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addItemToCart, setNotice } = useCart();

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await api.getWishlist();
      if (res.data.success) {
        const nextItems = res.data.data || [];
        setItems(nextItems);
        writeLocalWishlist(nextItems);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Failed to fetch wishlist', error);
      setNotice({ type: 'error', message: 'Unable to load wishlist right now' });
    }

    const local = readLocalWishlist();
    const fallback = local?.length ? local : [];
    setItems(fallback);
    setLoading(false);
  }, [setNotice]);

  useEffect(() => {
    const start = setTimeout(() => {
      fetchWishlist();
    }, 0);
    return () => clearTimeout(start);
  }, [fetchWishlist]);

  const handleRemove = async (itemId) => {
    const nextItems = items.filter((item) => item.id !== itemId);
    try {
      await api.removeFromWishlist(itemId);
      setNotice({ type: 'success', message: 'Removed from wishlist' });
    } catch (error) {
      console.error('Failed to remove from wishlist', error);
      setNotice({ type: 'error', message: 'Unable to remove item from wishlist' });
    }
    setItems(nextItems);
    writeLocalWishlist(nextItems);
  };

  const handleMoveToCart = async (item) => {
    const success = await addItemToCart(item.product.id, 1, item.product);
    if (success) {
      await handleRemove(item.id);
    }
  };

  const handleBuyNow = (item) => {
    navigate('/checkout', {
      state: {
        buyNowItem: {
          id: `wishlist-buy-now-${item.id}`,
          productId: item.product.id,
          quantity: 1,
          product: item.product,
        },
      },
    });
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
                    <button type="button" className="wishlist-btn buy-now" onClick={() => handleBuyNow(item)} disabled={product.stockQty <= 0}>
                      Buy Now
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
