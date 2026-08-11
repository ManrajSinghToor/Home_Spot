import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatDrawer from '../components/ChatDrawer';
import { api } from '../services/api';
import ThreeDTilt from '../components/ThreeDTilt';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

// Simulated vector map showing Punjab's core renting areas
function PunjabVectorMap({ hoveredProperty, activeCity, onCitySelect, properties }) {
  const canvasRef = useRef(null);
  
  const cities = [
    { id: 'ludhiana', name: 'Ludhiana', x: 150, y: 220, count: properties.filter(p => p.city === 'ludhiana').length },
    { id: 'amritsar', name: 'Amritsar', x: 70, y: 90, count: properties.filter(p => p.city === 'amritsar').length },
    { id: 'jalandhar', name: 'Jalandhar', x: 110, y: 150, count: properties.filter(p => p.city === 'jalandhar').length },
    { id: 'mohali', name: 'Mohali', x: 230, y: 190, count: properties.filter(p => p.city === 'mohali').length }
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const drawMap = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cities[1].x, cities[1].y);
      ctx.lineTo(cities[2].x, cities[2].y);
      ctx.lineTo(cities[0].x, cities[0].y);
      ctx.lineTo(cities[3].x, cities[3].y);
      ctx.stroke();

      cities.forEach(c => {
        const isHovered = hoveredProperty && hoveredProperty.city === c.id;
        const isActive = activeCity === c.id;
        
        ctx.save();
        ctx.shadowBlur = (isHovered || isActive) ? 22 : 8;
        ctx.shadowColor = (isHovered || isActive) ? '#a855f7' : '#6366f1';
        
        const pulse = 1 + Math.sin(Date.now() / 250) * 0.08;
        ctx.fillStyle = (isHovered || isActive) ? '#a855f7' : '#6366f1';
        
        ctx.beginPath();
        ctx.arc(c.x, c.y, (isHovered || isActive) ? 11 * pulse : 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();

        ctx.font = 'bold 12px Poppins, sans-serif';
        ctx.fillStyle = (isHovered || isActive) ? '#fff' : '#a1a1aa';
        ctx.fillText(`${c.name.charAt(0).toUpperCase() + c.name.slice(1)} (${c.count})`, c.x + 16, c.y + 4);
      });

      animationId = requestAnimationFrame(drawMap);
    };

    canvas.width = 300;
    canvas.height = 320;
    
    drawMap();

    return () => cancelAnimationFrame(animationId);
  }, [hoveredProperty, activeCity, properties]);

  return (
    <div className="map-canvas-container" style={{ padding: '25px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
      <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <i className="fas fa-map-marked-alt" style={{ color: 'var(--primary-color)' }}></i>
        Punjab Simulated Map
      </h4>
      <p style={{ color: '#71717a', fontSize: '0.8rem', marginBottom: '20px' }}>
        Click city nodes to filter properties, or hover cards to highlight pins.
      </p>
      
      <div style={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto', display: 'block', background: 'transparent' }} />
        
        {cities.map(c => (
          <button
            key={c.id}
            onClick={() => onCitySelect(c.id)}
            style={{
              position: 'absolute',
              left: `${(c.x / 300) * 100}%`,
              top: `${(c.y / 320) * 100}%`,
              width: '32px',
              height: '32px',
              transform: 'translate(-50%, -50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              zIndex: 5
            }}
            title={`Filter by ${c.name}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Listings() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    rooms: '',
    minPrice: '',
    maxPrice: ''
  });
  
  const [sortBy, setSortBy] = useState('default');
  const [comparisonProperties, setComparisonProperties] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 4;
  
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [displayedProperties, setDisplayedProperties] = useState([]);
  
  const [resultsTitle, setResultsTitle] = useState('All Properties');
  const [resultsCount, setResultsCount] = useState(0);
  
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [hoveredProperty, setHoveredProperty] = useState(null);

  const [allProperties, setAllProperties] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);

  // Chat drawer states
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    async function loadListings() {
      try {
        const list = await api.properties.getListings();
        setAllProperties(list || []);
      } catch (error) {
        console.error('Error loading properties in Listings:', error);
      }
    }
    loadListings();
    
    const storedCompare = JSON.parse(localStorage.getItem('comparisonProperties') || '[]');
    setComparisonProperties(storedCompare);
  }, []);

  useEffect(() => {
    async function loadUserFavorites() {
      if (user) {
        try {
          const list = await api.favorites.getFavorites();
          setUserFavorites(list || []);
        } catch (error) {
          console.error('Error loading favorites in Listings:', error);
        }
      }
    }
    loadUserFavorites();
  }, [user]);

  const getPriceNumber = (priceString) => {
    if (!priceString) return 0;
    const cleanStr = String(priceString).replace(/[^\d]/g, '');
    return cleanStr ? parseInt(cleanStr, 10) : 0;
  };

  const addToRecentlyViewed = (property) => {
    const propId = String(property.id || property._id);
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    const filtered = recentlyViewed.filter(p => String(p.id || p._id) !== propId);
    filtered.unshift({ ...property, viewedAt: Date.now() });
    const limited = filtered.slice(0, 5);
    localStorage.setItem('recentlyViewed', JSON.stringify(limited));
  };

  useEffect(() => {
    const cityParam = searchParams.get('city');
    const roomParam = searchParams.get('rooms');
    const pageParam = searchParams.get('page');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const sortParam = searchParams.get('sort');
    
    if (cityParam || roomParam || pageParam || minPriceParam || maxPriceParam || sortParam) {
      setSearchFilters({
        city: cityParam || '',
        rooms: roomParam || '',
        minPrice: minPriceParam || '',
        maxPrice: maxPriceParam || ''
      });
      setCurrentPage(parseInt(pageParam) || 1);
      if (sortParam) setSortBy(sortParam);
    }
  }, [searchParams]);

  useEffect(() => {
    let filtered = [...allProperties];
    
    if (searchFilters.city) {
      filtered = filtered.filter(property => String(property.city).toLowerCase() === searchFilters.city.toLowerCase());
    }
    
    if (searchFilters.rooms) {
      filtered = filtered.filter(property => property.rooms >= parseInt(searchFilters.rooms));
    }
    
    if (searchFilters.minPrice) {
      const minPrice = parseInt(searchFilters.minPrice.replace(/,/g, ''));
      filtered = filtered.filter(property => getPriceNumber(property.price) >= minPrice);
    }
    
    if (searchFilters.maxPrice) {
      const maxPrice = parseInt(searchFilters.maxPrice.replace(/,/g, ''));
      filtered = filtered.filter(property => getPriceNumber(property.price) <= maxPrice);
    }
    
    if (sortBy !== 'default') {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return getPriceNumber(a.price) - getPriceNumber(b.price);
          case 'price-desc':
            return getPriceNumber(b.price) - getPriceNumber(a.price);
          case 'rooms-asc':
            return a.rooms - b.rooms;
          case 'rooms-desc':
            return b.rooms - a.rooms;
          case 'sqft-asc':
            return parseInt(String(a.sqft).replace(/,/g, '')) - parseInt(String(b.sqft).replace(/,/g, ''));
          case 'sqft-desc':
            return parseInt(String(b.sqft).replace(/,/g, '')) - parseInt(String(a.sqft).replace(/,/g, ''));
          default:
            return 0;
        }
      });
    }
    
    setFilteredProperties(filtered);
    
    let titleText = '';
    if (searchFilters.city && searchFilters.rooms) {
      titleText = `Properties in ${searchFilters.city.charAt(0).toUpperCase() + searchFilters.city.slice(1)} with ${searchFilters.rooms}+ Rooms`;
    } else if (searchFilters.city) {
      titleText = `Properties in ${searchFilters.city.charAt(0).toUpperCase() + searchFilters.city.slice(1)}`;
    } else if (searchFilters.rooms) {
      titleText = `Properties with ${searchFilters.rooms}+ Rooms`;
    } else {
      titleText = 'All Properties';
    }
    
    setResultsTitle(titleText);
    setResultsCount(filtered.length);
  }, [searchFilters, sortBy, allProperties]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * propertiesPerPage;
    const endIndex = startIndex + propertiesPerPage;
    setDisplayedProperties(filteredProperties.slice(startIndex, endIndex));
  }, [filteredProperties, currentPage]);

  const handleSearch = () => {
    const newParams = new URLSearchParams();
    if (searchFilters.city) newParams.set('city', searchFilters.city);
    if (searchFilters.rooms) newParams.set('rooms', searchFilters.rooms);
    if (searchFilters.minPrice) newParams.set('minPrice', searchFilters.minPrice);
    if (searchFilters.maxPrice) newParams.set('maxPrice', searchFilters.maxPrice);
    if (sortBy !== 'default') newParams.set('sort', sortBy);
    newParams.set('page', '1');
    
    setCurrentPage(1);
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchFilters({ city: '', rooms: '', minPrice: '', maxPrice: '' });
    setSortBy('default');
    setCurrentPage(1);
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const handleBooking = (property) => {
    if (property.status === 'rented') {
      showToast('This property has already been sold out!', 'error');
      return;
    }
    addToRecentlyViewed(property);
    localStorage.setItem('selectedProperty', JSON.stringify(property));
    navigate('/booking');
  };

  const handleViewDetails = (property) => {
    addToRecentlyViewed(property);
    setSelectedProperty(property);
  };

  const handleOpenChatWithOwner = async (property, e) => {
    e?.stopPropagation();
    if (!user) {
      showToast('Please login to chat with property owner', 'warning');
      navigate('/login');
      return;
    }

    try {
      const propId = String(property.id || property._id);
      const userBookings = await api.bookings.getBookings();
      let booking = (userBookings || []).find(b => String(b.property?.id || b.property?._id || b.property) === propId);

      if (!booking) {
        showToast('Connecting to owner...', 'info');
        booking = await api.bookings.createBooking({
          propertyId: propId,
          name: user.username || 'Tenant',
          email: user.email || 'tenant@gmail.com',
          phone: '+91 98765-43210',
          moveInDate: new Date().toISOString(),
          duration: 'Flexible',
          message: 'Inquiry: Interested in chatting about this property.',
          status: 'pending'
        });
      }

      setActiveChatBooking(booking);
      setIsChatOpen(true);
    } catch (err) {
      console.error('Error starting owner chat:', err);
      showToast('Failed to start chat with owner.', 'error');
    }
  };

  const handleAddToFavorites = async (property, e) => {
    e?.stopPropagation();
    if (!user) {
      showToast('Please login to add favorites', 'warning');
      navigate('/login');
      return;
    }
    
    const propId = String(property.id || property._id);
    const isAlreadyFavorite = userFavorites.some(fav => String(fav._id || fav.id) === propId);
    
    try {
      const updated = await api.favorites.toggleFavorite(property, !isAlreadyFavorite);
      setUserFavorites(updated || []);
      if (!isAlreadyFavorite) {
        showToast('Property added to favorites!', 'success');
      } else {
        showToast('Property removed from favorites!', 'info');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Failed to update favorite', 'error');
    }
  };

  const handleToggleComparison = (property, e) => {
    e?.stopPropagation();
    const propId = String(property.id || property._id);
    const isInComparison = comparisonProperties.some(p => String(p.id || p._id) === propId);
    let updated;
    
    if (isInComparison) {
      updated = comparisonProperties.filter(p => String(p.id || p._id) !== propId);
      setComparisonProperties(updated);
      showToast('Removed from comparison', 'info');
    } else {
      if (comparisonProperties.length >= 3) {
        showToast('You can compare maximum 3 properties', 'warning');
        return;
      }
      updated = [...comparisonProperties, property];
      setComparisonProperties(updated);
      showToast('Added to comparison', 'success');
    }
    localStorage.setItem('comparisonProperties', JSON.stringify(updated));
  };

  const handleCitySelectFromMap = (cityId) => {
    setSearchFilters(prev => ({ ...prev, city: cityId }));
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('city', cityId);
    newParams.set('page', '1');
    setSearchParams(newParams);
    showToast(`Filtering listings for ${cityId.charAt(0).toUpperCase() + cityId.slice(1)}`, 'info');
  };

  const handleShare = (property, e) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/listings?city=${property.city}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Search link copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy link', 'error');
    });
  };

  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  return (
    <PageTransition>
      <Header />
      
      <main style={{ background: '#09090b', minHeight: '95vh', paddingBottom: '80px', position: 'relative' }}>
        <div className="grid-bg"></div>

        <section className="page-hero" style={{
          padding: '50px 20px',
          textAlign: 'center',
          color: 'var(--light-text)',
          background: 'radial-gradient(circle at center, #1b1b2f, #09090b)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '700' }}>Scout Rental Homes</h1>
        </section>
        
        {/* Search Section */}
        <section className="search-section" style={{ padding: '30px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="container">
            <div className="glass-panel" style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '15px',
                marginBottom: '20px'
              }}>
                <select 
                  value={searchFilters.city}
                  onChange={(e) => { setSearchFilters(prev => ({ ...prev, city: e.target.value })); setCurrentPage(1); }}
                  className="glass-select"
                >
                  <option value="">Select city</option>
                  <option value="mohali">Mohali</option>
                  <option value="ludhiana">Ludhiana</option>
                  <option value="amritsar">Amritsar</option>
                  <option value="jalandhar">Jalandhar</option>
                </select>
                
                <select 
                  value={searchFilters.rooms}
                  onChange={(e) => { setSearchFilters(prev => ({ ...prev, rooms: e.target.value })); setCurrentPage(1); }}
                  className="glass-select"
                >
                  <option value="">Select rooms</option>
                  <option value="1">1+ Room</option>
                  <option value="2">2+ Rooms</option>
                  <option value="3">3+ Rooms</option>
                  <option value="4">4+ Rooms</option>
                  <option value="5">5+ Rooms</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Min Price (₹)"
                  value={searchFilters.minPrice}
                  onChange={(e) => { setSearchFilters(prev => ({ ...prev, minPrice: e.target.value })); setCurrentPage(1); }}
                  className="glass-input"
                />
                
                <input
                  type="text"
                  placeholder="Max Price (₹)"
                  value={searchFilters.maxPrice}
                  onChange={(e) => { setSearchFilters(prev => ({ ...prev, maxPrice: e.target.value })); setCurrentPage(1); }}
                  className="glass-input"
                />
                
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className="glass-select"
                >
                  <option value="default">Sort By</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rooms-asc">Rooms: Low to High</option>
                  <option value="rooms-desc">Rooms: High to Low</option>
                  <option value="sqft-asc">Size: Low to High</option>
                  <option value="sqft-desc">Size: High to Low</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleSearch}
                  className="glow-btn"
                  style={{ padding: '12px 28px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: 'var(--primary-gradient)', color: '#fff' }}
                >
                  Search Properties
                </button>
                
                <button 
                  onClick={handleClearFilters}
                  style={{ padding: '12px 28px', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff' }}
                >
                  Clear Filters
                </button>
                
                {comparisonProperties.length > 0 && !isChatOpen && (
                  <button 
                    onClick={() => navigate('/compare')}
                    style={{ padding: '12px 28px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <i className="fas fa-balance-scale"></i> Compare Dashboard ({comparisonProperties.length})
                  </button>
                )}
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '5px' }}>{resultsTitle}</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>{resultsCount} properties found</p>
            </div>
          </div>
        </section>
        
        {/* Split Screen Listings & Map Section */}
        <section className="listings-section" style={{ padding: '40px 0' }}>
          <div className="container grid-responsive-1-4-1">
            
            {/* Left Column: Properties Grid */}
            <div>
              {displayedProperties.length === 0 ? (
                <div className="glass-panel" style={{ padding: '50px', textAlign: 'center' }}>
                  <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', color: '#71717a', marginBottom: '15px' }}></i>
                  <h4 style={{ color: '#fff', marginBottom: '10px' }}>No matches found</h4>
                  <p style={{ color: '#a1a1aa' }}>Try clearing search parameters or filtering for another city.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '25px' }}>
                  {displayedProperties.map((property) => {
                    const propId = String(property.id || property._id);
                    const isFav = userFavorites.some(fav => String(fav._id || fav.id) === propId);
                    const isComparing = comparisonProperties.some(p => String(p.id || p._id) === propId);

                    return (
                      <ThreeDTilt 
                        key={propId}
                        className="property-card glass-panel"
                        maxTilt={6}
                        scale={1.01}
                        onMouseEnter={() => setHoveredProperty(property)}
                        onMouseLeave={() => setHoveredProperty(null)}
                        onClick={() => handleViewDetails(property)}
                        style={{ border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
                      >
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={property.image} 
                            alt={property.title}
                            style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                          />

                          {/* Top-Left Corner: Chat with Owner Button */}
                          <button
                            onClick={(e) => handleOpenChatWithOwner(property, e)}
                            style={{ 
                              position: 'absolute',
                              top: '10px',
                              left: '10px',
                              zIndex: 5,
                              background: 'rgba(99, 102, 241, 0.9)', 
                              border: '1px solid rgba(255,255,255,0.25)', 
                              borderRadius: '50%', 
                              width: '36px', 
                              height: '36px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              cursor: 'pointer', 
                              color: '#fff',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                            }}
                            title="Chat with Owner"
                          >
                            <i className="fas fa-comments" style={{ fontSize: '0.95rem' }}></i>
                          </button>

                          {property.status === 'rented' && (
                            <div style={{
                              position: 'absolute',
                              top: '10px',
                              left: '54px',
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
                          
                          {/* Top-Right Corner: Heart, Compare, Share */}
                          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 3 }} onClick={e => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleAddToFavorites(property, e)}
                              style={{ 
                                background: 'rgba(9,9,11,0.85)', 
                                border: '1px solid rgba(255,255,255,0.15)', 
                                borderRadius: '50%', 
                                width: '34px', 
                                height: '34px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer', 
                                color: isFav ? '#ef4444' : '#a1a1aa' 
                              }}
                              title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                            >
                              <i className={isFav ? "fas fa-heart" : "far fa-heart"}></i>
                            </button>
                          
                            <button
                              onClick={(e) => handleToggleComparison(property, e)}
                              style={{ 
                                background: isComparing ? '#10b981' : 'rgba(9,9,11,0.85)', 
                                border: `1px solid ${isComparing ? '#10b981' : 'rgba(255,255,255,0.15)'}`, 
                                borderRadius: '50%', 
                                width: '34px', 
                                height: '34px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer', 
                                color: '#fff' 
                              }}
                              title={isComparing ? "Remove from Comparison" : "Add to Comparison"}
                            >
                              <i className="fas fa-balance-scale"></i>
                            </button>
                          
                            <button
                              onClick={(e) => handleShare(property, e)}
                              style={{ 
                                background: 'rgba(9,9,11,0.85)', 
                                border: '1px solid rgba(255,255,255,0.15)', 
                                borderRadius: '50%', 
                                width: '34px', 
                                height: '34px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer', 
                                color: '#a1a1aa' 
                              }}
                              title="Share"
                            >
                              <i className="fas fa-share-alt"></i>
                            </button>
                          </div>
                        </div>
                      
                        <div style={{ padding: '20px' }}>
                          <div style={{ display: 'flex', gap: '15px', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                            <span><i className="fas fa-bed"></i> {property.beds}</span>
                            <span><i className="fas fa-bath"></i> {property.baths}</span>
                            <span><i className="fas fa-ruler-combined"></i> {property.sqft}</span>
                          </div>
                          
                          <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '5px', fontWeight: '600' }}>{property.title}</h3>
                          <p style={{ color: 'var(--primary-color)', fontWeight: '600', fontSize: '1.1rem', marginBottom: '15px' }}>{property.price}</p>
                          
                          {property.status === 'rented' ? (
                            <button 
                              disabled
                              className="glow-btn"
                              style={{ width: '100%', padding: '10px', background: '#27272a', color: '#71717a', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', cursor: 'not-allowed', boxShadow: 'none' }}
                            >
                              Sold / Rented
                            </button>
                          ) : (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleBooking(property); }}
                              className="glow-btn"
                              style={{ width: '100%', padding: '10px', background: 'var(--primary-gradient)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                              Book Now
                            </button>
                          )}
                        </div>
                      </ThreeDTilt>
                    );
                  })}
                </div>
              )}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '40px', gap: '8px' }}>
                  {currentPage > 1 && (
                    <button onClick={() => handlePageChange(currentPage - 1)} style={{ padding: '8px 14px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer' }}>&laquo;</button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      style={{ padding: '8px 14px', borderRadius: '6px', background: currentPage === page ? 'var(--primary-color)' : 'rgba(255,255,255,0.05)', border: `1px solid ${currentPage === page ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)'}`, color: '#fff', cursor: 'pointer', fontWeight: '600' }}
                    >
                      {page}
                    </button>
                  ))}
                  {currentPage < totalPages && (
                    <button onClick={() => handlePageChange(currentPage + 1)} style={{ padding: '8px 14px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', cursor: 'pointer' }}>&raquo;</button>
                  )}
                </div>
              )}
            </div>
            
            {/* Right Column: Sticky Simulated Map */}
            <div style={{ position: 'sticky', top: '110px' }}>
              <div className="glass-panel" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <PunjabVectorMap
                  hoveredProperty={hoveredProperty}
                  activeCity={searchFilters.city}
                  onCitySelect={handleCitySelectFromMap}
                  properties={allProperties}
                />
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Floating Comparison Drawer (Hidden whenever Chat is open) */}
      {comparisonProperties.length > 0 && !isChatOpen && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          background: 'rgba(15, 15, 20, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '12px',
          padding: '12px 20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-balance-scale" style={{ color: '#10b981' }}></i>
            <span>Comparing <strong>{comparisonProperties.length}/3</strong> items</span>
          </div>
          <button
            onClick={() => navigate('/compare')}
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Compare Now
          </button>
        </div>
      )}
      
      {/* Property Details Modal Overlay */}
      <AnimatePresence>
        {selectedProperty && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '20px' }}>
            <div onClick={() => setSelectedProperty(null)} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 9, 11, 0.85)', backdropFilter: 'blur(8px)' }} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="glass-panel" 
              style={{ position: 'relative', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', background: '#0e0e11', border: '1px solid rgba(99, 102, 241, 0.3)', padding: 0 }}
            >
              <button onClick={() => setSelectedProperty(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', zIndex: 10 }}>×</button>
              
              <img src={selectedProperty.image} alt={selectedProperty.title} style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
              
              <div style={{ padding: '30px' }}>
                <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '15px', fontWeight: '700' }}>{selectedProperty.title}</h2>
                
                <div style={{ display: 'flex', gap: '20px', color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '20px' }}>
                  <span><i className="fas fa-bed"></i> {selectedProperty.beds}</span>
                  <span><i className="fas fa-bath"></i> {selectedProperty.baths}</span>
                  <span><i className="fas fa-ruler-combined"></i> {selectedProperty.sqft}</span>
                </div>
                
                <p style={{ color: '#e4e4e7', marginBottom: '15px' }}><i className="fas fa-map-marker-alt" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i> {selectedProperty.address}</p>
                <p style={{ color: '#e4e4e7', marginBottom: '20px' }}><i className="fas fa-phone" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i> {selectedProperty.phone}</p>
                
                <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: '600', marginBottom: '30px' }}>{selectedProperty.price}</h3>
                
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  {selectedProperty.status === 'rented' ? (
                    <button disabled className="glow-btn" style={{ flex: 1, padding: '12px', background: '#27272a', color: '#71717a', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'not-allowed', boxShadow: 'none' }}>Sold / Rented</button>
                  ) : (
                    <button onClick={() => handleBooking(selectedProperty)} className="glow-btn" style={{ flex: 1, padding: '12px', background: 'var(--primary-gradient)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>Book Now</button>
                  )}

                  <button
                    onClick={(e) => handleOpenChatWithOwner(selectedProperty, e)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'rgba(99, 102, 241, 0.15)',
                      color: '#818cf8',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <i className="fas fa-comments"></i> Chat with Owner
                  </button>

                  {(() => {
                    const propId = String(selectedProperty.id || selectedProperty._id);
                    const isFav = userFavorites.some(fav => String(fav._id || fav.id) === propId);
                    return (
                      <button 
                        onClick={(e) => handleAddToFavorites(selectedProperty, e)} 
                        style={{ 
                          padding: '12px 24px', 
                          background: 'rgba(255,255,255,0.05)', 
                          color: isFav ? '#ef4444' : '#a1a1aa', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '8px', 
                          fontSize: '1rem', 
                          fontWeight: '600', 
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <i className={isFav ? "fas fa-heart" : "far fa-heart"}></i> 
                        {isFav ? "Remove Favorite" : "Add Favorite"}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real-time Chat Drawer with Owner */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        booking={activeChatBooking}
        currentUser={user}
      />

      <Footer />
    </PageTransition>
  );
}
