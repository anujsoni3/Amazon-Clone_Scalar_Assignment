import React from 'react';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="back-to-top" onClick={scrollToTop}>
        Back to top
      </div>
      
      <div className="footer-links-container">
        <div className="footer-links-row">
          <div className="footer-column">
            <h3>Get to Know Us</h3>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Press Releases</a>
            <a href="#">Amazon Science</a>
          </div>
          
          <div className="footer-column">
            <h3>Connect with Us</h3>
            <a href="#">Facebook</a>
            <a href="#">Twitter</a>
            <a href="#">Instagram</a>
          </div>
          
          <div className="footer-column">
            <h3>Make Money with Us</h3>
            <a href="#">Sell on Amazon</a>
            <a href="#">Sell under Amazon Accelerator</a>
            <a href="#">Protect and Build Your Brand</a>
            <a href="#">Amazon Global Selling</a>
            <a href="#">Become an Affiliate</a>
            <a href="#">Fulfilment by Amazon</a>
          </div>
          
          <div className="footer-column">
            <h3>Let Us Help You</h3>
            <a href="#">COVID-19 and Amazon</a>
            <a href="#">Your Account</a>
            <a href="#">Returns Centre</a>
            <a href="#">100% Purchase Protection</a>
            <a href="#">Amazon App Download</a>
            <a href="#">Help</a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <div className="footer-logo" aria-label="Amazon">
            <span className="footer-logo-text">amazon</span>
            <span className="footer-logo-domain">.in</span>
          </div>

          <div className="footer-region-controls">
            <button type="button" className="footer-pill">English</button>
            <button type="button" className="footer-pill">INR - Indian Rupee</button>
            <button type="button" className="footer-pill">India</button>
          </div>
        </div>

        <div className="footer-legal">
          <a href="#">Conditions of Use</a>
          <a href="#">Privacy Notice</a>
          <a href="#">Interest-Based Ads</a>
        </div>

        <div className="footer-copyright">
          <span>© 2026, Amazon Clone by Anuj Soni</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
