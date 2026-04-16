import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

const createIdempotencyKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const withIdempotency = (idempotencyKey) => ({
  headers: {
    'x-idempotency-key': idempotencyKey || createIdempotencyKey(),
  },
});

export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);

export const getCategories = () => api.get('/categories');

export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity) => api.post('/cart', { productId, quantity });
export const updateCartItem = (itemId, quantity, expectedQuantity) => api.put(`/cart/${itemId}`, {
  quantity,
  expectedQuantity,
});
export const removeFromCart = (itemId) => api.delete(`/cart/${itemId}`);

export const placeOrder = (shippingAddress, idempotencyKey) => api.post('/orders', { shippingAddress }, withIdempotency(idempotencyKey));
export const placeBuyNowOrder = (payload, idempotencyKey) => api.post('/orders/buy-now', payload, withIdempotency(idempotencyKey));
export const getOrderHistory = () => api.get('/orders/history');
export const getOrderById = (id) => api.get(`/orders/${id}`);

export const getWishlist = () => api.get('/wishlist');
export const addToWishlist = (productId) => api.post('/wishlist', { productId });
export const removeFromWishlist = (itemId) => api.delete(`/wishlist/${itemId}`);

export const getProductReviews = (productId, params) => api.get(`/reviews/product/${productId}`, { params });
export const getReviewEligibility = (productId) => api.get(`/reviews/eligibility/${productId}`);
export const upsertProductReview = (productId, payload) => api.post(`/reviews/product/${productId}`, payload);

// Account & Profile
export const getUserProfile = () => api.get('/account/profile');
export const getAddresses = () => api.get('/account/addresses');
export const createAddress = (payload) => api.post('/account/addresses', payload);
export const updateAddress = (id, payload) => api.put(`/account/addresses/${id}`, payload);
export const deleteAddress = (id) => api.delete(`/account/addresses/${id}`);

export const getPaymentCards = () => api.get('/account/payment-cards');
export const createPaymentCard = (payload) => api.post('/account/payment-cards', payload);
export const setDefaultPaymentCard = (id) => api.put(`/account/payment-cards/${id}/default`);
export const deletePaymentCard = (id) => api.delete(`/account/payment-cards/${id}`);

export default api;
