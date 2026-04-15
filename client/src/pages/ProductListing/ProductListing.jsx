import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import Loader from '../../components/Loader/Loader';
import * as api from '../../services/api';
import { getSocket } from '../../services/socket';
import { demoCategories, demoProducts, getDemoProductsByCategory } from '../../data/demoCatalog';
import './ProductListing.css';

const COLOR_TOKENS = [
  { label: 'Black', value: 'black', hex: '#111111' },
  { label: 'White', value: 'white', hex: '#f4f4f4' },
  { label: 'Blue', value: 'blue', hex: '#4a6fd4' },
  { label: 'Red', value: 'red', hex: '#d23f31' },
  { label: 'Green', value: 'green', hex: '#4f8a5b' },
  { label: 'Yellow', value: 'yellow', hex: '#f2c94c' },
  { label: 'Pink', value: 'pink', hex: '#e99fb7' },
  { label: 'Grey', value: 'grey', hex: '#94979b' },
  { label: 'Silver', value: 'silver', hex: '#b8bec5' },
  { label: 'Brown', value: 'brown', hex: '#8b5a3c' },
];

const STAR_FILTERS = [4, 3, 2];

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [brandStats, setBrandStats] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';

  const displayQuery = q || category.replace('-', ' ') || 'products';

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

  const getBrandName = (product) => {
    const first = product.name?.trim().split(' ')[0] || 'Generic';
    if (first.length <= 2) return 'Generic';
    return first;
  };

  const getColorMatches = (product) => {
    const text = `${product.name || ''} ${product.description || ''}`.toLowerCase();
    return COLOR_TOKENS.filter((color) => text.includes(color.value)).map((color) => color.value);
  };

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        if (res.data.success && res.data.data.length > 0) {
          setCategories(res.data.data);
          return;
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }

      setCategories(demoCategories);
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
          const fetched = res.data.data || [];
          const nextProducts = fetched.length > 0 ? fetched : getDemoProductsByCategory(category || '').filter((product) => {
            const queryMatch = q ? `${product.name} ${product.description}`.toLowerCase().includes(q.toLowerCase()) : true;
            const ratingMatch = minRating ? Number(product.rating) >= Number(minRating) : true;
            const priceMatch = (minPrice ? Number(product.price) >= Number(minPrice) : true) && (maxPrice ? Number(product.price) <= Number(maxPrice) : true);
            return queryMatch && ratingMatch && priceMatch;
          });

          setProducts(nextProducts);
          setTotalResults(res.data.pagination?.total || nextProducts.length || demoProducts.length);

          const brandMap = {};
          nextProducts.forEach((product) => {
            const brand = getBrandName(product);
            brandMap[brand] = (brandMap[brand] || 0) + 1;
          });
          const sortedBrands = Object.entries(brandMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([brand, count]) => ({ brand, count }));
          setBrandStats(sortedBrands);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        const fallbackProducts = demoProducts.filter((product) => {
          const queryMatch = q ? `${product.name} ${product.description}`.toLowerCase().includes(q.toLowerCase()) : true;
          const categoryMatch = category ? product.category?.slug === category : true;
          const ratingMatch = minRating ? Number(product.rating) >= Number(minRating) : true;
          const priceMatch = (minPrice ? Number(product.price) >= Number(minPrice) : true) && (maxPrice ? Number(product.price) <= Number(maxPrice) : true);
          return queryMatch && categoryMatch && ratingMatch && priceMatch;
        });
        setProducts(fallbackProducts);
        setTotalResults(fallbackProducts.length || demoProducts.length);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [q, category, sort, minPrice, maxPrice, minRating]);

  useEffect(() => {
    let next = [...products];

    if (selectedBrands.length > 0) {
      next = next.filter((product) => selectedBrands.includes(getBrandName(product)));
    }

    if (selectedColors.length > 0) {
      next = next.filter((product) => {
        const matches = getColorMatches(product);
        return selectedColors.some((selected) => matches.includes(selected));
      });
    }

    setFilteredProducts(next);
  }, [products, selectedBrands, selectedColors]);

  const handleSortChange = (e) => {
    updateFilters({ sort: e.target.value });
  };

  const applyPriceRange = (range) => {
    updateFilters({ minPrice: range.min, maxPrice: range.max });
  };

  const clearAllFilters = () => {
    updateFilters({ category: '', minPrice: '', maxPrice: '', minRating: '' });
    setSelectedBrands([]);
    setSelectedColors([]);
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand)
        ? prev.filter((item) => item !== brand)
        : [...prev, brand]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((item) => item !== color)
        : [...prev, color]
    );
  };

  const refreshProductsByIds = useCallback(async (updatedIds) => {
    if (!Array.isArray(updatedIds) || updatedIds.length === 0) return;

    const normalizedIds = updatedIds
      .map((value) => parseInt(value, 10))
      .filter((value) => !Number.isNaN(value));

    if (normalizedIds.length === 0) return;

    const visibleIds = products
      .map((product) => product.id)
      .filter((idValue) => normalizedIds.includes(idValue));

    if (visibleIds.length === 0) return;

    try {
      const refreshed = await Promise.all(
        visibleIds.map(async (productId) => {
          try {
            const response = await api.getProductById(productId);
            return response.data.success ? response.data.data : null;
          } catch {
            return null;
          }
        })
      );

      const byId = new Map(refreshed.filter(Boolean).map((product) => [product.id, product]));
      if (byId.size === 0) return;

      setProducts((prev) => prev.map((product) => byId.get(product.id) || product));
    } catch (error) {
      console.error('Realtime product refresh failed:', error);
    }
  }, [products]);

  useEffect(() => {
    const socket = getSocket();

    const handleInventoryUpdated = (payload) => {
      refreshProductsByIds(payload?.productIds || []);
    };

    socket.on('inventory:updated', handleInventoryUpdated);

    return () => {
      socket.off('inventory:updated', handleInventoryUpdated);
    };
  }, [refreshProductsByIds]);

  const resultCount = filteredProducts.length;

  return (
    <div className="pl-page">
      <div className="pl-results-strip">
        <p>
          1-{Math.min(48, resultCount)} of over {totalResults.toLocaleString()} results for
          {' '}
          <strong>"{displayQuery}"</strong>
        </p>
        <div className="pl-header-sort">
          <span>Sort by: </span>
          <select value={sort} onChange={handleSortChange}>
            <option value="newest">Featured</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Avg. Customer Review</option>
          </select>
        </div>
      </div>

      <div className="pl-sidebar hide-on-mobile">
        <h3>Popular Shopping Ideas</h3>
        <ul className="pl-link-list">
          <li><button type="button" onClick={() => updateFilters({ q: `${displayQuery} tools` })}>{displayQuery} tools</button></li>
          <li><button type="button" onClick={() => updateFilters({ q: `${displayQuery} gadgets` })}>{displayQuery} gadgets</button></li>
          <li><button type="button" onClick={() => updateFilters({ q: `${displayQuery} essentials` })}>{displayQuery} essentials</button></li>
          <li><button type="button" onClick={() => updateFilters({ q: `${displayQuery} set` })}>{displayQuery} set</button></li>
        </ul>

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
          {STAR_FILTERS.map((star) => (
            <button key={star} type="button" className="pl-filter-link pl-star-filter" onClick={() => updateFilters({ minRating: star })}>
              <span className="stars">{'★'.repeat(star)}{'☆'.repeat(5 - star)}</span>
              <span>& Up</span>
            </button>
          ))}
          <button type="button" className="pl-filter-link" onClick={() => updateFilters({ minRating: '' })}>Clear rating filter</button>
        </div>

        <div className="pl-filter-section">
          <h3>Color</h3>
          <div className="pl-color-grid">
            {COLOR_TOKENS.map((color) => (
              <button
                key={color.value}
                type="button"
                className={`pl-color-swatch ${selectedColors.includes(color.value) ? 'active' : ''}`}
                style={{ backgroundColor: color.hex }}
                title={color.label}
                onClick={() => toggleColor(color.value)}
              />
            ))}
          </div>
        </div>

        <div className="pl-filter-section">
          <h3>Brands</h3>
          {brandStats.map((entry) => (
            <label key={entry.brand} className="pl-checkbox-row">
              <input type="checkbox" checked={selectedBrands.includes(entry.brand)} onChange={() => toggleBrand(entry.brand)} />
              {entry.brand}
            </label>
          ))}
          <button type="button" className="pl-filter-link">See more</button>
        </div>

        <div className="pl-filter-section">
          <h3>All Top Brands</h3>
          <label className="pl-checkbox-row">
            <input type="checkbox" checked={selectedBrands.includes('Amazon')} onChange={() => toggleBrand('Amazon')} />
            Amazon
          </label>
          <label className="pl-checkbox-row">
            <input type="checkbox" checked={selectedBrands.includes('AmazonBasics')} onChange={() => toggleBrand('AmazonBasics')} />
            Amazon Basics
          </label>
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
            {loading ? 'Loading...' : `${resultCount} results`} 
            {q && <span> for <strong>"{q}"</strong></span>}
            {(minRating || minPrice || maxPrice || selectedBrands.length > 0 || selectedColors.length > 0) && <span className="pl-applied-filters"> with filters</span>}
          </div>
          <div className="pl-results-hint">Check each product page for other buying options.</div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="pl-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
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
