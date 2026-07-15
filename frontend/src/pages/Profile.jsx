import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import ThreeDTilt from '../components/ThreeDTilt';
import ChatDrawer from '../components/ChatDrawer';

const MOCK_DOCS = [
  { id: 1, name: 'Registered Rent Agreement.pdf', size: '1.2 MB', type: 'PDF' },
  { id: 2, name: 'Security Deposit Receipt.pdf', size: '420 KB', type: 'PDF' },
  { id: 3, name: 'Police Verification Clearance.pdf', size: '890 KB', type: 'PDF' }
];

const MOCK_BOOKINGS = [
  { id: 101, title: 'Amritsar City Apartment', city: 'Amritsar', date: 'May 12, 2026', status: 'approved', price: '₹35,000/month' },
  { id: 102, title: 'Mohali Studio Apartment', city: 'Mohali', date: 'June 01, 2026', status: 'pending', price: '₹18,000/month' }
];

import { api } from '../services/api';

export default function Profile() {
  const { user, logout } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Chat Drawer states
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = (booking) => {
    setSelectedBooking(booking);
    setIsChatOpen(true);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchBookings = async () => {
      try {
        const data = await api.bookings.getBookings();
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        // Fallback to localStorage or empty array (never fallback to default mock if user has nothing)
        const history = JSON.parse(localStorage.getItem('bookingHistory')) || [];
        setBookings(history);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  const handleDownloadDoc = (docName) => {
    showToast(`Downloading: ${docName}`, 'success');
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request?')) return;
    try {
      const updated = await api.bookings.updateBooking(bookingId, { status: 'cancelled' });
      setBookings(prev => prev.map(b => (b._id === bookingId || b.id === bookingId) ? updated : b));
      showToast('Booking inquiry cancelled successfully.', 'info');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      showToast(err.message || 'Failed to cancel booking.', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/');
  };

  if (!user) return null;

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
          <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '700' }}>Tenant Hub</h1>
        </section>

        <section style={{ padding: '40px 0' }}>
          <div className="container grid-responsive-1-2-profile">
            
            {/* Left Column: Profile Avatar Panel */}
            <div className="glass-panel" style={{ padding: '35px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                color: '#fff',
                fontSize: '2.5rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                {(user.username || 'U').slice(0, 2).toUpperCase()}
              </div>

              <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '600', marginBottom: '5px' }}>{user.username}</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '25px' }}>{user.email}</p>
              
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#71717a' }}>Role:</span>
                  <span style={{ color: '#fff', fontWeight: '600' }}>{(user.role || 'Tenant').toUpperCase()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: '#71717a' }}>Verified status:</span>
                  <span style={{ color: '#10b981', fontWeight: '600' }}><i className="fas fa-check-circle"></i> Active</span>
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="glow-btn"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: '600', marginTop: '30px', cursor: 'pointer' }}
              >
                Sign Out
              </button>
            </div>

            {/* Right Column: Bookings & Document Locker */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Timeline list */}
              <div className="glass-panel" style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '25px', textAlign: 'left' }}>
                  Booking Status Timeline
                </h3>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#a1a1aa' }}>
                    <p>Loading booking history...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '35px 20px', color: '#a1a1aa' }}>
                    <i className="far fa-calendar-times" style={{ fontSize: '2.5rem', color: '#71717a', marginBottom: '15px', display: 'block' }}></i>
                    <p style={{ margin: 0, fontWeight: '600' }}>No booking history found.</p>
                    <small style={{ color: '#71717a', display: 'block', marginTop: '5px' }}>Explore active listings to submit your first rental inquiry.</small>
                  </div>
                ) : (
                  <div className="timeline" style={{ textAlign: 'left' }}>
                    {bookings.map((booking) => {
                      const title = booking.property ? booking.property.title : booking.title;
                      const city = booking.property ? booking.property.city : booking.city;
                      const price = booking.property ? booking.property.price : booking.price;
                      const date = booking.moveInDate ? new Date(booking.moveInDate).toLocaleDateString() : booking.date;
                      const id = booking._id || booking.id;
                      
                      // Status colors
                      const getLeaseBadgeStyles = (status) => {
                        if (status === 'approved') return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
                        if (status === 'declined') return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
                        if (status === 'cancelled') return { bg: 'rgba(255, 255, 255, 0.12)', color: '#71717a' };
                        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
                      };

                      const getPaymentBadgeStyles = (payStatus) => {
                        if (payStatus === 'paid') return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', text: 'Paid' };
                        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', text: 'Unpaid' };
                      };

                      const leaseStyles = getLeaseBadgeStyles(booking.status);
                      const paymentStyles = getPaymentBadgeStyles(booking.paymentStatus || 'unpaid');

                      return (
                        <div key={id} className={`timeline-item ${booking.status === 'approved' ? 'active' : 'pending'}`}>
                          <div className="timeline-node"></div>
                          <div style={{ paddingLeft: '15px', width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>{title}</h4>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  padding: '3px 8px',
                                  borderRadius: '20px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  background: leaseStyles.bg,
                                  color: leaseStyles.color
                                }}>
                                  Lease: {booking.status || 'pending'}
                                </span>
                                <span style={{
                                  fontSize: '0.7rem',
                                  padding: '3px 8px',
                                  borderRadius: '20px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  background: paymentStyles.bg,
                                  color: paymentStyles.color
                                }}>
                                  Payment: {paymentStyles.text}
                                </span>
                              </div>
                            </div>
                            <p style={{ color: '#a1a1aa', fontSize: '0.85rem', margin: '5px 0' }}>
                              {city} &bull; Booked on {date}
                            </p>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', flexWrap: 'wrap', gap: '10px' }}>
                              <p style={{ color: 'var(--primary-color)', fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>
                                {price}
                              </p>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                  onClick={() => openChat(booking)}
                                  className="glow-btn"
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    background: 'rgba(255,255,255,0.03)',
                                    color: '#fff',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  <i className="far fa-comments"></i> Chat
                                </button>
                                
                                {booking.status !== 'cancelled' && booking.status !== 'declined' && booking.paymentStatus !== 'paid' && (
                                  <button
                                    onClick={() => navigate(`/payment?bookingId=${id}`)}
                                    className="glow-btn"
                                    style={{
                                      padding: '6px 14px',
                                      borderRadius: '6px',
                                      background: 'var(--primary-gradient)',
                                      color: '#fff',
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      border: 'none'
                                    }}
                                  >
                                    Pay Escrow Deposit
                                  </button>
                                )}

                                {booking.status !== 'cancelled' && booking.status !== 'declined' && (
                                  <button
                                    onClick={() => handleCancelBooking(id)}
                                    className="glow-btn"
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: '6px',
                                      background: 'rgba(239, 68, 68, 0.1)',
                                      color: '#ef4444',
                                      border: '1px solid rgba(239, 68, 68, 0.2)',
                                      fontSize: '0.8rem',
                                      fontWeight: '600',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Cancel Booking
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Document locker */}
              <div className="glass-panel" style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '25px', textAlign: 'left' }}>
                  Rental Document Locker
                </h3>

                <div className="doc-grid">
                  {!loading && bookings.some(b => b.status === 'approved' && b.paymentStatus === 'paid') ? (
                    MOCK_DOCS.map((doc) => (
                      <ThreeDTilt 
                        key={doc.id}
                        className="doc-card"
                        maxTilt={8}
                        scale={1.03}
                      >
                        <i className="far fa-file-pdf" style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '15px' }}></i>
                        <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.name}>
                          {doc.name}
                        </h4>
                        <p style={{ color: '#71717a', fontSize: '0.8rem', marginBottom: '15px' }}>{doc.size}</p>
                        
                        <button
                          onClick={() => handleDownloadDoc(doc.name)}
                          className="glow-btn"
                          style={{ padding: '8px 16px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', gap: '6px', alignItems: 'center' }}
                        >
                          <i className="fas fa-download"></i> Download
                        </button>
                      </ThreeDTilt>
                    ))
                  ) : (
                    <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '40px 20px', color: '#a1a1aa', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', width: '100%' }}>
                      <i className="fas fa-folder-open" style={{ fontSize: '2.5rem', color: '#71717a', marginBottom: '15px', display: 'block' }}></i>
                      <p style={{ margin: 0, fontWeight: '600' }}>No rental documents available.</p>
                      <small style={{ color: '#71717a', display: 'block', marginTop: '5px' }}>Your lease agreements and payment receipts will appear here once your booking is approved by the landlord AND security deposit is paid.</small>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </section>
      </main>
      <Footer />

      {/* Dynamic Slide-out Chat Drawer */}
      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        booking={selectedBooking}
        currentUser={user}
      />
    </PageTransition>
  );
}