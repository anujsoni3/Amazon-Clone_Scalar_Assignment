import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import * as api from '../../services/api';
import { getSizedFallback, normalizeImageUrl, withImageFallback } from '../../utils/image';
import { formatPrice } from '../../utils/price';
import './Home.css';

const FALLBACK_IMAGE = getSizedFallback(800, 600);

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [amazonBasics, setAmazonBasics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroBanners = [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop", // generic amazon-ish boxes
    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1974&auto=format&fit=crop", // camera/electronics themed
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop", // clothing themed
    "https://images.unsplash.com/photo-1588666305190-64ad515cdde0?q=80&w=2070&auto=format&fit=crop"  // home/outdoor themed
  ];

  // Auto Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroBanners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  const slideLeft = () => setCurrentSlide(prev => prev === 0 ? heroBanners.length - 1 : prev - 1);
  const slideRight = () => setCurrentSlide(prev => prev === heroBanners.length - 1 ? 0 : prev + 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes, basicsRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ limit: 4, sort: 'rating' }),
          api.getProducts({ category: 'amazon-basics', limit: 6 })
        ]);
        
        if (catsRes.data.success) setCategories(catsRes.data.data);
        if (prodsRes.data.success) setFeaturedProducts(prodsRes.data.data);
        if (basicsRes.data?.success) setAmazonBasics(basicsRes.data.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <Loader fullPage />;

  const basicsRail = amazonBasics.length > 0 ? amazonBasics : featuredProducts.slice(0, 6);

  const getCategoryThemeImage = (slug) => {
    switch(slug) {
      case 'electronics': return "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80";
      case 'books': return "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80";
      case 'clothing': return "https://images.unsplash.com/photo-1523381210434-271e8be1f528?w=500&q=80";
      case 'beauty': return "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80";
      case 'home-kitchen': return "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=80";
      default: return "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&q=80";
    }
  };

  const handleImageFallback = (event) => {
    withImageFallback(event, FALLBACK_IMAGE);
  };

  const shopByGrid = [
    {
      title: 'Recommended for you',
      isWelcome: true,
      cta: 'Continue browsing',
      ctaLink: '/products',
    },
    {
      title: 'Gaming accessories',
      items: [
        { label: 'Headsets', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=420&q=80' },
        { label: 'Keyboards', image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=420&q=80' },
        { label: 'Computer mice', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=420&q=80' },
        { label: 'Chairs', image: 'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=420&q=80' }
      ],
      link: '/products?category=electronics'
    },
    {
      title: 'Shop deals in Fashion',
      items: [
        { label: 'Jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=420&q=80' },
        { label: 'Tops', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=420&q=80' },
        { label: 'Dresses', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=420&q=80' },
        { label: 'Shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=420&q=80' }
      ],
      link: '/products?category=clothing'
    },
    {
      title: 'Refresh your space',
      items: [
        { label: 'Dining', image: 'https://images.unsplash.com/photo-1617104551722-3b2d513664c0?w=420&q=80' },
        { label: 'Home', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=420&q=80' },
        { label: 'Kitchen', image: 'https://images.unsplash.com/photo-1556911220-bda9f7f7597e?w=420&q=80' },
        { label: 'Health', image: 'https://images.unsplash.com/photo-1612532275214-e4ca76d0e4d1?w=420&q=80' }
      ],
      link: '/products?category=home-kitchen'
    }
  ];

  return (
    <div className="home">
      <div className="hero-container">
        <div className="hero-slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {heroBanners.map((img, idx) => (
            <img key={idx} className="hero-image" src={normalizeImageUrl(img, FALLBACK_IMAGE)} alt={`Banner ${idx}`} onError={handleImageFallback} />
          ))}
        </div>
        <button className="slider-btn left-btn" onClick={slideLeft}>&#10094;</button>
        <button className="slider-btn right-btn" onClick={slideRight}>&#10095;</button>
        <div className="hero-fade-bottom"></div>
      </div>

      <div className="home-content">
        <section className="top-cards-row">
          {shopByGrid.map((card) => (
            <article key={card.title} className="quad-card">
              <h2>{card.title}</h2>
              {card.isWelcome ? (
                <>
                  <p className="welcome-copy">Default shopper mode is on. Continue exploring the catalog, saved preferences, and fast checkout flow.</p>
                  <div className="welcome-pills">
                    <Link to="/products?sort=rating" className="welcome-pill">Top rated</Link>
                    <Link to="/products?category=amazon-basics" className="welcome-pill">Amazon Basics</Link>
                    <Link to="/orders/history" className="welcome-pill">Your orders</Link>
                  </div>
                  <Link to={card.ctaLink} className="welcome-cta">{card.cta}</Link>
                </>
              ) : (
                <>
                  <div className="quad-grid">
                    {card.items.map((item) => (
                      <div key={item.label} className="quad-item">
                        <img src={normalizeImageUrl(item.image, FALLBACK_IMAGE)} alt={item.label} onError={handleImageFallback} />
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link to={card.link} className="category-link">See more</Link>
                </>
              )}
            </article>
          ))}
        </section>

        <div className="category-row">
          {categories.slice(0, 4).map(category => (
            <div key={category.id} className="category-card">
              <h2>{category.name}</h2>
              <div className="category-card-image">
                <img src={normalizeImageUrl(getCategoryThemeImage(category.slug), FALLBACK_IMAGE)} alt={category.name} onError={handleImageFallback} />
              </div>
              <div className="category-card-inner">
                 <Link to={`/products?category=${category.slug}`} className="category-link">Shop now</Link>
              </div>
            </div>
          ))}
        </div>

        <div className="product-row-container">
          <h2>Highly Rated Products</h2>
          <div className="product-row">
            {featuredProducts.map(product => (
              <div key={product.id} className="product-row-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {basicsRail.length > 0 && (
          <section className="product-row-container basics-container">
            <div className="section-headline">
              <h2>Explore Amazon Basics</h2>
              <Link to="/products?category=amazon-basics" className="category-link">See all Basics</Link>
            </div>
            <div className="product-row">
              {basicsRail.map(product => (
                <div key={product.id} className="product-row-item">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="product-row-container recommendations-container">
          <div className="section-headline">
            <h2>Customers also bought</h2>
            <Link to="/products" className="category-link">View more</Link>
          </div>
          <div className="product-row">
            {featuredProducts.slice(0, 4).map(product => (
              <div key={`rec-${product.id}`} className="product-row-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
