import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThreeDTilt from './ThreeDTilt';

export default function PropertyCard({ property, isFavorited = false, onToggle }) {
  const [favorited, setFavorited] = useState(isFavorited);
  const navigate = useNavigate();

  useEffect(() => {
    setFavorited(isFavorited);
  }, [isFavorited]);

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    const newFavoriteState = !favorited;
    setFavorited(newFavoriteState);
    if (onToggle) {
      onToggle(property, newFavoriteState);
    }
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    // Store property details for booking
    localStorage.setItem('selectedProperty', JSON.stringify(property));
    navigate('/booking');
  };

  return (
    <ThreeDTilt 
      className="property-card glass-card" 
      data-address={property.dataAddress || property.address} 
      data-phone={property.dataPhone || property.phone}
      maxTilt={8}
      scale={1.02}
    >
      <Link to="/listings" style={{ position: 'relative', display: 'block' }}>
        <img src={property.imgSrc || property.image} alt={property.imgAlt || property.title} />
        {property.status === 'rented' && (
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            background: 'rgba(239, 68, 68, 0.95)',
            color: '#fff',
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '700',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            boxShadow: '0 0 15px rgba(239, 68, 68, 0.65)',
            zIndex: 5
          }}>
            SOLD OUT
          </div>
        )}
      </Link>
      <button 
        className={`fav-button ${favorited ? 'favorited' : ''}`} 
        onClick={handleFavoriteToggle} 
        aria-pressed={favorited} 
        title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        {favorited ? '⭐' : '☆'}
      </button>
      <div className="card-content">
        <div className="card-specs">
          <span><i className="fas fa-bed"></i> {property.beds}</span>
          <span><i className="fas fa-bath"></i> {property.baths}</span>
          <span><i className="fas fa-ruler-combined"></i> {property.sqft}</span>
        </div>
        <div className="card-footer">
          <h3>{property.title}</h3>
          <p className="price">{property.price}</p>
        </div>
        {property.status === 'rented' ? (
          <button className="book-now-btn" disabled style={{ background: '#27272a', color: '#71717a', cursor: 'not-allowed', boxShadow: 'none', width: '100%', margin: '10px auto', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: '600' }}>Sold / Rented</button>
        ) : (
          <button className="book-now-btn glow-btn" onClick={handleBookNow}>Book Now</button>
        )}
      </div>
    </ThreeDTilt>
  );
}
