import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';

export default function Booking() {
  const { user } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    moveInDate: '',
    duration: '12',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const selectedProperty = localStorage.getItem('selectedProperty');
    if (selectedProperty) {
      setProperty(JSON.parse(selectedProperty));
    } else {
      navigate('/listings');
    }

    if (user) {
      setBookingData(prev => ({
        ...prev,
        name: user.username || '',
        email: user.email || ''
      }));
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Save pending booking details to localStorage for checkout redirection
    const pendingBooking = {
      property,
      bookingData: {
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        moveInDate: bookingData.moveInDate,
        duration: bookingData.duration,
        message: bookingData.message
      }
    };
    localStorage.setItem('pendingBooking', JSON.stringify(pendingBooking));

    setTimeout(() => {
      setLoading(false);
      navigate('/payment');
    }, 800);
  };

  if (!property) return null;

  return (
    <PageTransition>
      <Header />
      <main style={{ background: '#09090b', minHeight: '95vh', paddingBottom: '60px', position: 'relative' }}>
        <div className="grid-bg"></div>

        <section className="page-hero" style={{
          padding: '50px 20px',
          textAlign: 'center',
          color: 'var(--light-text)',
          background: 'radial-gradient(circle at center, #1b1b2f, #09090b)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '700' }}>Confirm Booking</h1>
        </section>

        <section style={{ padding: '40px 0' }}>
          <div className="container grid-responsive-1-2">
            
            {/* Left: Property Preview */}
            <div className="glass-panel" style={{ overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              <img src={property.image} alt={property.title} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
              <div style={{ padding: '30px', textAlign: 'left' }}>
                <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '600', marginBottom: '15px' }}>{property.title}</h3>
                
                <div style={{ display: 'flex', gap: '15px', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '15px' }}>
                  <span><i className="fas fa-bed"></i> {property.beds}</span>
                  <span><i className="fas fa-bath"></i> {property.baths}</span>
                  <span><i className="fas fa-ruler"></i> {property.sqft}</span>
                </div>
                
                <p style={{ color: '#e4e4e7', fontSize: '0.9rem', marginBottom: '10px' }}><i className="fas fa-map-marker-alt" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i> {property.address}</p>
                <p style={{ color: 'var(--primary-color)', fontSize: '1.4rem', fontWeight: '600', margin: 0 }}>{property.price}</p>
              </div>
            </div>

            {/* Right: Booking Form */}
            <div className="glass-panel" style={{ padding: '35px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '25px' }}>Booking Details</h3>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>Full Name</label>
                  <input type="text" name="name" value={bookingData.name} onChange={handleInputChange} required className="glass-input" style={{ width: '100%' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>Email Address</label>
                  <input type="email" name="email" value={bookingData.email} onChange={handleInputChange} required className="glass-input" style={{ width: '100%' }} />
                </div>
                
                <div>
                  <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>Phone Number</label>
                  <input type="tel" name="phone" value={bookingData.phone} onChange={handleInputChange} required className="glass-input" style={{ width: '100%' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>Preferred Move-in Date</label>
                    <input type="date" name="moveInDate" value={bookingData.moveInDate} onChange={handleInputChange} required className="glass-input" style={{ width: '100%' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>Duration (months)</label>
                    <select name="duration" value={bookingData.duration} onChange={handleInputChange} required className="glass-select" style={{ width: '100%' }}>
                      <option value="6">6 months</option>
                      <option value="12">12 months</option>
                      <option value="18">18 months</option>
                      <option value="24">24 months</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>Additional Message</label>
                  <textarea name="message" value={bookingData.message} onChange={handleInputChange} rows="3" placeholder="Special requirements..." className="glass-input" style={{ width: '100%', resize: 'none' }}></textarea>
                </div>

                <button
                  type="submit"
                  className="glow-btn"
                  disabled={loading}
                  style={{
                    padding: '14px',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'var(--primary-gradient)',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '10px'
                  }}
                >
                  {loading ? 'Redirecting to Checkout...' : 'Proceed to Secure Checkout'}
                </button>
              </form>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}
