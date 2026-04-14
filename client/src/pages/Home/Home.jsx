import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import * as api from '../../services/api';
import './Home.css';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ limit: 4, sort: 'rating' })
        ]);
        
        if (catsRes.data.success) setCategories(catsRes.data.data);
        if (prodsRes.data.success) setFeaturedProducts(prodsRes.data.data);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <Loader fullPage />;

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

  return (
    <div className="home">
      <div className="hero-container">
        <img 
          className="hero-image" 
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop" 
          alt="Amazon Hero Banner" 
        />
      </div>

      <div className="home-content">
        <div className="category-row">
          {categories.slice(0, 4).map(category => (
            <div key={category.id} className="category-card">
              <h2>{category.name}</h2>
              <div className="category-card-image">
                <img src={getCategoryThemeImage(category.slug)} alt={category.name} />
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
      </div>
    </div>
  );
};

export default Home;
