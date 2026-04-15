import { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../services/api';
import { demoCartItems, demoProducts } from '../data/demoCatalog';

const CartContext = createContext();
const LOCAL_CART_KEY = 'amazon-clone-local-cart';

const readLocalCart = () => {
  try {
    const stored = localStorage.getItem(LOCAL_CART_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const writeLocalCart = (items, summary) => {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify({ items, summary }));
};

const buildSummary = (items) => {
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
  return {
    itemCount: items.length,
    totalQty,
    subtotal: parseFloat(subtotal.toFixed(2)),
  };
};

const normalizeDemoCart = () => demoCartItems.map((item) => ({ ...item }));

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({ itemCount: 0, totalQty: 0, subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [useLocalCart, setUseLocalCart] = useState(false);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const { data } = await api.getCart();
      if (data.success) {
        if (data.data.length > 0) {
          setUseLocalCart(false);
          setCartItems(data.data);
          setCartSummary(data.summary);
          writeLocalCart(data.data, data.summary);
        } else {
          const local = readLocalCart();
          if (local?.items?.length > 0) {
            setUseLocalCart(true);
            setCartItems(local.items);
            setCartSummary(local.summary || buildSummary(local.items));
          } else {
            const demoItems = normalizeDemoCart();
            const summary = buildSummary(demoItems);
            setUseLocalCart(true);
            setCartItems(demoItems);
            setCartSummary(summary);
            writeLocalCart(demoItems, summary);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      const local = readLocalCart();
      const demoItems = local?.items?.length ? local.items : normalizeDemoCart();
      const summary = local?.summary || buildSummary(demoItems);
      setUseLocalCart(true);
      setCartItems(demoItems);
      setCartSummary(summary);
      writeLocalCart(demoItems, summary);
    } finally {
      setLoading(false);
    }
  };

  const addItemToCart = async (productId, quantity = 1) => {
    if (useLocalCart) {
      const existingIndex = cartItems.findIndex((item) => item.product.id === productId);
      let nextItems = [...cartItems];

      if (existingIndex >= 0) {
        nextItems[existingIndex] = {
          ...nextItems[existingIndex],
          quantity: nextItems[existingIndex].quantity + quantity,
        };
      } else {
        const product = demoProducts.find((item) => item.id === productId)
          || demoCartItems.map((item) => item.product).find((item) => item.id === productId)
          || demoProducts[0];
        nextItems = [
          ...nextItems,
          {
            id: Date.now(),
            quantity,
            product,
          },
        ];
      }

      const summary = buildSummary(nextItems);
      setCartItems(nextItems);
      setCartSummary(summary);
      writeLocalCart(nextItems, summary);
      setNotice({ type: 'success', message: 'Item added to cart' });
      return true;
    }

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
    if (useLocalCart) {
      const nextItems = cartItems.map((item) => (
        item.id === itemId ? { ...item, quantity } : item
      ));
      const summary = buildSummary(nextItems);
      setCartItems(nextItems);
      setCartSummary(summary);
      writeLocalCart(nextItems, summary);
      return;
    }

    try {
      await api.updateCartItem(itemId, quantity);
      await fetchCart();
    } catch (error) {
      console.error('Error updating quantity', error);
    }
  };

  const removeItem = async (itemId) => {
    if (useLocalCart) {
      const nextItems = cartItems.filter((item) => item.id !== itemId);
      const summary = buildSummary(nextItems);
      setCartItems(nextItems);
      setCartSummary(summary);
      writeLocalCart(nextItems, summary);
      return;
    }

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
    localStorage.removeItem(LOCAL_CART_KEY);
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
