import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      background: 'rgba(9, 9, 11, 0.95)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '60px 0 30px',
      color: '#a1a1aa',
      fontSize: '0.95rem'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
        marginBottom: '40px',
        textAlign: 'left'
      }}>
        <div>
          <div className="logo" style={{ marginBottom: '20px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>
              <img src="/logo.png" alt="HomeSpot Logo" style={{ height: '32px', borderRadius: '6px' }} />
              <span>HomeSpot</span>
            </Link>
          </div>
          <p style={{ lineHeight: '1.6', color: '#71717a' }}>
            Find premium, verified rental properties across Punjab. Immersive 3D home scouting at your fingertips.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.1rem', fontWeight: '600' }}>Explore</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><Link to="/listings" style={{ transition: 'color 0.2s', ':hover': { color: '#6366f1' } }}>Browse Homes</Link></li>
            <li><Link to="/virtual-tour" style={{ transition: 'color 0.2s' }}>3D Room Tours</Link></li>
            <li><Link to="/compare" style={{ transition: 'color 0.2s' }}>Compare Listings</Link></li>
            <li><Link to="/blog" style={{ transition: 'color 0.2s' }}>Renting Guides</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.1rem', fontWeight: '600' }}>Company</h4>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><Link to="/about" style={{ transition: 'color 0.2s' }}>About Us</Link></li>
            <li><Link to="/contact" style={{ transition: 'color 0.2s' }}>Contact & Support</Link></li>
            <li><a href="#" style={{ transition: 'color 0.2s' }}>Terms of Service</a></li>
            <li><a href="#" style={{ transition: 'color 0.2s' }}>Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.1rem', fontWeight: '600' }}>Connect with Us</h4>
          <p style={{ marginBottom: '15px', color: '#71717a' }}>Stay updated with new listings in Ludhiana, Amritsar, Jalandhar, and Mohali.</p>
          <div style={{ display: 'flex', gap: '15px' }}>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: '#fff', transition: 'all 0.2s' }}><i className="fab fa-facebook-f"></i></a>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: '#fff', transition: 'all 0.2s' }}><i className="fab fa-twitter"></i></a>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: '#fff', transition: 'all 0.2s' }}><i className="fab fa-instagram"></i></a>
            <a href="#" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: '#fff', transition: 'all 0.2s' }}><i className="fab fa-linkedin-in"></i></a>
          </div>
        </div>
      </div>
      
      <div className="container" style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '25px',
        textAlign: 'center',
        color: '#52525b',
        fontSize: '0.85rem'
      }}>
        <p>&copy; {new Date().getFullYear()} HomeSpot. Designed for Visual Excellence.</p>
      </div>
    </footer>
  );
}
