import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import * as api from '../../services/api';
import { demoCategories, demoProducts } from '../../data/demoCatalog';
import { getSizedFallback, normalizeImageUrl, withImageFallback } from '../../utils/image';
import './Home.css';

const FALLBACK_IMAGE = getSizedFallback(800, 600);

const MultiSourceImage = ({ sources = [], alt, className }) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const normalizedSources = (sources || []).filter(Boolean);
  const imageSrc = normalizeImageUrl(normalizedSources[sourceIndex], FALLBACK_IMAGE);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={(event) => {
        if (sourceIndex < normalizedSources.length - 1) {
          setSourceIndex((prev) => prev + 1);
          return;
        }
        withImageFallback(event, FALLBACK_IMAGE);
      }}
    />
  );
};

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [amazonBasics, setAmazonBasics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroBanners = [
    [
      'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2000&auto=format&fit=crop',
    ],
    [
      'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop',
    ],
    [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=2000&auto=format&fit=crop',
    ],
    [
      'https://images.unsplash.com/photo-1588666305190-64ad515cdde0?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2000&auto=format&fit=crop',
    ],
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

  const getCategoryThemeImages = (slug) => {
    switch (slug) {
      case 'electronics':
        return [
          'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80',
          'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80',
          'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500&q=80',
        ];
      case 'books':
        return [
          'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&q=80',
          'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&q=80',
          'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=500&q=80',
        ];
      case 'clothing':
        return [
          'https://images.unsplash.com/photo-1523381210434-271e8be1f528?w=500&q=80',
          'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&q=80',
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80',
        ];
      case 'beauty':
        return [
          'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&q=80',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80',
          'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500&q=80',
        ];
      case 'home-kitchen':
        return [
          'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=80',
          'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500&q=80',
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=500&q=80',
        ];
      default:
        return [
          'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=500&q=80',
          'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=500&q=80',
        ];
    }
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
        {
          label: 'Headsets',
          images: [
            'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=420&q=80',
            'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=420&q=80',
          ],
        },
        {
          label: 'Keyboards',
          images: [
            'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=420&q=80',
            'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=420&q=80',
          ],
        },
        {
          label: 'Computer mice',
          images: [
            'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=420&q=80',
            'https://images.unsplash.com/photo-1586349906319-48d20e9d17d1?w=420&q=80',
          ],
        },
        {
          label: 'Chairs',
          images: [
            'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=420&q=80',
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=420&q=80',
          ],
        },
      ],
      link: '/products?category=electronics'
    },
    {
      title: 'Shop deals in Fashion',
      items: [
        {
          label: 'Jeans',
          images: [
            'https://images.unsplash.com/photo-1542272604-787c3835535d?w=420&q=80',
            'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=420&q=80',
          ],
        },
        {
          label: 'Tops',
          images: [
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=420&q=80',
            'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=420&q=80',
          ],
        },
        {
          label: 'Dresses',
          images: [
            'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=420&q=80',
            'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=420&q=80',
          ],
        },
        {
          label: 'Shoes',
          images: [
            'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=420&q=80',
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=420&q=80',
          ],
        },
      ],
      link: '/products?category=clothing'
    },
    {
      title: 'Refresh your space',
      items: [
        {
          label: 'Dining',
          images: [
            'https://images.unsplash.com/photo-1617104551722-3b2d513664c0?w=420&q=80',
            'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=420&q=80',
          ],
        },
        {
          label: 'Home',
          images: [
            'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=420&q=80',
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=420&q=80',
          ],
        },
        {
          label: 'Kitchen',
          images: [
            'https://images.unsplash.com/photo-1556911220-bda9f7f7597e?w=420&q=80',
            'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=420&q=80',
          ],
        },
        {
          label: 'Health',
          images: [
            'https://images.unsplash.com/photo-1576671081837-49000212a370?w=420&q=80',
            'https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?w=420&q=80',
          ],
        },
      ],
      link: '/products?category=home-kitchen'
    }
  ];

  return (
    <div className="home">
      <div className="hero-container">
        <div className="hero-slider" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {heroBanners.map((sources, idx) => (
            <MultiSourceImage key={idx} className="hero-image" sources={sources} alt={`Banner ${idx + 1}`} />
          ))}
        </div>
        <button className="slider-btn left-btn" onClick={slideLeft}>&#10094;</button>
        <button className="slider-btn right-btn" onClick={slideRight}>&#10095;</button>
        <div className="hero-fade-bottom"></div>
      </div>

      <div className="home-content">
        <section className="top-cards-row">
          {shopByGrid.map((card) => {
            if (card.isWelcome) {
              return (
                <article key={card.title} className="quad-card">
                  <h2>{card.title}</h2>
                  <p className="welcome-copy">Default shopper mode is on. Continue exploring the catalog, saved preferences, and fast checkout flow.</p>
                  <div className="welcome-pills">
                    <Link to="/products?sort=rating" className="welcome-pill">Top rated</Link>
                    <Link to="/products?category=amazon-basics" className="welcome-pill">Amazon Basics</Link>
                    <Link to="/orders/history" className="welcome-pill">Your orders</Link>
                  </div>
                  <Link to={card.ctaLink} className="welcome-cta">{card.cta}</Link>
                </article>
              );
            }

            return (
              <Link key={card.title} to={card.link} className="quad-card quad-card-link">
                <h2>{card.title}</h2>
                <div className="quad-grid">
                  {card.items.map((item) => (
                    <div key={item.label} className="quad-item">
                      <MultiSourceImage sources={item.images} alt={item.label} />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </section>

        <div className="category-row">
          {categories.slice(0, 4).map(category => (
            <Link key={category.id} to={`/products?category=${category.slug}`} className="category-card category-card-link">
              <h2>{category.name}</h2>
              <div className="category-card-image">
                <MultiSourceImage sources={getCategoryThemeImages(category.slug)} alt={category.name} />
              </div>
              <div className="category-card-inner">
                <span className="category-link">Shop now</span>
              </div>
            </Link>
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
