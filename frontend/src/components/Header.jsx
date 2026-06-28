import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { user, logout: logoutUser } = useUser();
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef();
  const location = useLocation();

  useEffect(() => {
    function onDoc(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const logout = (e) => {
    e.preventDefault();
    logoutUser();
    setOpen(false);
  };

  const initials = user ? (user.username || 'U').split(' ').map(s => s[0]).join('').slice(0,2).toUpperCase() : null;

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <motion.header
        layout
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setOpen(false);
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        style={{
          position: 'fixed',
          top: '20px',
          zIndex: 1000,
          background: 'rgba(15, 15, 20, 0.75)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderRadius: '50px',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.1)',
          overflow: 'visible',
          display: 'flex',
          alignItems: 'center',
          height: '60px',
          padding: '0 25px',
          width: isHovered ? '90%' : '180px',
          maxWidth: isHovered ? '1100px' : '180px',
          cursor: 'pointer',
          transition: 'border-color 0.3s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
          
          {/* Logo Section */}
          <div className="logo" style={{ flexShrink: 0 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <motion.img 
                src="/logo.png" 
                alt="HomeSpot Logo" 
                style={{ height: '30px', borderRadius: '5px' }}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              />
              {!isHovered && (
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff' }}>HomeSpot</span>
              )}
            </Link>
          </div>

          {/* Morphing Expanded Links Area */}
          <AnimatePresence>
            {isHovered ? (
              <motion.nav
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', alignItems: 'center', gap: '15px', flexGrow: 1, justifyContent: 'flex-end' }}
              >
                <ul className="nav-links" style={{ display: 'flex', gap: '4px', alignItems: 'center', listStyle: 'none', margin: 0, padding: 0 }}>
                  <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
                  <li><Link to="/listings" className={isActive('/listings') ? 'active' : ''}>Listings</Link></li>
                  <li><Link to="/virtual-tour" className={isActive('/virtual-tour') ? 'active' : ''}>3D Tour</Link></li>
                  <li><Link to="/compare" className={isActive('/compare') ? 'active' : ''}>Compare</Link></li>
                  <li><Link to="/blog" className={isActive('/blog') ? 'active' : ''}>Guides</Link></li>
                  <li><Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link></li>
                  <li><Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link></li>
                  <li style={{ position: 'relative' }} ref={dropdownRef}>
                    {user ? (
                      <a href="#" onClick={(e)=>{e.preventDefault(); setOpen(o=>!o)}} aria-haspopup="true" aria-expanded={open} id="loginLink">
                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: '50%', background: open ? 'var(--primary-color)' : 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: '700', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ margin: 'auto' }}>{initials}</div>
                        </span>
                      </a>
                    ) : (
                      <Link to="/login" id="loginLink" className={isActive('/login') ? 'active' : ''} style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '15px' }}>
                        <i className="fas fa-user" style={{ fontSize: '0.85rem' }}></i> 
                        <span>Log in</span>
                      </Link>
                    )}

                    {user && (
                      <div className={`profile-dropdown glass-panel ${open ? 'show' : ''}`} id="profileDropdown" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(20, 20, 25, 0.98)', top: '130%', right: '0' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
                          <strong id="profileName" style={{ color: '#fff' }}>{user.username || 'Account'}</strong>
                          <small id="profileEmail" style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', marginTop: '3px' }}>{user.email || ''}</small>
                        </div>
                        <Link to="/profile" className={isActive('/profile') ? 'active' : ''}><i className="fas fa-user-circle" style={{ marginRight: 8 }}></i> Profile</Link>
                        <Link to="/favorites" className={isActive('/favorites') ? 'active' : ''}><i className="fas fa-heart" style={{ marginRight: 8 }}></i> Favorites</Link>
                        {user.role === 'landlord' && (
                          <Link to="/landlord" className={isActive('/landlord') ? 'active' : ''}><i className="fas fa-tasks" style={{ marginRight: 8 }}></i> Landlord Center</Link>
                        )}
                        <Link to="/settings" className={isActive('/settings') ? 'active' : ''}><i className="fas fa-cog" style={{ marginRight: 8 }}></i> Settings</Link>
                        <a href="#" className="signout-btn" onClick={logout} style={{ color: '#ef4444' }}><i className="fas fa-sign-out-alt" style={{ marginRight: 8 }}></i> Sign Out</a>
                      </div>
                    )}
                  </li>
                </ul>
              </motion.nav>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                style={{ fontSize: '0.75rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', paddingRight: '5px' }}
              >
                Menu <i className="fas fa-bars" style={{ marginLeft: '4px' }}></i>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.header>
    </div>
  );
}
