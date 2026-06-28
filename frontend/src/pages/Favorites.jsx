import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ThreeDTilt from '../components/ThreeDTilt';
import PageTransition from '../components/PageTransition';
import { api } from '../services/api';

export default function Favorites() {
  const { user } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from the API
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchFavorites = async () => {
      try {
        const data = await api.favorites.getFavorites();
        setFavorites(data || []);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        // Fallback to localStorage if API fails
        const storedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        setFavorites(storedFavorites);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, navigate]);

  // Handle removing a favorite
  const handleRemoveFavorite = async (property, e) => {
    e?.stopPropagation();
    try {
      // De-favorite via API
      const data = await api.favorites.toggleFavorite(property, false);
      setFavorites(data || []);
      showToast('Property removed from favorites!', 'info');
    } catch (error) {
      console.error('Failed to remove favorite via API:', error);
      // Fallback local deletion
      const propertyId = property._id || property.id;
      const updatedFavorites = favorites.filter(fav => (fav._id || fav.id) !== propertyId);
      setFavorites(updatedFavorites);
      localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
      showToast('Property removed from favorites (offline).', 'info');
    }
  };

  // Handle booking navigation
  const handleBooking = (property, e) => {
    e?.stopPropagation();
    localStorage.setItem('selectedProperty', JSON.stringify(property));
    navigate('/booking');
  };

  if (!user) {
    return null;
  }

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
          <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '700' }}>Your Favorites</h1>
        </section>
        
        <section style={{ padding: '40px 0' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a1a1aa' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '15px' }}></i>
                <p>Loading your favorite properties...</p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="glass-panel" style={{
                textAlign: 'center',
                padding: '60px 20px',
                border: '1px solid rgba(255,255,255,0.08)',
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                <i className="fas fa-heart-broken" style={{
                  fontSize: '4rem',
                  color: '#ef4444',
                  marginBottom: '20px',
                  opacity: '0.6'
                }}></i>
                <h2 style={{ color: '#fff', marginBottom: '10px', fontSize: '1.5rem', fontWeight: '600' }}>No Favorites Yet</h2>
                <p style={{ color: '#a1a1aa', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.6' }}>
                  Start exploring Punjab's premier rental listings and save your absolute favorites here.
                </p>
                <button 
                  onClick={() => navigate('/listings')}
                  className="glow-btn"
                  style={{
                    padding: '12px 28px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: 'var(--primary-gradient)',
                    color: '#fff'
                  }}
                >
                  Browse Listings
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '30px',
                justifyContent: 'center'
              }}>
                {favorites.map((property, index) => {
                  const title = property.title || 'Punjab Property';
                  const price = property.price || 'Contact for details';
                  const beds = property.beds || '3 Beds';
                  const baths = property.baths || '2 Baths';
                  const sqft = property.sqft || '1,500 sqft';
                  const address = property.address || property.location || '';
                  const image = property.image || property.imgSrc || 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop';
                  
                  return (
                    <ThreeDTilt 
                      key={property.id || property._id || index} 
                      className="property-card glass-panel" 
                      maxTilt={6} 
                      scale={1.01} 
                      style={{ border: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img 
                          src={image} 
                          alt={title}
                          style={{
                            width: '100%',
                            height: '200px',
                            objectFit: 'cover',
                            display: 'block'
                          }}
                        />
                        <button 
                          onClick={(e) => handleRemoveFavorite(property, e)}
                          title="Remove from favorites"
                          style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(239, 68, 68, 0.9)',
                            border: 'none',
                            color: 'white',
                            fontSize: '1rem',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 3
                          }}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                      
                      <div style={{ padding: '20px' }}>
                        <div style={{
                          display: 'flex',
                          gap: '15px',
                          color: '#a1a1aa',
                          fontSize: '0.8rem',
                          marginBottom: '12px',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                          paddingBottom: '10px'
                        }}>
                          <span><i className="fas fa-bed"></i> {beds}</span>
                          <span><i className="fas fa-bath"></i> {baths}</span>
                          <span><i className="fas fa-ruler"></i> {sqft}</span>
                        </div>
                        
                        <h3 style={{
                          fontSize: '1.2rem',
                          marginBottom: '5px',
                          color: '#fff',
                          fontWeight: '600'
                        }}>
                          {title}
                        </h3>
                        {address && (
                          <p style={{ color: '#71717a', fontSize: '0.8rem', marginBottom: '10px' }}>
                            <i className="fas fa-map-marker-alt" style={{ marginRight: '5px', color: 'var(--primary-color)' }}></i>
                            {address}
                          </p>
                        )}
                        <p style={{
                          fontSize: '1.15rem',
                          fontWeight: '600',
                          color: 'var(--primary-color)',
                          marginBottom: '15px'
                        }}>
                          {price}
                        </p>

                        <button 
                          onClick={(e) => handleBooking(property, e)}
                          className="glow-btn"
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: 'var(--primary-gradient)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                          }}
                        >
                          Book Inquiry
                        </button>
                      </div>
                    </ThreeDTilt>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}
