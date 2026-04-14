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
