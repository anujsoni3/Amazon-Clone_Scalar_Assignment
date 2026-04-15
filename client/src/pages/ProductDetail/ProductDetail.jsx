import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StarRating from '../../components/StarRating/StarRating';
import Loader from '../../components/Loader/Loader';
import { useCart } from '../../context/CartContext';
import * as api from '../../services/api';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItemToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewEligibility, setReviewEligibility] = useState({ eligible: false, alreadyReviewed: false });
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, reviewRes, eligibilityRes] = await Promise.all([
          api.getProductById(id),
          api.getProductReviews(id),
          api.getReviewEligibility(id),
        ]);

        if (productRes.data.success) {
          const prod = productRes.data.data;
          setProduct(prod);
          if (prod.images && prod.images.length > 0) {
            setActiveImage(prod.images[0].imageUrl);
          }
        }

        if (reviewRes.data.success) {
          setReviews(reviewRes.data.data);
        }

        if (eligibilityRes.data.success) {
          setReviewEligibility(eligibilityRes.data.data);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <Loader fullPage />;
  if (!product) return <div style={{padding: '40px', textAlign: 'center'}}>Product not found</div>;

  const handleAddToCart = async () => {
    setAdding(true);
    const success = await addItemToCart(product.id, qty);
    setAdding(false);
    if (!success) {
      alert("Failed to add to cart");
    }
  };

  const handleWishlist = async () => {
    try {
      await api.addToWishlist(product.id);
      alert('Added to wishlist');
    } catch (error) {
      console.error('Failed to add to wishlist', error);
      alert('Unable to add to wishlist right now.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewEligibility.eligible) {
      alert('You can only review products you have purchased.');
      return;
    }

    setReviewSubmitting(true);
    try {
      const payload = {
        rating: parseInt(reviewForm.rating),
        title: reviewForm.title,
        comment: reviewForm.comment,
      };

      const [submitRes, reviewsRes, productRes, eligibilityRes] = await Promise.all([
        api.upsertProductReview(id, payload),
        api.getProductReviews(id),
        api.getProductById(id),
        api.getReviewEligibility(id),
      ]);

      if (submitRes.data.success) {
        setReviewForm({ rating: 5, title: '', comment: '' });
      }

      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.data);
      }

      if (productRes.data.success) {
        setProduct(productRes.data.data);
      }

      if (eligibilityRes.data.success) {
        setReviewEligibility(eligibilityRes.data.data);
      }
    } catch (error) {
      console.error('Failed to submit review', error);
      alert(error?.response?.data?.error || 'Unable to submit review right now.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleBuyNow = async () => {
    setAdding(true);
    const success = await addItemToCart(product.id, qty);
    setAdding(false);
    if (success) {
      navigate('/cart');
    } else {
      alert("Failed to process Buy Now");
    }
  };

  const p = parseFloat(product.price).toFixed(2);
  const [whole, fraction] = p.split('.');
  const discount = 22;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  const deliveryText = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="pd-page">
      <div className="pd-breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to={`/products?category=${product.category?.slug || ''}`}>{product.category?.name || 'Products'}</Link>
        <span>›</span>
        <span className="pd-crumb-active">{product.name}</span>
      </div>

      {/* LEFT: Images */}
      <div className="pd-image-section">
        <div className="pd-thumbnails">
          {product.images?.map((img, idx) => (
            <div 
              key={idx} 
              className={`pd-thumbnail ${activeImage === img.imageUrl ? 'active' : ''}`}
              onMouseEnter={() => setActiveImage(img.imageUrl)}
            >
              <img src={img.imageUrl} alt={`Thumbnail ${idx}`} />
            </div>
          ))}
        </div>
        <div className="pd-main-image">
          <img src={activeImage || 'https://via.placeholder.com/400'} alt={product.name} />
        </div>
      </div>

      {/* CENTER: Details */}
      <div className="pd-info-section">
        <h1 className="pd-title">{product.name}</h1>
        <div className="pd-rating">
          <StarRating rating={parseFloat(product.rating)} count={product.reviewCount} />
        </div>
        <div className="pd-meta-row">
          <span className="pd-choice-badge">Amazon's Choice</span>
          <span className="pd-prime-badge">prime</span>
        </div>
        <hr className="pd-divider" />

        <div className="pd-offer-line">
          <span className="pd-offer-discount">-{discount}%</span>
          <span> Limited time deal</span>
        </div>
        
        <div className="pd-price-block">
          <span className="pd-currency">₹</span>
          <span className="pd-price-whole">{whole}</span>
          <span className="pd-price-fraction">{fraction}</span>
        </div>
        <div className="pd-taxes-text">Inclusive of all taxes</div>
        <div className="pd-delivery-promise">FREE delivery by <strong>{deliveryText}</strong>. Order within 6 hrs 40 mins.</div>
        
        <hr className="pd-divider" />
        
        <div className="pd-description">
          <h3>About this item</h3>
          <p>{product.description}</p>
        </div>
      </div>

      {/* RIGHT: Buy Box */}
      <div className="pd-buybox hide-on-mobile">
        <div className="pd-buybox-price">
          <span className="pd-currency">₹</span>
          <span className="pd-price-whole">{whole}</span>
          <span className="pd-price-fraction">{fraction}</span>
        </div>
        
        <div className="pd-delivery">
          <span className="text-link">FREE delivery</span> by <strong>{deliveryText}</strong>
        </div>
        
        <div className="pd-delivery-location">
          <span className="pd-pin">📍</span> Deliver to Anuj - Mumbai 400001
        </div>
        
        <h3 className={`pd-stock ${product.stockQty > 0 ? 'in-stock' : 'out-stock'}`}>
          {product.stockQty > 0 ? 'In stock' : 'Currently unavailable'}
        </h3>
        
        {product.stockQty > 0 && (
          <>
            <div className="pd-qty">
              <label>Quantity: </label>
              <select value={qty} onChange={e => setQty(parseInt(e.target.value))}>
                {[...Array(Math.min(10, product.stockQty)).keys()].map(x => (
                  <option key={x+1} value={x+1}>{x+1}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="btn pd-btn-add" 
              onClick={handleAddToCart}
              disabled={adding}
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </button>
            <button 
              className="btn btn-secondary pd-btn-buy" 
              onClick={handleBuyNow}
              disabled={adding}
            >
              Buy Now
            </button>

            <div className="pd-secure" style={{marginTop: '15px'}}>
              <span className="secure-icon">🔒</span> Secure transaction
            </div>

            <table className="pd-seller-info">
              <tbody>
                <tr>
                  <td className="pd-seller-label">Ships from</td>
                  <td>Amazon</td>
                </tr>
                <tr>
                  <td className="pd-seller-label">Sold by</td>
                  <td>Amazon Retail</td>
                </tr>
                <tr>
                  <td className="pd-seller-label">Returns</td>
                  <td className="pd-return-link">10 days Returnable</td>
                </tr>
              </tbody>
            </table>

            <button type="button" className="pd-wishlist-btn" onClick={handleWishlist}>Add to Wish List</button>
          </>
        )}
      </div>

      <section className="pd-reviews-section">
        <h3>Customer Reviews</h3>

        {reviews.length === 0 ? (
          <p className="pd-review-empty">No reviews yet for this product.</p>
        ) : (
          <div className="pd-review-list">
            {reviews.map((review) => (
              <article key={review.id} className="pd-review-card">
                <div className="pd-review-head">
                  <strong>{review.user?.name || 'Customer'}</strong>
                  <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="pd-review-rating">Rating: {review.rating}/5</div>
                {review.title && <h4>{review.title}</h4>}
                <p>{review.comment}</p>
              </article>
            ))}
          </div>
        )}

        {reviewEligibility.eligible ? (
          <form className="pd-review-form" onSubmit={handleReviewSubmit}>
            <h4>{reviewEligibility.alreadyReviewed ? 'Update your review' : 'Write a review'}</h4>
            <div className="pd-review-row">
              <label>Rating</label>
              <select value={reviewForm.rating} onChange={(e) => setReviewForm((prev) => ({ ...prev, rating: e.target.value }))}>
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </select>
            </div>
            <div className="pd-review-row">
              <label>Title (optional)</label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your review"
              />
            </div>
            <div className="pd-review-row">
              <label>Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                placeholder="Share details about your experience"
                minLength={10}
                required
              />
            </div>
            <button type="submit" className="pd-review-submit" disabled={reviewSubmitting}>
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <p className="pd-review-note">Only verified purchasers can write a review for this product.</p>
        )}
      </section>

      {/* Mobile Buy Box (shown at bottom on small screens) */}
      <div className="pd-mobile-buybox">
        {product.stockQty > 0 ? (
          <button className="btn pd-btn-add" onClick={handleAddToCart} disabled={adding}>
             {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        ) : (
          <div className="out-stock">Out of stock</div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
