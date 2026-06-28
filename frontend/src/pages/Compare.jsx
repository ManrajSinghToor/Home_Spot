import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';

// Static default properties if user hasn't selected any in comparison
const DEFAULT_COMPARE_PROPS = [
  {
    id: 1,
    title: 'Modern Punjabi Villa',
    city: 'Ludhiana',
    price: '₹45,000/month',
    priceVal: 45000,
    rooms: 4,
    beds: 4,
    baths: 3,
    sqft: '2,200',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop',
    address: '125 Model Town, Ludhiana, Punjab',
    scores: { safety: 85, transit: 75, budget: 60, size: 80, landscape: 90 }
  },
  {
    id: 4,
    title: 'Mohali Luxury Villa',
    city: 'Mohali',
    price: '₹85,000/month',
    priceVal: 85000,
    rooms: 5,
    beds: 5,
    baths: 5,
    sqft: '4,500',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop',
    address: '9 Green Avenue, Mohali, Punjab',
    scores: { safety: 90, transit: 85, budget: 35, size: 95, landscape: 85 }
  }
];

export default function Compare() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    // Load properties from comparison drawer
    const list = JSON.parse(localStorage.getItem('comparisonProperties') || '[]');
    if (list.length > 0) {
      // Map mock scores if not present
      const hydrated = list.map((p, idx) => ({
        ...p,
        city: p.city || 'Punjab',
        priceVal: parseInt((p.price || '').replace(/[^\d]/g, '')) || 30000,
        scores: p.scores || {
          safety: 70 + (idx * 10) % 25,
          transit: 65 + (idx * 15) % 30,
          budget: Math.max(30, 100 - (parseInt((p.price || '').replace(/[^\d]/g, '')) || 30000) / 1000),
          size: Math.min(98, (parseInt((p.sqft || '').replace(/[^\d]/g, '')) || 1500) / 45),
          landscape: 60 + (idx * 20) % 35
        }
      }));
      setProperties(hydrated);
    } else {
      setProperties(DEFAULT_COMPARE_PROPS);
    }
  }, []);

  const handleRemove = (id) => {
    const updated = properties.filter(p => p.id !== id);
    setProperties(updated);
    localStorage.setItem('comparisonProperties', JSON.stringify(updated));
  };

  // Helper to generate SVG points for Radar Chart
  // Dimensions: center is (150, 150), radius is 100
  const getRadarPoints = (scores) => {
    const keys = ['safety', 'transit', 'budget', 'size', 'landscape'];
    const center = 150;
    const r = 100;
    
    return keys.map((key, i) => {
      const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
      const score = (scores[key] || 50) / 100; // normalize
      const x = center + r * score * Math.cos(angle);
      const y = center + r * score * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const chartColors = [
    { fill: 'rgba(99, 102, 241, 0.25)', stroke: '#6366f1' },
    { fill: 'rgba(239, 68, 68, 0.25)', stroke: '#ef4444' },
    { fill: 'rgba(16, 185, 129, 0.25)', stroke: '#10b981' }
  ];

  return (
    <PageTransition>
      <Header />
      <main style={{ background: '#09090b', minHeight: '95vh', padding: '60px 0', position: 'relative' }}>
        <div className="grid-bg"></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: '50px' }}
          >
            <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '15px' }}>Compare Properties</h1>
            <p style={{ color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>
              Compare pricing, specifications, and neighborhood ratings side-by-side to make the optimal decision.
            </p>
          </motion.div>

          {properties.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <i className="fas fa-balance-scale" style={{ fontSize: '3rem', color: '#71717a', marginBottom: '20px' }}></i>
              <h3 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '10px' }}>No properties to compare</h3>
              <p style={{ color: '#a1a1aa', marginBottom: '25px' }}>Browse through our listing selection and click compare to populate this workspace.</p>
            </div>
          ) : (
            <div className="grid-responsive-1-5-1">
              
              {/* Table comparison layout */}
              <div style={{ overflowX: 'auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div className="glass-panel" style={{ padding: '30px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', color: '#e4e4e7' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <th style={{ padding: '15px 10px', color: '#fff', fontWeight: '600' }}>Features</th>
                        {properties.map((p, idx) => (
                          <th key={p.id} style={{ padding: '15px 10px', color: chartColors[idx % 3].stroke, fontWeight: '600', minWidth: '200px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{p.title}</span>
                              {properties.length > 1 && (
                                <button
                                  onClick={() => handleRemove(p.id)}
                                  style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', transition: 'color 0.2s', ':hover': { color: '#ef4444' } }}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>Image</td>
                        {properties.map((p) => (
                          <td key={p.id} style={{ padding: '15px 10px' }}>
                            <img src={p.image} alt={p.title} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px' }} />
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>Monthly Rent</td>
                        {properties.map((p) => (
                          <td key={p.id} style={{ padding: '15px 10px', color: '#fff', fontWeight: '600' }}>{p.price}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>City</td>
                        {properties.map((p) => (
                          <td key={p.id} style={{ padding: '15px 10px' }}>{p.city.toUpperCase()}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>Bedrooms</td>
                        {properties.map((p) => (
                          <td key={p.id} style={{ padding: '15px 10px' }}><i className="fas fa-bed"></i> {p.beds}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>Bathrooms</td>
                        {properties.map((p) => (
                          <td key={p.id} style={{ padding: '15px 10px' }}><i className="fas fa-bath"></i> {p.baths}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>Size (sqft)</td>
                        {properties.map((p) => (
                          <td key={p.id} style={{ padding: '15px 10px' }}><i className="fas fa-ruler-combined"></i> {p.sqft}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>Address</td>
                        {properties.map((p) => (
                          <td key={p.id} style={{ padding: '15px 10px', fontSize: '0.85rem', color: '#a1a1aa' }}>{p.address}</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3D Visual Radar Representation Panel */}
              <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '25px' }}>Feature Radar Comparison</h3>
                
                {/* SVG Radar Chart */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px' }}>
                  <svg width="300" height="300" style={{ overflow: 'visible' }}>
                    {/* Concentric helper pentagons representing scale increments */}
                    {[0.2, 0.4, 0.6, 0.8, 1].map((scale, sIdx) => {
                      const keys = ['safety', 'transit', 'budget', 'size', 'landscape'];
                      const pts = keys.map((_, i) => {
                        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                        return `${150 + 100 * scale * Math.cos(angle)},${150 + 100 * scale * Math.sin(angle)}`;
                      }).join(' ');
                      return (
                        <polygon
                          key={sIdx}
                          points={pts}
                          fill="none"
                          stroke="rgba(255,255,255,0.06)"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Parameter axis lines */}
                    {[0, 1, 2, 3, 4].map((i) => {
                      const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                      return (
                        <line
                          key={i}
                          x1="150"
                          y1="150"
                          x2={150 + 100 * Math.cos(angle)}
                          y2={150 + 100 * Math.sin(angle)}
                          stroke="rgba(255,255,255,0.08)"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Labels for metrics */}
                    {['Safety', 'Transit', 'Budget', 'Size', 'Scenery'].map((label, i) => {
                      const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                      const offset = 120;
                      const lx = 150 + offset * Math.cos(angle);
                      const ly = 150 + offset * Math.sin(angle);
                      return (
                        <text
                          key={i}
                          x={lx}
                          y={ly}
                          fill="#a1a1aa"
                          fontSize="10"
                          fontWeight="600"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                        >
                          {label}
                        </text>
                      );
                    })}

                    {/* Overlaid Data Polygons */}
                    {properties.map((p, idx) => (
                      <g key={p.id}>
                        <motion.polygon
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 * idx }}
                          points={getRadarPoints(p.scores)}
                          fill={chartColors[idx % 3].fill}
                          stroke={chartColors[idx % 3].stroke}
                          strokeWidth="2.5"
                          style={{ transformOrigin: '150px 150px' }}
                        />
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Legend markers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                  {properties.map((p, idx) => (
                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: chartColors[idx % 3].stroke }}></span>
                      <span style={{ color: '#e4e4e7' }}>{p.title}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
