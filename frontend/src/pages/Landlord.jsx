import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

export default function Landlord() {
  const { user } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // State for adding a property
  const [newProperty, setNewProperty] = useState({
    title: '',
    city: '',
    rooms: '',
    beds: '',
    baths: '',
    sqft: '',
    price: '',
    address: '',
    phone: '',
    description: ''
  });

  const loadLandlordProperties = async () => {
    try {
      const allProps = await api.properties.getListings();
      // Filter properties owned by this landlord username
      const owned = allProps.filter(p => p.landlord && p.landlord.username === user?.username);
      setProperties(owned);
    } catch (err) {
      console.error('Error loading landlord properties:', err);
      showToast('Failed to load properties from backend.', 'error');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const role = localStorage.getItem('role') || user.role;
    if (role !== 'landlord') {
      showToast('Landlord panel restricted to landlord accounts.', 'warning');
      navigate('/');
      return;
    }

    loadLandlordProperties();
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProperty(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    
    const propertyPayload = {
      title: newProperty.title,
      city: newProperty.city,
      rooms: parseInt(newProperty.rooms, 10),
      beds: parseInt(newProperty.beds, 10),
      baths: parseInt(newProperty.baths, 10),
      sqft: newProperty.sqft,
      price: newProperty.price,
      address: newProperty.address,
      phone: newProperty.phone,
      description: newProperty.description,
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop'
    };

    try {
      const created = await api.properties.createListing(propertyPayload);
      setProperties(prev => [...prev, created]);
      
      // Reset Form
      setNewProperty({
        title: '',
        city: '',
        rooms: '',
        beds: '',
        baths: '',
        sqft: '',
        price: '',
        address: '',
        phone: '',
        description: ''
      });
      setShowAddForm(false);
      showToast('Property created successfully in database!', 'success');
    } catch (err) {
      console.error('Error creating property:', err);
      showToast(err.message || 'Failed to publish listing.', 'error');
    }
  };

  const handleDeleteProperty = async (id, e) => {
    e.stopPropagation();
    try {
      await api.properties.deleteListing(id);
      setProperties(prev => prev.filter(prop => (prop.id !== id && prop._id !== id)));
      showToast('Property listing deleted from database.', 'info');
    } catch (err) {
      console.error('Error deleting property:', err);
      showToast(err.message || 'Failed to remove listing.', 'error');
    }
  };

  // Mock revenue chart path coordinates (SVG width=400, height=120)
  // Coordinates representing trend line: Jan (20, 100), Feb (100, 80), Mar (180, 50), Apr (260, 45), May (340, 20)
  const revenueLinePath = "M 20 100 Q 100 80 180 50 T 340 20";

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
          <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '700' }}>Landlord Center</h1>
        </section>

        <section className="dashboard-section" style={{ padding: '40px 0' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {/* Grid Layout: Left Stats/Chart, Right Form Card */}
            <div className="grid-responsive-1-2-custom" style={{ marginBottom: '40px' }}>
              
              {/* Analytics panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div className="glass-panel" style={{ padding: '30px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px' }}>Dashboard Overview</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                      <h4 style={{ fontSize: '2rem', color: 'var(--primary-color)', margin: '0 0 5px 0' }}>{properties.length}</h4>
                      <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: 0 }}>Listings</p>
                    </div>
                    <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                      <h4 style={{ fontSize: '2rem', color: '#10b981', margin: '0 0 5px 0' }}>{properties.filter(p => p.status === 'rented').length}</h4>
                      <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: 0 }}>Occupied</p>
                    </div>
                    <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                      <h4 style={{ fontSize: '2rem', color: '#f59e0b', margin: '0 0 5px 0' }}>₹1.2L</h4>
                      <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: 0 }}>Est. Income</p>
                    </div>
                  </div>

                  {/* Revenue Growth Line Graph */}
                  <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '600', marginBottom: '15px' }}>Earnings Trend (2026)</h4>
                  <div style={{ background: 'rgba(9,9,11,0.5)', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'center' }}>
                    <svg width="100%" height="120" viewBox="0 0 360 120" style={{ overflow: 'visible' }}>
                      {/* Grid helper lines */}
                      <line x1="20" y1="10" x2="340" y2="10" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                      <line x1="20" y1="60" x2="340" y2="60" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                      <line x1="20" y1="100" x2="340" y2="100" stroke="rgba(255,255,255,0.04)" strokeDasharray="3" />
                      
                      {/* Animated Path */}
                      <motion.path
                        d={revenueLinePath}
                        fill="none"
                        stroke="url(#chartGradient)"
                        strokeWidth="3.5"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                      />
                      
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>

                      {/* Circles at data nodes */}
                      <circle cx="20" cy="100" r="4.5" fill="#6366f1" />
                      <circle cx="100" cy="80" r="4.5" fill="#6366f1" />
                      <circle cx="180" cy="50" r="4.5" fill="#6366f1" />
                      <circle cx="260" cy="45" r="4.5" fill="#a855f7" />
                      <circle cx="340" cy="20" r="4.5" fill="#a855f7" />
                    </svg>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#71717a', fontSize: '0.75rem', marginTop: '8px', padding: '0 10px' }}>
                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                  </div>

                </div>
              </div>

              {/* Right Column: 3D Flip Form Card */}
              <div className="perspective-container" style={{ height: '580px', position: 'relative' }}>
                <div className={`flip-card-inner ${showAddForm ? 'flipped' : ''}`} style={{ height: '100%' }}>
                  
                  {/* Front card - Stats / Instructions */}
                  <div className="flip-card-front glass-panel" style={{ padding: '40px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <i className="fas fa-file-invoice-dollar" style={{ fontSize: '3rem', color: 'var(--primary-color)', marginBottom: '20px' }}></i>
                    <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '600', marginBottom: '10px' }}>Maximize Rental Return</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '35px' }}>
                      Publish your listing in Ludhiana, Amritsar, Jalandhar, or Mohali to connect directly with tenants. Set prices, load media, and manage rental requests from one dashboard.
                    </p>
                    <button 
                      onClick={() => setShowAddForm(true)}
                      className="glow-btn"
                      style={{ padding: '15px', border: 'none', borderRadius: '8px', background: 'var(--primary-gradient)', color: '#fff', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}
                    >
                      + Create Listing Form
                    </button>
                  </div>

                  {/* Back card - Add Form with inputs */}
                  <div className="flip-card-back glass-panel" style={{ padding: '30px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(20,20,25,0.98)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600' }}>Publish Property</h3>
                      <button 
                        onClick={() => setShowAddForm(false)}
                        style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '1.2rem' }}
                      >
                        <i className="fas fa-arrow-left"></i>
                      </button>
                    </div>

                    <form onSubmit={handleAddProperty} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <input type="text" name="title" placeholder="Property Title *" value={newProperty.title} onChange={handleInputChange} required className="glass-input" />
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px' }}>
                        <select name="city" value={newProperty.city} onChange={handleInputChange} required className="glass-select">
                          <option value="">City *</option>
                          <option value="mohali">Mohali</option>
                          <option value="ludhiana">Ludhiana</option>
                          <option value="amritsar">Amritsar</option>
                          <option value="jalandhar">Jalandhar</option>
                        </select>
                        <input type="text" name="price" placeholder="Rent (e.g. ₹25,000/month) *" value={newProperty.price} onChange={handleInputChange} required className="glass-input" />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        <input type="number" name="rooms" placeholder="Rooms *" value={newProperty.rooms} onChange={handleInputChange} required min="1" className="glass-input" />
                        <input type="number" name="beds" placeholder="Beds *" value={newProperty.beds} onChange={handleInputChange} required min="1" className="glass-input" />
                        <input type="number" name="baths" placeholder="Baths *" value={newProperty.baths} onChange={handleInputChange} required min="1" className="glass-input" />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <input type="text" name="sqft" placeholder="Size (sqft) *" value={newProperty.sqft} onChange={handleInputChange} required className="glass-input" />
                        <input type="tel" name="phone" placeholder="Phone *" value={newProperty.phone} onChange={handleInputChange} required className="glass-input" />
                      </div>

                      <input type="text" name="address" placeholder="Full Address *" value={newProperty.address} onChange={handleInputChange} required className="glass-input" />
                      
                      <textarea name="description" placeholder="Short description..." value={newProperty.description} onChange={handleInputChange} rows="3" className="glass-input" style={{ resize: 'none' }}></textarea>
                      
                      <button type="submit" className="glow-btn" style={{ padding: '12px', border: 'none', borderRadius: '8px', background: 'var(--primary-gradient)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Publish Listing</button>
                    </form>
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom Section: Active Listings list */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '40px' }}>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '600', marginBottom: '25px', textAlign: 'left' }}>Your Active Listings</h3>
              
              {properties.length === 0 ? (
                <div className="glass-panel" style={{ padding: '50px 30px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <i className="fas fa-home" style={{ fontSize: '3rem', color: '#71717a', marginBottom: '15px' }}></i>
                  <h4 style={{ color: '#fff', marginBottom: '5px' }}>No properties published</h4>
                  <p style={{ color: '#a1a1aa', margin: 0 }}>Create your first listing card to start scouting tenants.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '25px' }}>
                  {properties.map((p) => (
                    <ThreeDTilt key={p._id || p.id} className="property-card glass-panel" maxTilt={6} scale={1.01} style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ position: 'relative' }}>
                        <img src={p.image} alt={p.title} style={{ width: '100%', height: '170px', objectFit: 'cover' }} />
                        <button 
                          onClick={(e) => handleDeleteProperty(p._id || p.id, e)}
                          style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                      <div style={{ padding: '20px', textAlign: 'left' }}>
                        <h4 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px', fontWeight: '600' }}>{p.title}</h4>
                        <div style={{ display: 'flex', gap: '15px', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '12px' }}>
                          <span><i className="fas fa-bed"></i> {p.beds} Beds</span>
                          <span><i className="fas fa-bath"></i> {p.baths} Baths</span>
                          <span><i className="fas fa-ruler"></i> {p.sqft} sqft</span>
                        </div>
                        <p style={{ color: '#71717a', fontSize: '0.8rem', margin: '0 0 10px 0' }}>{p.address}</p>
                        <p style={{ color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{p.price}</p>
                      </div>
                    </ThreeDTilt>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}
