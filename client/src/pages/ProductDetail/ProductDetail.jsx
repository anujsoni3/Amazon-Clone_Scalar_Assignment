import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.getProductById(id);
        if (res.data.success) {
          const prod = res.data.data;
          setProduct(prod);
          if (prod.images && prod.images.length > 0) {
            setActiveImage(prod.images[0].imageUrl);
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

  return (
    <div className="pd-page">
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
        <hr className="pd-divider" />
        
        <div className="pd-price-block">
          <span className="pd-currency">₹</span>
          <span className="pd-price-whole">{whole}</span>
          <span className="pd-price-fraction">{fraction}</span>
        </div>
        <div className="pd-taxes-text">Inclusive of all taxes</div>
        
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
          <span className="text-link">FREE delivery</span> usually within 3-4 days.
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

            <div className="pd-secure">
              <span className="secure-icon">🔒</span> Secure transaction
            </div>
          </>
        )}
      </div>

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
