import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { CartProvider } from './context/CartContext';

// Stub pages for routing
const Home = () => <div style={{ minHeight: '80vh', padding: '20px' }}><h2>Home Page</h2></div>;
const ProductListing = () => <div style={{ minHeight: '80vh', padding: '20px' }}><h2>Product Listing Page</h2></div>;
const ProductDetail = () => <div style={{ minHeight: '80vh', padding: '20px' }}><h2>Product Detail Page</h2></div>;
const Cart = () => <div style={{ minHeight: '80vh', padding: '20px' }}><h2>Shopping Cart</h2></div>;
const Checkout = () => <div style={{ minHeight: '80vh', padding: '20px' }}><h2>Checkout</h2></div>;
const OrderConfirmation = () => <div style={{ minHeight: '80vh', padding: '20px' }}><h2>Order Confirmation</h2></div>;

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
