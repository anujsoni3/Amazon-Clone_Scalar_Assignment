import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import * as api from '../../services/api';
import { demoCategories, demoProducts } from '../../data/demoCatalog';
import { getSizedFallback, normalizeImageUrl, withImageFallback } from '../../utils/image';
import { formatPrice } from '../../utils/price';
import './Home.css';

const FALLBACK_IMAGE = getSizedFallback(800, 600);

const createTileArt = (label, topColor, bottomColor) => {
  const safeLabel = String(label || 'Shop').slice(0, 28);
  return `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${topColor}"/>
          <stop offset="100%" stop-color="${bottomColor}"/>
        </linearGradient>
      </defs>
      <rect width="640" height="420" fill="url(#g)"/>
      <circle cx="530" cy="92" r="88" fill="rgba(255,255,255,0.18)"/>
      <circle cx="120" cy="338" r="72" fill="rgba(255,255,255,0.14)"/>
      <rect x="52" y="286" width="536" height="86" rx="16" fill="rgba(255,255,255,0.82)"/>
      <text x="320" y="340" text-anchor="middle" fill="#111111" font-family="Arial" font-size="38" font-weight="700">${safeLabel}</text>
    </svg>
  `)}`;
};

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
      let nextCategories = [];
      let nextFeaturedProducts = [];
      let nextAmazonBasics = [];

      try {
        const [catsRes, prodsRes, basicsRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ limit: 4, sort: 'rating' }),
          api.getProducts({ category: 'amazon-basics', limit: 6 })
        ]);
        
        if (catsRes.data.success && catsRes.data.data.length > 0) nextCategories = catsRes.data.data;
        if (prodsRes.data.success && prodsRes.data.data.length > 0) nextFeaturedProducts = prodsRes.data.data;
        if (basicsRes.data?.success && basicsRes.data.data.length > 0) nextAmazonBasics = basicsRes.data.data;
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        if (nextCategories.length === 0) nextCategories = demoCategories.slice(0, 4);
        if (nextFeaturedProducts.length === 0) nextFeaturedProducts = demoProducts.slice(0, 4);
        if (nextAmazonBasics.length === 0) nextAmazonBasics = demoProducts.filter((product) => product.category?.slug === 'amazon-basics');

        setCategories(nextCategories);
        setFeaturedProducts(nextFeaturedProducts);
        setAmazonBasics(nextAmazonBasics);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <Loader fullPage />;

  const basicsRail = amazonBasics.length > 0 ? amazonBasics : featuredProducts.slice(0, 6);

  const getCategoryThemeImage = (slug) => {
    switch (slug) {
      case 'electronics':
        return createTileArt('Electronics', '#2c4a92', '#5f7fd1');
      case 'books':
        return createTileArt('Books', '#8b4a22', '#c7783f');
      case 'clothing':
        return createTileArt('Clothing', '#3f3f56', '#7c7ca1');
      case 'beauty':
        return createTileArt('Beauty', '#aa5f8b', '#de93be');
      case 'home-kitchen':
        return createTileArt('Home & Kitchen', '#32715f', '#6db39f');
      default:
        return createTileArt('Shop', '#3c5f7a', '#749ab8');
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
        { label: 'Headsets', image: createTileArt('Headsets', '#1f3e71', '#436eb0') },
        { label: 'Keyboards', image: createTileArt('Keyboards', '#4a3d68', '#7d6ca5') },
        { label: 'Computer mice', image: createTileArt('Computer mice', '#395157', '#6f8f96') },
        { label: 'Chairs', image: createTileArt('Chairs', '#5d4b3f', '#9a7f6f') }
      ],
      link: '/products?category=electronics'
    },
    {
      title: 'Shop deals in Fashion',
      items: [
        { label: 'Jeans', image: createTileArt('Jeans', '#2f4f77', '#5577a5') },
        { label: 'Tops', image: createTileArt('Tops', '#97556a', '#d18ca2') },
        { label: 'Dresses', image: createTileArt('Dresses', '#7b406f', '#b774aa') },
        { label: 'Shoes', image: createTileArt('Shoes', '#5a4737', '#90735a') }
      ],
      link: '/products?category=clothing'
    },
    {
      title: 'Refresh your space',
      items: [
        { label: 'Dining', image: createTileArt('Dining', '#5f6f40', '#99b368') },
        { label: 'Home', image: createTileArt('Home', '#3f6477', '#7397aa') },
        { label: 'Kitchen', image: createTileArt('Kitchen', '#4f6b58', '#7fa48e') },
        { label: 'Health', image: createTileArt('Health', '#7b5f8f', '#b595cc') }
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
