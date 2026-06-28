import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ThreeDCityscape from './ThreeDCityscape';

export default function Hero() {
  return (
    <section className="hero" style={{ position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at center, #1b1b2f, #09090b)' }}>
      {/* 3D-parallax cityscape canvas */}
      <ThreeDCityscape />
      <div className="grid-bg"></div>
      
      <motion.div 
        className="hero-content"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.85, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <h1 style={{ fontSize: '3.6rem', fontWeight: '800', lineHeight: '1.2', letterSpacing: '-0.5px' }}>
          Find Your Perfect <span className="neon-text">Rental Home</span> in Punjab
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#a1a1aa', margin: '20px 0 35px' }}>
          Explore gorgeous properties in Ludhiana, Amritsar, Jalandhar, and Mohali with 3D tours.
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <Link to="/listings" className="cta-button glow-btn" style={{ textShadow: 'none', background: 'var(--primary-gradient)', borderRadius: '8px', padding: '16px 36px', fontSize: '1rem', fontWeight: '600' }}>
            Search Properties
          </Link>
          <Link to="/virtual-tour" className="cta-button glow-btn" style={{ textShadow: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', padding: '16px 36px', fontSize: '1rem', fontWeight: '600' }}>
            Virtual 3D Tour
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
