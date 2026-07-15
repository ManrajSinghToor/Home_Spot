import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { api } from '../services/api';
import ThreeDTilt from '../components/ThreeDTilt';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

// Simulated vector map showing Punjab's core renting areas
function PunjabVectorMap({ hoveredProperty, activeCity, onCitySelect, properties }) {
  const canvasRef = useRef(null);
  
  // Coordinate locations representing Ludhiana, Amritsar, Jalandhar, Mohali
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

      // Draw grid coordinates in background
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

      // Draw connection highways (network grid representing routes between Punjab cities)
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.beginPath();
      ctx.moveTo(cities[1].x, cities[1].y); // Amritsar
      ctx.lineTo(cities[2].x, cities[2].y); // Jalandhar
      ctx.lineTo(cities[0].x, cities[0].y); // Ludhiana
      ctx.lineTo(cities[3].x, cities[3].y); // Mohali
      ctx.stroke();

      // Draw glowing nodes for each city
      cities.forEach(c => {
        const isHovered = hoveredProperty && hoveredProperty.city === c.id;
        const isActive = activeCity === c.id;
        
        ctx.save();
        ctx.shadowBlur = (isHovered || isActive) ? 22 : 8;
        ctx.shadowColor = (isHovered || isActive) ? '#a855f7' : '#6366f1';
        
        // Dynamic node pulsers
        const pulse = 1 + Math.sin(Date.now() / 250) * 0.08;
        ctx.fillStyle = (isHovered || isActive) ? '#a855f7' : '#6366f1';
        
        ctx.beginPath();
        ctx.arc(c.x, c.y, (isHovered || isActive) ? 11 * pulse : 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();

        // City text labels
        ctx.font = 'bold 12px Poppins, sans-serif';
        ctx.fillStyle = (isHovered || isActive) ? '#fff' : '#a1a1aa';
        ctx.fillText(`${c.name.charAt(0).toUpperCase() + c.name.slice(1)} (${c.count})`, c.x + 16, c.y + 4);
      });

      animationId = requestAnimationFrame(drawMap);
    };

    // Size fitting
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
        
        {/* Clickable Overlay Regions for City nodes to filter listings */}
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
  
  // State for search and filtering
  const [searchFilters, setSearchFilters] = useState({
    city: '',
    rooms: '',
    minPrice: '',
    maxPrice: ''
  });
  
  // State for sorting
  const [sortBy, setSortBy] = useState('default');
  
  // State for comparison
  const [comparisonProperties, setComparisonProperties] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 4; // reduced for side-by-side split screen height fit
  
  // State for filtered properties
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [displayedProperties, setDisplayedProperties] = useState([]);
  
  // State for results display
  const [resultsTitle, setResultsTitle] = useState('All Properties');
  const [resultsCount, setResultsCount] = useState(0);
  
  // State for property detail modal
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  // Track hovered property
  const [hoveredProperty, setHoveredProperty] = useState(null);

  // Dynamic property list loaded from API
  const [allProperties, setAllProperties] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);

  useEffect(() => {
    async function loadListings() {
      try {
        const list = await api.properties.getListings();
        setAllProperties(list);
      } catch (error) {
        console.error('Error loading properties in Listings:', error);
      }
    }
    loadListings();
    
    // Load comparison properties from storage
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

  // Helper function to extract price number from price string
  const getPriceNumber = (priceString) => {
    if (!priceString) return 0;
    const cleanStr = String(priceString).replace(/[^\d]/g, '');
    return cleanStr ? parseInt(cleanStr, 10) : 0;
  };

  // Track recently viewed properties
  const addToRecentlyViewed = (property) => {
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
    const filtered = recentlyViewed.filter(p => p.id !== property.id);
    filtered.unshift({ ...property, viewedAt: Date.now() });
    const limited = filtered.slice(0, 5);
    localStorage.setItem('recentlyViewed', JSON.stringify(limited));
  };

  // Initialize filters from URL parameters
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

  // Filter and sort properties based on search criteria
  useEffect(() => {
    let filtered = [...allProperties];
    
    // Apply filters
    if (searchFilters.city) {
      filtered = filtered.filter(property => property.city === searchFilters.city);
    }
    
    if (searchFilters.rooms) {
      filtered = filtered.filter(property => property.rooms >= parseInt(searchFilters.rooms));
    }
    
    // Price filter
    if (searchFilters.minPrice) {
      const minPrice = parseInt(searchFilters.minPrice.replace(/,/g, ''));
      filtered = filtered.filter(property => getPriceNumber(property.price) >= minPrice);
    }
    
    if (searchFilters.maxPrice) {
      const maxPrice = parseInt(searchFilters.maxPrice.replace(/,/g, ''));
      filtered = filtered.filter(property => getPriceNumber(property.price) <= maxPrice);
    }
    
    // Apply sorting
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
            return parseInt(a.sqft.replace(/,/g, '')) - parseInt(b.sqft.replace(/,/g, ''));
          case 'sqft-desc':
            return parseInt(b.sqft.replace(/,/g, '')) - parseInt(a.sqft.replace(/,/g, ''));
          default:
            return 0;
        }
      });
    }
    
    setFilteredProperties(filtered);
    
    // Update results display
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

  // Calculate pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * propertiesPerPage;
    const endIndex = startIndex + propertiesPerPage;
    setDisplayedProperties(filteredProperties.slice(startIndex, endIndex));
  }, [filteredProperties, currentPage]);

  // Handle search form submission
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

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchFilters({ city: '', rooms: '', minPrice: '', maxPrice: '' });
    setSortBy('default');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Handle pagination
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

  // Handle view property details
  const handleViewDetails = (property) => {
    addToRecentlyViewed(property);
    setSelectedProperty(property);
  };

  // Handle add to favorites
  const handleAddToFavorites = async (property, e) => {
    e?.stopPropagation();
    if (!user) {
      showToast('Please login to add favorites', 'warning');
      navigate('/login');
      return;
    }
    
    const isAlreadyFavorite = userFavorites.some(fav => (fav._id || fav.id) === (property._id || property.id));
    
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

  // Handle add to comparison
  const handleToggleComparison = (property, e) => {
    e?.stopPropagation();
    const isInComparison = comparisonProperties.some(p => p.id === property.id);
    let updated;
    
    if (isInComparison) {
      updated = comparisonProperties.filter(p => p.id !== property.id);
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

  // Map city selection
  const handleCitySelectFromMap = (cityId) => {
    setSearchFilters(prev => ({ ...prev, city: cityId }));
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('city', cityId);
    newParams.set('page', '1');
    setSearchParams(newParams);
    showToast(`Filtering listings for ${cityId.charAt(0).toUpperCase() + cityId.slice(1)}`, 'info');
  };

  // Copy to clipboard
  const handleShare = (property, e) => {
    e?.stopPropagation();
    const shareUrl = `${window.location.origin}/listings?city=${property.city}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Search link copied to clipboard!', 'success');
    }).catch(() => {
      showToast('Failed to copy link', 'error');
    });
  };

  // Calculate pagination info
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  const startIndex = (currentPage - 1) * propertiesPerPage;
  const endIndex = Math.min(startIndex + propertiesPerPage, filteredProperties.length);

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
                
                {comparisonProperties.length > 0 && (
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
                    const isFav = userFavorites.some(fav => (fav._id || fav.id) === (property._id || property.id));
                    return (
                      <ThreeDTilt 
                        key={property.id}
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
                          
                          {/* Actions overlay */}
                          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 3 }} onClick={e => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleAddToFavorites(property, e)}
                              style={{ 
                                background: 'rgba(9,9,11,0.75)', 
                                border: '1px solid rgba(255,255,255,0.1)', 
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
                            style={{ background: comparisonProperties.some(p => p.id === property.id) ? 'var(--primary-color)' : 'rgba(9,9,11,0.75)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                            title="Compare"
                          >
                            <i className="fas fa-balance-scale"></i>
                          </button>
                          
                          <button
                            onClick={(e) => handleShare(property, e)}
                            style={{ background: 'rgba(9,9,11,0.75)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#a1a1aa' }}
                            title="Share"
                          >
                            <i className="fas fa-share-alt"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', gap: '15px', color: '#a1a1aa', fontSize: '0.8rem', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                          <span><i className="fas fa-bed"></i> {property.beds} Beds</span>
                          <span><i className="fas fa-bath"></i> {property.baths} Baths</span>
                          <span><i className="fas fa-ruler"></i> {property.sqft} sqft</span>
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
                  <span><i className="fas fa-bed"></i> {selectedProperty.beds} Beds</span>
                  <span><i className="fas fa-bath"></i> {selectedProperty.baths} Baths</span>
                  <span><i className="fas fa-ruler"></i> {selectedProperty.sqft} sqft</span>
                </div>
                
                <p style={{ color: '#e4e4e7', marginBottom: '15px' }}><i className="fas fa-map-marker-alt" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i> {selectedProperty.address}</p>
                <p style={{ color: '#e4e4e7', marginBottom: '20px' }}><i className="fas fa-phone" style={{ marginRight: '8px', color: 'var(--primary-color)' }}></i> {selectedProperty.phone}</p>
                
                <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: '600', marginBottom: '30px' }}>{selectedProperty.price}</h3>
                
                <div style={{ display: 'flex', gap: '15px' }}>
                  {selectedProperty.status === 'rented' ? (
                    <button disabled className="glow-btn" style={{ flex: 1, padding: '12px', background: '#27272a', color: '#71717a', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'not-allowed', boxShadow: 'none' }}>Sold / Rented</button>
                  ) : (
                    <button onClick={() => handleBooking(selectedProperty)} className="glow-btn" style={{ flex: 1, padding: '12px', background: 'var(--primary-gradient)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>Book Now</button>
                  )}
                  {(() => {
                    const isFav = userFavorites.some(fav => (fav._id || fav.id) === (selectedProperty._id || selectedProperty.id));
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

      <Footer />
    </PageTransition>
  );
}
