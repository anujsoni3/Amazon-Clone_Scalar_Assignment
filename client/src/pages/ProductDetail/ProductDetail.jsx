import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import StarRating from '../../components/StarRating/StarRating';
import Loader from '../../components/Loader/Loader';
import { useCart } from '../../context/CartContext';
import * as api from '../../services/api';
import { getSizedFallback, normalizeImageUrl, withImageFallback } from '../../utils/image';
import { formatPrice } from '../../utils/price';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItemToCart, setNotice } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewEligibility, setReviewEligibility] = useState({ eligible: false, alreadyReviewed: false });
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [reviewImageUrl, setReviewImageUrl] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [zoomActive, setZoomActive] = useState(false);
  const [zoomPoint, setZoomPoint] = useState({ x: 50, y: 50 });
  const [openSpecSection, setOpenSpecSection] = useState('features');
  const [reviewSearch, setReviewSearch] = useState('');
  const [appliedReviewSearch, setAppliedReviewSearch] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all');
  const [reviewSort, setReviewSort] = useState('recent');
  const [reviewMediaFilter, setReviewMediaFilter] = useState('all');
  const [loadingReviews, setLoadingReviews] = useState(true);

  const fallbackImage = getSizedFallback(800, 600);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const reviewRes = await api.getProductReviews(id, {
        rating: reviewRatingFilter,
        sort: reviewSort,
        q: appliedReviewSearch || undefined,
        hasImage: reviewMediaFilter === 'images' ? '1' : undefined,
      });

      if (reviewRes.data.success) {
        setReviews(reviewRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const [productRes, eligibilityRes] = await Promise.all([
          api.getProductById(id),
          api.getReviewEligibility(id),
        ]);

        if (productRes.data.success) {
          const prod = productRes.data.data;
          setProduct(prod);
          if (prod.images && prod.images.length > 0) {
            setActiveImage(normalizeImageUrl(prod.images[0].imageUrl, fallbackImage));
          }
        }

        if (eligibilityRes.data.success) {
          setReviewEligibility(eligibilityRes.data.data);
        }

        if (productRes.data.success && productRes.data.data?.category?.slug) {
          const relatedRes = await api.getProducts({
            category: productRes.data.data.category?.slug,
            limit: 6,
          });

          if (relatedRes.data.success) {
            setSuggestions(relatedRes.data.data.filter((candidate) => candidate.id !== productRes.data.data.id));
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    fetchReviews();
  }, [id, reviewRatingFilter, reviewSort, appliedReviewSearch, reviewMediaFilter]);

  useEffect(() => {
    if (location.state?.openReview && reviewEligibility.eligible) {
      const form = document.getElementById('write-review');
      if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.state, reviewEligibility]);

  if (loading) return <Loader fullPage />;
  if (!product) return <div style={{ padding: '40px', textAlign: 'center' }}>Product not found</div>;

  const handleAddToCart = async () => {
    setAdding(true);
    const success = await addItemToCart(product.id, qty);
    setAdding(false);
    if (!success) {
      alert('Failed to add to cart');
    }
  };

  const handleWishlist = async () => {
    try {
      await api.addToWishlist(product.id);
      setWishlisted(true);
      setNotice({ type: 'success', message: 'Item saved to wishlist' });
      setTimeout(() => setWishlisted(false), 1400);
    } catch (error) {
      console.error('Failed to add to wishlist', error);
      setNotice({ type: 'error', message: 'Unable to save item to wishlist' });
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
        rating: parseInt(reviewForm.rating, 10),
        title: reviewForm.title,
        comment: reviewForm.comment,
        imageUrl: reviewImageUrl,
      };

      const [submitRes, productRes, eligibilityRes] = await Promise.all([
        api.upsertProductReview(id, payload),
        api.getProductById(id),
        api.getReviewEligibility(id),
      ]);

      if (submitRes.data.success) {
        setReviewForm({ rating: 5, title: '', comment: '' });
        setReviewImageUrl('');
        await fetchReviews();
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

  const handleBuyNow = () => {
    navigate('/checkout', {
      state: {
        buyNowItem: {
          id: `buy-now-${product.id}`,
          product,
          quantity: qty,
          productId: product.id,
        },
      },
    });
  };

  const { whole, fraction } = formatPrice(product.price);
  const discount = 22;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);

  const deliveryText = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const reviewSource = reviews;
  const reviewImages = reviewSource.filter((review) => review.imageUrl);
  const hasReviewFiltersApplied = reviewRatingFilter !== 'all' || reviewMediaFilter !== 'all' || Boolean(appliedReviewSearch.trim());

  const getEstimatedBucketPercentages = () => {
    const avg = Number(product.rating || 0);
    if (avg <= 0) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }

    const center = Math.max(1, Math.min(5, Math.round(avg)));
    const map = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    map[center] = 62;
    if (center < 5) map[center + 1] += 21;
    if (center > 1) map[center - 1] += 14;
    const used = Object.values(map).reduce((sum, value) => sum + value, 0);
    map[center] += Math.max(0, 100 - used);
    return map;
  };

  const estimatedPercentages = getEstimatedBucketPercentages();

  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => {
    const count = reviewSource.filter((review) => Number(review.rating) === star).length;
    const percentage = reviewSource.length
      ? Math.round((count / reviewSource.length) * 100)
      : (!hasReviewFiltersApplied && Number(product.reviewCount) > 0 ? estimatedPercentages[star] : 0);
    return { star, count, percentage };
  });

  const averageRating = reviewSource.length
    ? (reviewSource.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviewSource.length).toFixed(1)
    : Number(product.rating || 0).toFixed(1);

  const specRows = [
    { key: 'Brand', value: product.category?.name || 'Amazon Basics' },
    { key: 'Model Name', value: product.name },
    { key: 'Category', value: product.category?.name || 'General' },
    { key: 'Availability', value: product.stockQty > 0 ? 'In stock' : 'Out of stock' },
    { key: 'Rating', value: `${averageRating} out of 5` },
  ];

  const handleMainImageMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setZoomPoint({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  return (
    <div className="pd-page">
      <div className="pd-breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to={`/products?category=${product.category?.slug || ''}`}>{product.category?.name || 'Products'}</Link>
        <span>›</span>
        <span className="pd-crumb-active">{product.name}</span>
      </div>

      <section className="pd-top-layout">
        <div className="pd-image-section">
          <div className="pd-thumbnails">
            {product.images?.map((img, idx) => {
              const imageUrl = normalizeImageUrl(img.imageUrl, fallbackImage);
              return (
                <div
                  key={idx}
                  className={`pd-thumbnail ${activeImage === imageUrl ? 'active' : ''}`}
                  onMouseEnter={() => setActiveImage(imageUrl)}
                >
                  <img src={imageUrl} alt={`Thumbnail ${idx}`} onError={(event) => withImageFallback(event, fallbackImage)} />
                </div>
              );
            })}
          </div>
          <div
            className={`pd-main-image ${zoomActive ? 'zoom-active' : ''}`}
            onMouseMove={handleMainImageMove}
            onMouseEnter={() => setZoomActive(true)}
            onMouseLeave={() => setZoomActive(false)}
          >
            <img
              src={activeImage || fallbackImage}
              alt={product.name}
              onError={(event) => withImageFallback(event, fallbackImage)}
              style={zoomActive ? { transformOrigin: `${zoomPoint.x}% ${zoomPoint.y}%` } : undefined}
            />
          </div>
        </div>

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
            <span className="pd-price-fraction">.{fraction}</span>
          </div>
          <div className="pd-taxes-text">Inclusive of all taxes</div>
          <div className="pd-delivery-promise">FREE delivery by <strong>{deliveryText}</strong>. Order within 6 hrs 40 mins.</div>

          <hr className="pd-divider" />

          <div className="pd-description">
            <h3>About this item</h3>
            <p>{product.description}</p>
          </div>
        </div>

        <div className="pd-buybox hide-on-mobile">
          <div className="pd-buybox-price">
            <span className="pd-currency">₹</span>
            <span className="pd-price-whole">{whole}</span>
            <span className="pd-price-fraction">.{fraction}</span>
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
                <select value={qty} onChange={(e) => setQty(parseInt(e.target.value, 10))}>
                  {[...Array(Math.min(10, product.stockQty)).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                  ))}
                </select>
              </div>

              <button className="btn pd-btn-add" onClick={handleAddToCart} disabled={adding}>
                {adding ? 'Adding...' : 'Add to Cart'}
              </button>
              <button className="btn btn-secondary pd-btn-buy" onClick={handleBuyNow} disabled={adding}>
                Buy Now
              </button>

              <div className="pd-secure pd-secure-spacing">
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

              <button type="button" className="pd-wishlist-btn" onClick={handleWishlist}>
                {wishlisted ? 'Saved to Wish List' : 'Add to Wish List'}
              </button>
            </>
          )}
        </div>
      </section>

      <section className="pd-suggestions-section">
        <h3>Customers who viewed this item also viewed</h3>
        <div className="pd-suggestions-row">
          {suggestions.slice(0, 5).map((suggestion) => (
            <Link key={suggestion.id} to={`/products/${suggestion.id}`} className="pd-suggestion-card">
              <img src={normalizeImageUrl(suggestion.images?.[0]?.imageUrl, fallbackImage)} alt={suggestion.name} onError={(event) => withImageFallback(event, fallbackImage)} />
              <span>{suggestion.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="pd-reviews-section">
        <h3>Customer Reviews</h3>

        <div className="pd-review-toolbar">
          <div className="pd-review-toolbar-row">
            <label htmlFor="review-rating-filter">Filter</label>
            <select id="review-rating-filter" value={reviewRatingFilter} onChange={(e) => setReviewRatingFilter(e.target.value)}>
              <option value="all">All stars</option>
              <option value="5">5 star only</option>
              <option value="4">4 star only</option>
              <option value="3">3 star only</option>
              <option value="2">2 star only</option>
              <option value="1">1 star only</option>
            </select>
          </div>

          <div className="pd-review-toolbar-row">
            <label htmlFor="review-sort">Sort</label>
            <select id="review-sort" value={reviewSort} onChange={(e) => setReviewSort(e.target.value)}>
              <option value="recent">Most recent</option>
              <option value="top">Top ratings</option>
              <option value="critical">Critical reviews</option>
              <option value="helpful">Most helpful</option>
            </select>
          </div>

          <div className="pd-review-toolbar-row">
            <label htmlFor="review-media">Media</label>
            <select id="review-media" value={reviewMediaFilter} onChange={(e) => setReviewMediaFilter(e.target.value)}>
              <option value="all">All reviews</option>
              <option value="images">With images</option>
            </select>
          </div>

          <form className="pd-review-search" onSubmit={(event) => { event.preventDefault(); setAppliedReviewSearch(reviewSearch.trim()); }}>
            <input
              type="text"
              placeholder="Search reviews"
              value={reviewSearch}
              onChange={(e) => setReviewSearch(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
        </div>

        <div className="pd-review-summary">
          <div className="pd-review-overall">
            <div className="pd-review-score">{averageRating} out of 5</div>
            <p>{product.reviewCount} global ratings</p>
            {appliedReviewSearch && <p className="pd-review-filter-note">Search: "{appliedReviewSearch}"</p>}
            {!reviewSource.length && !hasReviewFiltersApplied && Number(product.reviewCount) > 0 && (
              <p className="pd-review-filter-note">Detailed review text is currently unavailable. Overall rating data is shown above.</p>
            )}
          </div>
          <div className="pd-rating-bars">
            {ratingBuckets.map((bucket) => (
              <div key={bucket.star} className="pd-rating-row">
                <span>{bucket.star} star</span>
                <div className="pd-rating-track"><span style={{ width: `${bucket.percentage}%` }}></span></div>
                <span>{bucket.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {reviewImages.length > 0 && (
          <div className="pd-review-media-strip">
            <h4>Customer photos</h4>
            <div className="pd-review-media-row">
              {reviewImages.slice(0, 8).map((review) => (
                <a key={review.id} href={review.imageUrl} target="_blank" rel="noreferrer" className="pd-review-media-thumb">
                  <img src={normalizeImageUrl(review.imageUrl, fallbackImage)} alt={review.title || 'Customer photo'} onError={(event) => withImageFallback(event, fallbackImage)} />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="pd-review-list">
          {loadingReviews && <p className="pd-review-note">Loading reviews...</p>}
          {!loadingReviews && reviewSource.length === 0 && hasReviewFiltersApplied && <p className="pd-review-note">No reviews found for this filter.</p>}
          {!loadingReviews && reviewSource.length === 0 && !hasReviewFiltersApplied && Number(product.reviewCount) > 0 && (
            <p className="pd-review-note">No individual review entries available yet. Try another product or check back later.</p>
          )}
          {!loadingReviews && reviewSource.length === 0 && Number(product.reviewCount) === 0 && (
            <p className="pd-review-note">No reviews yet. Be the first to review this product.</p>
          )}
          {!loadingReviews && reviewSource.map((review) => (
            <article key={review.id} className="pd-review-card">
              <div className="pd-review-head">
                <strong>{review.user?.name || review.name || 'Customer'}</strong>
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="pd-review-rating">Rating: {review.rating}/5</div>
              {review.verified && <div className="pd-verified">Verified Purchase</div>}
              {review.imageUrl && (
                <div className="pd-review-inline-media">
                  <img src={normalizeImageUrl(review.imageUrl, fallbackImage)} alt={review.title || 'Review photo'} onError={(event) => withImageFallback(event, fallbackImage)} />
                </div>
              )}
              {review.title && <h4>{review.title}</h4>}
              <p>{review.comment}</p>
            </article>
          ))}
        </div>

        {reviewEligibility.eligible ? (
          <form id="write-review" className="pd-review-form" onSubmit={handleReviewSubmit}>
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
            <div className="pd-review-row">
              <label>Photo URL (optional)</label>
              <input
                type="url"
                value={reviewImageUrl}
                onChange={(e) => setReviewImageUrl(e.target.value)}
                placeholder="https://..."
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

      <section className="pd-info-accordion">
        <h3>Product information</h3>

        <article className="pd-accordion-card">
          <button type="button" className="pd-accordion-head" onClick={() => setOpenSpecSection(openSpecSection === 'features' ? '' : 'features')}>
            Features & Specs
            <span>{openSpecSection === 'features' ? '−' : '+'}</span>
          </button>
          {openSpecSection === 'features' && (
            <div className="pd-accordion-body">
              <ul>
                <li>Premium quality build and verified stock guarantee.</li>
                <li>Fast shipping with Amazon-style return protection.</li>
                <li>Optimized for high reliability and daily use.</li>
              </ul>
            </div>
          )}
        </article>

        <article className="pd-accordion-card">
          <button type="button" className="pd-accordion-head" onClick={() => setOpenSpecSection(openSpecSection === 'details' ? '' : 'details')}>
            Item details
            <span>{openSpecSection === 'details' ? '−' : '+'}</span>
          </button>
          {openSpecSection === 'details' && (
            <div className="pd-accordion-body">
              <table className="pd-spec-table">
                <tbody>
                  {specRows.map((row) => (
                    <tr key={row.key}>
                      <th>{row.key}</th>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>

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
