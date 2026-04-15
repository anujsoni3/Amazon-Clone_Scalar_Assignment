import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import SecondaryNav from './components/Navbar/SecondaryNav';
import CheckoutHeader from './components/Navbar/CheckoutHeader';
import Footer from './components/Footer/Footer';
import { CartProvider, useCart } from './context/CartContext';

import Home from './pages/Home/Home';
import ProductListing from './pages/ProductListing/ProductListing';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import OrderHistory from './pages/OrderHistory/OrderHistory';

import './styles/layout.css';

function AppLayout() {
  const location = useLocation();
  const isCheckoutFlow = location.pathname === '/checkout';
  const { notice, clearNotice } = useCart();

  return (
    <div className="app-shell">
      {notice && (
        <div className={`app-notice app-notice-${notice.type}`} role="status" onClick={clearNotice}>
          {notice.message}
        </div>
      )}

      {isCheckoutFlow ? (
        <CheckoutHeader />
      ) : (
        <>
          <Navbar />
          <SecondaryNav />
        </>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/orders/history" element={<OrderHistory />} />
        </Routes>
      </main>

      {!isCheckoutFlow && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <CartProvider>
        <AppLayout />
      </CartProvider>
    </Router>
  );
}

export default App;
