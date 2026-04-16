import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/api';
import Loader from '../../components/Loader/Loader';
import { formatPrice } from '../../utils/price';
import './Account.css';

const Account = () => {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [cardData, setCardData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, addressesRes, cardsRes] = await Promise.all([
        api.getUserProfile(),
        api.getAddresses(),
        api.getPaymentCards(),
      ]);

      if (profileRes.data.success) setProfile(profileRes.data.data);
      if (addressesRes.data.success) setAddresses(addressesRes.data.data);
      if (cardsRes.data.success) setCards(cardsRes.data.data);
    } catch (err) {
      console.error('Error fetching data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await api.updateAddress(editingAddressId, formData);
        setEditingAddressId(null);
      } else {
        await api.createAddress(formData);
      }
      setFormData({
        fullName: '',
        phoneNumber: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      });
      setShowAddressForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving address', err);
    }
  };

  const handleEditAddress = (address) => {
    setFormData({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Delete this address?')) {
      try {
        await api.deleteAddress(id);
        fetchData();
      } catch (err) {
        console.error('Error deleting address', err);
      }
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();
    try {
      await api.createPaymentCard(cardData);
      setCardData({
        cardholderName: '',
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
      });
      setShowCardForm(false);
      fetchData();
    } catch (err) {
      console.error('Error saving card', err);
    }
  };

  const handleSetDefaultCard = async (id) => {
    try {
      await api.setDefaultPaymentCard(id);
      fetchData();
    } catch (err) {
      console.error('Error setting default card', err);
    }
  };

  const handleDeleteCard = async (id) => {
    if (window.confirm('Delete this payment card?')) {
      try {
        await api.deletePaymentCard(id);
        fetchData();
      } catch (err) {
        console.error('Error deleting card', err);
      }
    }
  };

  if (loading) return <Loader fullPage />;

  return (
    <div className="account-page">
      <div className="account-container">
        <div className="account-sidebar">
          <div className="account-profile-card">
            <h3>{profile?.name || 'User'}</h3>
            <p>{profile?.email}</p>
            {profile?.phone && <p>{profile.phone}</p>}
          </div>

          <nav className="account-nav">
            <button
              className={`account-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile & Settings
            </button>
            <button
              className={`account-nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              Your Addresses
            </button>
            <button
              className={`account-nav-item ${activeTab === 'payment' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              Payment Methods
            </button>
            <button
              className={`account-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Link to="/orders/history">Your Orders</Link>
            </button>
            <button
              className={`account-nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <Link to="/wishlist">Your Wishlist</Link>
            </button>
          </nav>
        </div>

        <div className="account-content">
          {activeTab === 'profile' && (
            <section className="account-section">
              <h2>Account Settings</h2>
              <div className="profile-info-card">
                <h3>Personal Information</h3>
                <div className="info-row">
                  <span className="label">Name:</span>
                  <span className="value">{profile?.name}</span>
                </div>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{profile?.email}</span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">{profile?.phone || 'Not set'}</span>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'addresses' && (
            <section className="account-section">
              <div className="section-header">
                <h2>Your Addresses</h2>
                <button
                  className="add-btn"
                  onClick={() => {
                    setShowAddressForm(!showAddressForm);
                    setEditingAddressId(null);
                    setFormData({
                      fullName: '',
                      phoneNumber: '',
                      street: '',
                      city: '',
                      state: '',
                      postalCode: '',
                      country: 'India',
                    });
                  }}
                >
                  {showAddressForm ? '✕ Cancel' : '+ Add New Address'}
                </button>
              </div>

              {showAddressForm && (
                <form className="address-form" onSubmit={handleAddAddress}>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      required
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    required
                    className="full-width"
                  />
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Postal Code"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn">
                    {editingAddressId ? 'Update Address' : 'Add Address'}
                  </button>
                </form>
              )}

              <div className="addresses-list">
                {addresses.length === 0 ? (
                  <p className="empty-state">No addresses saved. Add one to get started!</p>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                      {addr.isDefault && <span className="default-badge">Default Address</span>}
                      <h4>{addr.fullName}</h4>
                      <p>{addr.street}</p>
                      <p>
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p>{addr.country}</p>
                      <p className="phone-label">Phone: {addr.phoneNumber}</p>
                      <div className="address-actions">
                        <button className="edit-btn" onClick={() => handleEditAddress(addr)}>
                          Edit
                        </button>
                        <button className="delete-btn" onClick={() => handleDeleteAddress(addr.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {activeTab === 'payment' && (
            <section className="account-section">
              <div className="section-header">
                <h2>Payment Methods</h2>
                <button
                  className="add-btn"
                  onClick={() => {
                    setShowCardForm(!showCardForm);
                    setCardData({
                      cardholderName: '',
                      cardNumber: '',
                      expiryMonth: '',
                      expiryYear: '',
                      cvv: '',
                    });
                  }}
                >
                  {showCardForm ? '✕ Cancel' : '+ Add New Card'}
                </button>
              </div>

              {showCardForm && (
                <form className="card-form" onSubmit={handleAddCard}>
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    value={cardData.cardholderName}
                    onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={cardData.cardNumber}
                    onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                    maxLength="16"
                    required
                  />
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="MM"
                      value={cardData.expiryMonth}
                      onChange={(e) => setCardData({ ...cardData, expiryMonth: e.target.value.slice(0, 2) })}
                      maxLength="2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="YY"
                      value={cardData.expiryYear}
                      onChange={(e) => setCardData({ ...cardData, expiryYear: e.target.value.slice(0, 2) })}
                      maxLength="2"
                      required
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                      maxLength="4"
                      required
                    />
                  </div>
                  <button type="submit" className="submit-btn">
                    Add Payment Card
                  </button>
                </form>
              )}

              <div className="cards-list">
                {cards.length === 0 ? (
                  <p className="empty-state">No payment methods saved.</p>
                ) : (
                  cards.map((card) => (
                    <div key={card.id} className={`card-item ${card.isDefault ? 'default' : ''}`}>
                      <div className="card-display">
                        <div className="card-chip">💳</div>
                        <div className="card-details">
                          <p className="card-number">•••• •••• •••• {card.cardNumber.slice(-4)}</p>
                          <p className="cardholder">{card.cardholderName}</p>
                          <p className="expiry">{card.expiryMonth}/{card.expiryYear}</p>
                        </div>
                        {card.isDefault && <span className="default-badge">Default</span>}
                      </div>
                      <div className="card-actions">
                        {!card.isDefault && (
                          <button
                            className="set-default-btn"
                            onClick={() => handleSetDefaultCard(card.id)}
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
