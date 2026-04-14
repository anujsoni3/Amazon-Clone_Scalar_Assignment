import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);

export const getCategories = () => api.get('/categories');

export const getCart = () => api.get('/cart');
export const addToCart = (productId, quantity) => api.post('/cart', { productId, quantity });
export const updateCartItem = (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity });
export const removeFromCart = (itemId) => api.delete(`/cart/${itemId}`);

export const placeOrder = (shippingAddress) => api.post('/orders', { shippingAddress });
export const getOrderHistory = () => api.get('/orders/history');
export const getOrderById = (id) => api.get(`/orders/${id}`);

export default api;
