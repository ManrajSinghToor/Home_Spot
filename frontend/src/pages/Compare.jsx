import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { api } from '../services/api';

// Static default properties if user hasn't selected any in comparison
const DEFAULT_COMPARE_PROPS = [
  {
    id: 'default-1',
    title: 'Modern Punjabi Villa',
    city: 'ludhiana',
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
    id: 'default-2',
    title: 'Mohali Luxury Villa',
    city: 'mohali',
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
  const [allAvailableProperties, setAllAvailableProperties] = useState([]);
  const [isUsingDefaults, setIsUsingDefaults] = useState(false);

  useEffect(() => {
    // Load all properties from API for comparison selection dropdown
    async function loadAllProperties() {
      try {
        const list = await api.properties.getListings();
        setAllAvailableProperties(list || []);
      } catch (error) {
        console.error('Error loading properties for comparison:', error);
      }
    }
    loadAllProperties();

    // Load properties from comparison drawer
    const list = JSON.parse(localStorage.getItem('comparisonProperties') || '[]');
    if (list.length > 0) {
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
      setIsUsingDefaults(false);
    } else {
      setProperties(DEFAULT_COMPARE_PROPS);
      setIsUsingDefaults(true);
    }
  }, []);

  const handleRemove = (targetProperty) => {
    const targetId = String(targetProperty.id || targetProperty._id);
    const updated = properties.filter(p => String(p.id || p._id) !== targetId);
    
    setProperties(updated);
    
    // Save updated comparison list to localStorage (filter out default properties if any)
    const realProperties = updated.filter(p => !String(p.id).startsWith('default-'));
    localStorage.setItem('comparisonProperties', JSON.stringify(realProperties));

    if (updated.length === 0) {
      setIsUsingDefaults(false);
    }
  };

  const handleClearAll = () => {
    setProperties([]);
    setIsUsingDefaults(false);
    localStorage.removeItem('comparisonProperties');
  };

  const handleRestoreDefaults = () => {
    setProperties(DEFAULT_COMPARE_PROPS);
    setIsUsingDefaults(true);
  };

  const handleSelectPropertyToAdd = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    const propertyToAdd = allAvailableProperties.find(ap => String(ap.id || ap._id) === String(selectedId));
    if (!propertyToAdd) return;

    let baseProperties = properties;
    if (isUsingDefaults) {
      baseProperties = [];
      setIsUsingDefaults(false);
    }

    if (baseProperties.length >= 3) {
      alert('You can compare a maximum of 3 properties. Please remove one first.');
      return;
    }

    const idx = baseProperties.length;
    const hydrated = {
      ...propertyToAdd,
      city: propertyToAdd.city || 'Punjab',
      priceVal: parseInt((propertyToAdd.price || '').replace(/[^\d]/g, '')) || 30000,
      scores: propertyToAdd.scores || {
        safety: 70 + (idx * 10) % 25,
        transit: 65 + (idx * 15) % 30,
        budget: Math.max(30, 100 - (parseInt((propertyToAdd.price || '').replace(/[^\d]/g, '')) || 30000) / 1000),
        size: Math.min(98, (parseInt((propertyToAdd.sqft || '').replace(/[^\d]/g, '')) || 1500) / 45),
        landscape: 60 + (idx * 20) % 35
      }
    };

    const updated = [...baseProperties, hydrated];
    setProperties(updated);
    
    const realProperties = updated.filter(p => !String(p.id).startsWith('default-'));
    localStorage.setItem('comparisonProperties', JSON.stringify(realProperties));
  };

  // Helper to generate SVG points for Radar Chart
  const getRadarPoints = (scores) => {
    const keys = ['safety', 'transit', 'budget', 'size', 'landscape'];
    const center = 150;
    const r = 100;
    
    return keys.map((key, i) => {
      const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
      const score = (scores[key] || 50) / 100;
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

          {/* Property selector dropdown */}
          <div className="glass-panel" style={{ 
            padding: '20px', 
            marginBottom: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            gap: '15px', 
            flexWrap: 'wrap',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <span style={{ color: '#e4e4e7', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-balance-scale" style={{ color: 'var(--primary-color)' }}></i>
                Compare properties:
              </span>
              <select 
                onChange={handleSelectPropertyToAdd} 
                value=""
                style={{
                  padding: '12px 20px',
                  background: 'rgba(9, 9, 11, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: '280px',
                  fontSize: '0.9rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                }}
              >
                <option value="" style={{ background: '#09090b', color: '#71717a' }}>
                  -- Add property to compare --
                </option>
                {allAvailableProperties
                  .filter(ap => !properties.some(p => String(p.id || p._id) === String(ap.id || ap._id)))
                  .map(ap => (
                    <option key={ap.id || ap._id} value={ap.id || ap._id} style={{ background: '#09090b', color: '#fff' }}>
                      {ap.title} ({String(ap.city).toUpperCase()}) - {ap.price}
                    </option>
                  ))}
              </select>
            </div>

            {properties.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isUsingDefaults && (
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontStyle: 'italic', marginRight: '10px' }}>
                    (Showing sample properties)
                  </span>
                )}
                <button
                  onClick={handleClearAll}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <i className="fas fa-trash-alt"></i> Clear All
                </button>
              </div>
            )}
          </div>

          {properties.length === 0 ? (
            <div className="glass-panel" style={{ padding: '60px 40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
              <i className="fas fa-balance-scale-left" style={{ fontSize: '3.5rem', color: '#71717a', marginBottom: '20px' }}></i>
              <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '10px' }}>No properties in comparison</h3>
              <p style={{ color: '#a1a1aa', marginBottom: '25px' }}>
                Use the dropdown menu above or click the compare icon on any property card to add items here.
              </p>
              <button
                onClick={handleRestoreDefaults}
                style={{
                  padding: '12px 24px',
                  background: 'var(--primary-gradient)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Load Sample Comparison
              </button>
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
                          <th key={p.id || p._id || idx} style={{ padding: '15px 10px', color: chartColors[idx % 3].stroke, fontWeight: '600', minWidth: '220px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                              <span>{p.title}</span>
                              <button
                                onClick={() => handleRemove(p)}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  color: '#ef4444',
                                  borderRadius: '6px',
                                  padding: '5px 10px',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  whiteSpace: 'nowrap'
                                }}
                                title="Remove from compare"
                              >
                                <i className="fas fa-trash"></i> Remove
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>Image</td>
                        {properties.map((p, idx) => (
                          <td key={p.id || p._id || idx} style={{ padding: '15px 10px' }}>
                            <img src={p.image} alt={p.title} style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px' }} />
                          </td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>Monthly Rent</td>
                        {properties.map((p, idx) => (
                          <td key={p.id || p._id || idx} style={{ padding: '15px 10px', color: '#fff', fontWeight: '600' }}>{p.price}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>City</td>
                        {properties.map((p, idx) => (
                          <td key={p.id || p._id || idx} style={{ padding: '15px 10px' }}>{String(p.city || '').toUpperCase()}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>Bedrooms</td>
                        {properties.map((p, idx) => (
                          <td key={p.id || p._id || idx} style={{ padding: '15px 10px' }}><i className="fas fa-bed"></i> {p.beds}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>Bathrooms</td>
                        {properties.map((p, idx) => (
                          <td key={p.id || p._id || idx} style={{ padding: '15px 10px' }}><i className="fas fa-bath"></i> {p.baths}</td>
                        ))}
                      </tr>
                      <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>Size (sqft)</td>
                        {properties.map((p, idx) => (
                          <td key={p.id || p._id || idx} style={{ padding: '15px 10px' }}><i className="fas fa-ruler-combined"></i> {p.sqft}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ padding: '15px 10px', color: '#a1a1aa', fontWeight: '500' }}>Address</td>
                        {properties.map((p, idx) => (
                          <td key={p.id || p._id || idx} style={{ padding: '15px 10px', fontSize: '0.85rem', color: '#a1a1aa' }}>{p.address}</td>
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

                    {properties.map((p, idx) => (
                      <g key={p.id || p._id || idx}>
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
                    <div key={p.id || p._id || idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
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
