import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import * as api from '../../services/api';
import './ProductListing.css';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    const fetchCats = async () => {
      const res = await api.getCategories();
      if (res.data.success) {
        setCategories(res.data.data);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await api.getProducts({ q, category, sort, limit: 50 });
        if (res.data.success) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [q, category, sort]);

  const handleSortChange = (e) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('sort', e.target.value);
    window.location.search = searchParams.toString();
  };

  return (
    <div className="pl-page">
      <div className="pl-sidebar hide-on-mobile">
        <h3>Categories</h3>
        <ul className="pl-category-list">
          <li>
            <a href="/products" className={!category ? 'active' : ''}>All Categories</a>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <a 
                href={`/products?category=${cat.slug}`}
                className={category === cat.slug ? 'active' : ''}
              >
                {cat.name}
              </a>
            </li>
          ))}
        </ul>

        <div className="pl-filter-section">
          <h3>Customer Reviews</h3>
          <div><a href="?minRating=4">4 Stars & Up</a></div>
          <div><a href="?minRating=3">3 Stars & Up</a></div>
        </div>
      </div>

      <div className="pl-main">
        <div className="pl-header">
          <div className="pl-header-results">
            {loading ? 'Loading...' : `${products.length} results`} 
            {q && <span> for <strong>"{q}"</strong></span>}
          </div>
          <div className="pl-header-sort">
            <select value={sort} onChange={handleSortChange}>
              <option value="newest">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Avg. Customer Review</option>
            </select>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="pl-grid">
            {products.length > 0 ? (
              products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="no-results">
                <h2>No results found</h2>
                <p>Try checking your spelling or use more general terms</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListing;
