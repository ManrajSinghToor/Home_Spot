import React, { useState, useEffect } from 'react';
import PropertyCard from './PropertyCard';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function FeaturedListings() {
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const allProps = await api.properties.getListings();
        setProperties(allProps.slice(0, 6));
        
        const favs = await api.favorites.getFavorites();
        setFavorites(favs);
      } catch (error) {
        console.error('Error loading featured properties:', error);
      }
    }
    loadData();
  }, []);

  const handleFavoriteToggle = async (property, isFavorited) => {
    try {
      const updatedFavorites = await api.favorites.toggleFavorite(property, isFavorited);
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isPropertyFavorited = (property) => {
    return favorites.some(fav => fav.dataAddress === property.dataAddress || fav.address === property.address);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % properties.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + properties.length) % properties.length);
  };

  if (properties.length === 0) return null;

  return (
    <section className="featured-listings" style={{ padding: '80px 0', background: '#09090b', position: 'relative', overflow: 'hidden' }}>
      <div className="grid-bg"></div>
      
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 className="neon-text" style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '40px' }}>Featured Properties in Punjab</h2>
        
        {/* 3D Stack Area */}
        <div style={{
          position: 'relative',
          height: '460px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          perspective: '1200px',
          marginBottom: '30px'
        }}>
          {properties.map((property, idx) => {
            // Calculate active offset relative to active card
            let offset = idx - activeIndex;
            
            // Handle loop around offset calculation for standard visual order
            if (offset < -properties.length / 2) offset += properties.length;
            if (offset > properties.length / 2) offset -= properties.length;

            const isActive = offset === 0;
            const absOffset = Math.abs(offset);
            
            // Render only cards close to active range (hide elements too far back)
            if (absOffset > 2) return null;

            return (
              <motion.div
                key={property.id || property.dataAddress || idx}
                style={{
                  position: 'absolute',
                  width: '340px',
                  zIndex: properties.length - absOffset,
                  pointerEvents: isActive ? 'auto' : 'none'
                }}
                animate={{
                  x: offset * 180,
                  scale: 1 - absOffset * 0.15,
                  rotateY: offset * -25,
                  z: absOffset * -150,
                  opacity: 1 - absOffset * 0.3
                }}
                transition={{
                  type: 'spring',
                  stiffness: 120,
                  damping: 18
                }}
              >
                <div style={{
                  filter: isActive ? 'drop-shadow(0 15px 30px rgba(99, 102, 241, 0.3))' : 'none',
                  transition: 'filter 0.3s'
                }}>
                  <PropertyCard 
                    property={property}
                    isFavorited={isPropertyFavorited(property)}
                    onToggle={handleFavoriteToggle}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Carousel buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button 
            onClick={handlePrev}
            className="glow-btn"
            style={{
              padding: '12px 20px',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px'
            }}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <button 
            onClick={handleNext}
            className="glow-btn"
            style={{
              padding: '12px 20px',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px'
            }}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

      </div>
    </section>
  );
}
