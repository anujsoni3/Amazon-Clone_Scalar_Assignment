import { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({ itemCount: 0, totalQty: 0, subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const { data } = await api.getCart();
      if (data.success) {
        setCartItems(data.data);
        setCartSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItemToCart = async (productId, quantity = 1) => {
    try {
      await api.addToCart(productId, quantity);
      await fetchCart(); // Re-fetch to get updated totals
      setNotice({ type: 'success', message: 'Item added to cart' });
      return true;
    } catch (error) {
      console.error('Error adding to cart', error);
      setNotice({ type: 'error', message: 'Failed to add item to cart' });
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.updateCartItem(itemId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity', error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.removeFromCart(itemId);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item', error);
    }
  };

  const clearCartLocally = () => {
    setCartItems([]);
    setCartSummary({ itemCount: 0, totalQty: 0, subtotal: 0 });
  };

  const clearNotice = () => setNotice(null);

  return (
    <CartContext.Provider value={{
      cartItems,
      cartSummary,
      loading,
      notice,
      clearNotice,
      setNotice,
      addItemToCart,
      updateQuantity,
      removeItem,
      fetchCart,
      clearCartLocally
    }}>
      {children}
    </CartContext.Provider>
  );
};
