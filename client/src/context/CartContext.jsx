import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as api from '../services/api';
import { demoCartItems, demoProducts } from '../data/demoCatalog';
import { getSocket } from '../services/socket';

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

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState({ itemCount: 0, totalQty: 0, subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [useLocalCart, setUseLocalCart] = useState(false);
  const [inventoryPulseAt, setInventoryPulseAt] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      const { data } = await api.getCart();
      if (data.success) {
        setUseLocalCart(false);
        setCartItems(data.data || []);
        setCartSummary(data.summary || { itemCount: 0, totalQty: 0, subtotal: 0 });
        writeLocalCart(data.data || [], data.summary || { itemCount: 0, totalQty: 0, subtotal: 0 });
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      const local = readLocalCart();
      const demoItems = local?.items?.length ? local.items : [];
      const summary = local?.summary || buildSummary(demoItems);
      setUseLocalCart(true);
      setCartItems(demoItems);
      setCartSummary(summary);
      writeLocalCart(demoItems, summary);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    const socket = getSocket();

    const handleCartUpdated = (payload) => {
      if (payload?.userId !== 1) return;
      if (useLocalCart) return;
      fetchCart();
    };

    const handleOrderCreated = (payload) => {
      if (payload?.userId !== 1) return;
      setNotice({ type: 'success', message: 'Order placed in another tab. Cart refreshed.' });
      if (!useLocalCart) {
        fetchCart();
      }
    };

    const handleInventoryUpdated = () => {
      setInventoryPulseAt(Date.now());
      if (!useLocalCart) {
        fetchCart();
      }
    };

    socket.on('cart:updated', handleCartUpdated);
    socket.on('order:created', handleOrderCreated);
    socket.on('inventory:updated', handleInventoryUpdated);

    return () => {
      socket.off('cart:updated', handleCartUpdated);
      socket.off('order:created', handleOrderCreated);
      socket.off('inventory:updated', handleInventoryUpdated);
    };
  }, [fetchCart, useLocalCart]);

  const addItemToCart = async (productId, quantity = 1, productData = null) => {
    if (useLocalCart) {
      const existingIndex = cartItems.findIndex((item) => item.product.id === productId);
      let nextItems = [...cartItems];

      if (existingIndex >= 0) {
        nextItems[existingIndex] = {
          ...nextItems[existingIndex],
          quantity: nextItems[existingIndex].quantity + quantity,
        };
      } else {
        const product = productData
          || demoProducts.find((item) => item.id === productId)
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
      const currentItem = cartItems.find((item) => item.id === itemId);
      await api.updateCartItem(itemId, quantity, currentItem?.quantity);
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
  const lowStockItems = cartItems.filter((item) => Number(item?.product?.stockQty || 0) > 0 && Number(item?.product?.stockQty || 0) <= 3);

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
      clearCartLocally,
      lowStockItems,
      lowStockCount: lowStockItems.length,
      inventoryPulseAt
    }}>
      {children}
    </CartContext.Provider>
  );
};
