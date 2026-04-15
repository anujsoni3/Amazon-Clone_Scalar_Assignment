import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import * as api from '../../services/api';
import './ProductListing.css';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';

  const updateFilters = (updates) => {
    const params = new URLSearchParams(location.search);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    navigate(`/products?${params.toString()}`);
  };

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
        const res = await api.getProducts({
          q,
          category,
          sort,
          minPrice,
          maxPrice,
          minRating,
          limit: 50,
        });
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
  }, [q, category, sort, minPrice, maxPrice, minRating]);

  const handleSortChange = (e) => {
    updateFilters({ sort: e.target.value });
  };

  const applyPriceRange = (range) => {
    updateFilters({ minPrice: range.min, maxPrice: range.max });
  };

  const clearAllFilters = () => {
    updateFilters({ category: '', minPrice: '', maxPrice: '', minRating: '' });
  };

  return (
    <div className="pl-page">
      <div className="pl-sidebar hide-on-mobile">
        <h3>Department</h3>
        <ul className="pl-category-list">
          <li>
            <button type="button" className={!category ? 'active' : ''} onClick={() => updateFilters({ category: '' })}>All Departments</button>
          </li>
          {categories.map(cat => (
            <li key={cat.id}>
              <button
                type="button"
                className={category === cat.slug ? 'active' : ''}
                onClick={() => updateFilters({ category: cat.slug })}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>

        <div className="pl-filter-section">
          <h3>Price</h3>
          <button type="button" className="pl-filter-link" onClick={() => applyPriceRange({ min: '', max: 500 })}>Under ₹500</button>
          <button type="button" className="pl-filter-link" onClick={() => applyPriceRange({ min: 500, max: 1000 })}>₹500 to ₹1,000</button>
          <button type="button" className="pl-filter-link" onClick={() => applyPriceRange({ min: 1000, max: 2500 })}>₹1,000 to ₹2,500</button>
          <button type="button" className="pl-filter-link" onClick={() => applyPriceRange({ min: 2500, max: '' })}>₹2,500 and above</button>
        </div>

        <div className="pl-filter-section">
          <h3>Customer Reviews</h3>
          <button type="button" className="pl-filter-link" onClick={() => updateFilters({ minRating: 4 })}>4 Stars & Up</button>
          <button type="button" className="pl-filter-link" onClick={() => updateFilters({ minRating: 3 })}>3 Stars & Up</button>
          <button type="button" className="pl-filter-link" onClick={() => updateFilters({ minRating: '' })}>Clear rating filter</button>
        </div>

        <div className="pl-filter-section">
          <h3>Amazon Programs</h3>
          <label className="pl-checkbox-row">
            <input type="checkbox" checked readOnly />
            Prime eligible (demo)
          </label>
          <label className="pl-checkbox-row">
            <input type="checkbox" checked={category === 'amazon-basics'} readOnly />
            Amazon Basics
          </label>
          <button type="button" className="pl-clear-btn" onClick={clearAllFilters}>Clear all filters</button>
        </div>
      </div>

      <div className="pl-main">
        <div className="pl-header">
          <div className="pl-header-results">
            {loading ? 'Loading...' : `${products.length} results`} 
            {q && <span> for <strong>"{q}"</strong></span>}
            {(minRating || minPrice || maxPrice) && <span className="pl-applied-filters"> with filters</span>}
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
