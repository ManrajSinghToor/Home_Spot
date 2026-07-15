import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../components/Toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { api } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function Payment() {
  const { user } = useUser();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Payment states
  const [method, setMethod] = useState('card'); // card, upi, paypal, netbanking
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [showQR, setShowQR] = useState(false);

  // Form input states
  const [cardData, setCardData] = useState({ name: '', number: '', expiry: '', cvv: '' });
  const [upiData, setUpiData] = useState({ upiId: '' });
  const [bank, setBank] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const bookingId = searchParams.get('bookingId');
    if (!bookingId) {
      showToast('No booking transaction in progress.', 'error');
      navigate('/profile');
      return;
    }

    const loadBookingData = async () => {
      try {
        const fetchedBooking = await api.bookings.getBookingById(bookingId);
        setBooking(fetchedBooking);
      } catch (err) {
        console.error('Error loading booking in Payment:', err);
        showToast('Failed to load booking details for payment.', 'error');
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    loadBookingData();
  }, [user, searchParams, navigate]);

  if (loading) {
    return (
      <PageTransition>
        <Header />
        <main style={{ background: '#09090b', minHeight: '95vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <h3>Loading payment details...</h3>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  if (!booking) return null;

  const { property } = booking;
  if (!property) return null;
  
  // Calculate pricing breakdown
  // Clean price string and extract numeric value
  const getPriceNumber = (priceString) => {
    if (!priceString) return 0;
    const cleanStr = String(priceString).replace(/[^\d]/g, '');
    return cleanStr ? parseInt(cleanStr, 10) : 0;
  };

  const monthlyRent = getPriceNumber(property.price);
  const securityDeposit = monthlyRent * 2; // standard 2 months security deposit
  const processingFee = 1500;
  const totalAmount = securityDeposit + processingFee;

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpiChange = (e) => {
    setUpiData({ upiId: e.target.value });
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation based on payment method
    if (method === 'card') {
      if (!cardData.name || !cardData.number || !cardData.expiry || !cardData.cvv) {
        showToast('Please fill all card details.', 'warning');
        return;
      }
    } else if (method === 'upi') {
      if (!upiData.upiId) {
        showToast('Please provide a UPI ID.', 'warning');
        return;
      }
      if (!upiData.upiId.includes('@')) {
        showToast('Invalid UPI ID format (e.g. user@okhdfcbank).', 'warning');
        return;
      }
    } else if (method === 'netbanking') {
      if (!bank) {
        showToast('Please select your bank.', 'warning');
        return;
      }
    }

    // Begin premium payment authorization sequence
    setProcessing(true);
    setProcessStep(1); // Gateway handshaking

    // Phase 1 animation delay
    setTimeout(() => {
      setProcessStep(2); // Authenticating
    }, 1500);

    // Phase 2 animation delay
    setTimeout(() => {
      setProcessStep(3); // Saving payment state
    }, 3000);

    // Make backend API call to update booking payment status
    try {
      // Delay slightly to coordinate with UI steps
      await new Promise(resolve => setTimeout(resolve, 3800));

      await api.bookings.updateBooking(booking._id || booking.id, {
        paymentStatus: 'paid'
      });

      setProcessStep(4); // Success

      setTimeout(() => {
        showToast('Rent deposit paid successfully! Lease document locker is now unlocked (once landlord approves).', 'success');
        setProcessing(false);
        navigate('/profile');
      }, 1500);

    } catch (err) {
      console.error('Error confirming paid booking:', err);
      showToast(err.message || 'Payment completed but server failed to update booking record. Please contact support.', 'error');
      setProcessing(false);
    }
  };

  return (
    <PageTransition>
      <Header />
      <main style={{ background: '#09090b', minHeight: '95vh', paddingBottom: '60px', position: 'relative' }}>
        <div className="grid-bg"></div>

        <section className="page-hero" style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--light-text)',
          background: 'radial-gradient(circle at center, #1b1b2f, #09090b)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <h1 className="neon-text" style={{ fontSize: '2.5rem', fontWeight: '700' }}>Secure Rental Checkout</h1>
          <p style={{ color: '#a1a1aa', fontSize: '0.95rem', marginTop: '5px' }}>Complete your security deposit to finalize your booking.</p>
        </section>

        <section style={{ padding: '30px 0' }}>
          <div className="container grid-responsive-1-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' }}>
            
            {/* Left Column: Rent Breakdown & Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '25px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px' }}>Rental Agreement Summary</h3>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                  <img 
                    src={property.image} 
                    alt={property.title} 
                    style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} 
                  />
                  <div>
                    <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '600', margin: '0 0 5px 0' }}>{property.title}</h4>
                    <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: '0 0 8px 0' }}><i className="fas fa-map-marker-alt" style={{ marginRight: '5px', color: 'var(--primary-color)' }}></i> {property.address}</p>
                    <p style={{ color: 'var(--primary-color)', fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>{property.price}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#71717a' }}>Tenant Name:</span>
                    <span style={{ color: '#fff', fontWeight: '500' }}>{booking.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#71717a' }}>Preferred Move-In:</span>
                    <span style={{ color: '#fff', fontWeight: '500' }}>{new Date(booking.moveInDate).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#71717a' }}>Contract Lease:</span>
                    <span style={{ color: '#fff', fontWeight: '500' }}>{booking.duration} Months</span>
                  </div>
                </div>
              </div>

              {/* Pricing Invoice card */}
              <div className="glass-panel" style={{ padding: '25px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', background: 'rgba(99, 102, 241, 0.03)' }}>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px' }}>Payment Invoice</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa' }}>Monthly Rent:</span>
                    <span style={{ color: '#fff' }}>₹{monthlyRent.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa' }}>Refundable Security Deposit (2 Mo.):</span>
                    <span style={{ color: '#fff' }}>₹{securityDeposit.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#a1a1aa' }}>Administrative Setup & Stamp Duty:</span>
                    <span style={{ color: '#fff' }}>₹{processingFee.toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '15px', fontWeight: '700', fontSize: '1.15rem' }}>
                  <span style={{ color: '#fff' }}>Total Amount Due:</span>
                  <span style={{ color: 'var(--primary-color)' }}>₹{totalAmount.toLocaleString()}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginTop: '20px', padding: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                  <i className="fas fa-shield-alt" style={{ color: '#10b981', marginTop: '3px' }}></i>
                  <p style={{ color: '#a1a1aa', fontSize: '0.75rem', margin: 0, lineHeight: '1.5' }}>
                    Your funds are held securely in a digital escrow and are fully refundable under our HomeSpot security agreement until check-in.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Checkout forms */}
            <div className="glass-panel" style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '25px' }}>Choose Payment Method</h3>
              
              {/* Selector grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '30px' }}>
                <button 
                  onClick={() => setMethod('card')}
                  style={{
                    padding: '12px 6px',
                    borderRadius: '8px',
                    background: method === 'card' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: method === 'card' ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.06)',
                    color: method === 'card' ? '#fff' : '#a1a1aa',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className="far fa-credit-card" style={{ fontSize: '1.4rem' }}></i> Card
                </button>
                <button 
                  onClick={() => setMethod('upi')}
                  style={{
                    padding: '12px 6px',
                    borderRadius: '8px',
                    background: method === 'upi' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: method === 'upi' ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.06)',
                    color: method === 'upi' ? '#fff' : '#a1a1aa',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className="fas fa-mobile-alt" style={{ fontSize: '1.4rem' }}></i> UPI / GPay
                </button>
                <button 
                  onClick={() => setMethod('paypal')}
                  style={{
                    padding: '12px 6px',
                    borderRadius: '8px',
                    background: method === 'paypal' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: method === 'paypal' ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.06)',
                    color: method === 'paypal' ? '#fff' : '#a1a1aa',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className="fab fa-paypal" style={{ fontSize: '1.4rem' }}></i> PayPal
                </button>
                <button 
                  onClick={() => setMethod('netbanking')}
                  style={{
                    padding: '12px 6px',
                    borderRadius: '8px',
                    background: method === 'netbanking' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                    border: method === 'netbanking' ? '1px solid var(--primary-color)' : '1px solid rgba(255,255,255,0.06)',
                    color: method === 'netbanking' ? '#fff' : '#a1a1aa',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <i className="fas fa-university" style={{ fontSize: '1.4rem' }}></i> Net Bank
                </button>
              </div>

              {/* Subforms based on choice */}
              <form onSubmit={handlePaySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
                
                {method === 'card' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>Cardholder Name</label>
                      <input type="text" name="name" value={cardData.name} onChange={handleCardChange} placeholder="e.g. Manraj Singh" className="glass-input" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>Card Number</label>
                      <div style={{ position: 'relative' }}>
                        <input type="text" name="number" value={cardData.number} onChange={handleCardChange} placeholder="4111 2222 3333 4444" maxLength="19" className="glass-input" style={{ width: '100%', paddingLeft: '40px' }} />
                        <i className="far fa-credit-card" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }}></i>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>Expiry Date</label>
                        <input type="text" name="expiry" value={cardData.expiry} onChange={handleCardChange} placeholder="MM/YY" maxLength="5" className="glass-input" style={{ width: '100%' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>CVV Code</label>
                        <input type="password" name="cvv" value={cardData.cvv} onChange={handleCardChange} placeholder="***" maxLength="4" className="glass-input" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {method === 'upi' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>UPI Address / VPA</label>
                      <div style={{ position: 'relative' }}>
                        <input type="text" value={upiData.upiId} onChange={handleUpiChange} placeholder="e.g. pay@okhdfcbank" className="glass-input" style={{ width: '100%', paddingLeft: '40px' }} />
                        <i className="fas fa-at" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }}></i>
                      </div>
                      <small style={{ color: '#71717a', marginTop: '6px', display: 'block' }}>Instant payment notification request will be pushed to your active UPI app.</small>
                    </div>

                    <div style={{ textAlign: 'center', margin: '10px 0' }}>
                      <span style={{ color: '#71717a', fontSize: '0.85rem' }}>- OR -</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowQR(true)}
                      className="glow-btn"
                      style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <i className="fas fa-qrcode"></i> Generate Dynamic Payment QR Code
                    </button>
                  </motion.div>
                )}

                {method === 'paypal' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px 0' }}>
                    <div style={{ width: '100%', padding: '25px', background: 'rgba(255,196,57,0.05)', border: '1px dashed #ffc439', borderRadius: '10px', textAlign: 'center' }}>
                      <i className="fab fa-paypal" style={{ fontSize: '3rem', color: '#003087', marginBottom: '15px' }}></i>
                      <p style={{ color: '#e4e4e7', fontSize: '0.9rem', margin: '0 0 15px 0' }}>Redirect to standard PayPal checkout gateway interface.</p>
                      
                      <div style={{ width: '100%', maxWidth: '250px', margin: '0 auto', padding: '10px', background: '#ffc439', color: '#003087', borderRadius: '25px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <i className="fab fa-paypal"></i> PayPal Checkout
                      </div>
                    </div>
                  </motion.div>
                )}

                {method === 'netbanking' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '500' }}>Select Your Bank</label>
                      <select value={bank} onChange={(e) => setBank(e.target.value)} className="glass-select" style={{ width: '100%' }}>
                        <option value="">Choose Bank...</option>
                        <option value="sbi">State Bank of India</option>
                        <option value="hdfc">HDFC Bank</option>
                        <option value="icici">ICICI Bank</option>
                        <option value="axis">Axis Bank</option>
                        <option value="pnb">Punjab National Bank</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="glow-btn"
                  style={{
                    padding: '14px',
                    border: 'none',
                    borderRadius: '8px',
                    background: 'var(--primary-gradient)',
                    color: '#fff',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: 'auto'
                  }}
                >
                  Pay Securely ₹{totalAmount.toLocaleString()}
                </button>
              </form>
            </div>

          </div>
        </section>

        {/* Modal: UPI QR Code simulation */}
        <AnimatePresence>
          {showQR && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(8px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: '#0e0e11',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  width: '100%',
                  maxWidth: '360px',
                  padding: '30px',
                  textAlign: 'center'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: '600', margin: 0 }}>Scan & Pay via UPI</h3>
                  <button 
                    onClick={() => setShowQR(false)}
                    style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer', fontSize: '1.1rem' }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                {/* QR graphic */}
                <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', display: 'inline-block', marginBottom: '20px' }}>
                  {/* Standard placeholder dynamic styling resembling a QR code */}
                  <div style={{ width: '200px', height: '200px', background: 'repeating-conic-gradient(from 45deg, #111 0% 25%, #fff 0% 50%) 50% / 20px 20px', borderRadius: '4px', border: '2px solid #000' }}></div>
                </div>

                <h4 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700', margin: '0 0 5px 0' }}>₹{totalAmount.toLocaleString()}</h4>
                <p style={{ color: '#71717a', fontSize: '0.8rem', margin: '0 0 20px 0' }}>Scan using BHIM, Google Pay, PhonePe, or Paytm app.</p>
                
                <button
                  type="button"
                  onClick={() => {
                    setUpiData({ upiId: 'qr-scan@success' });
                    setShowQR(false);
                    showToast('QR Code Scanned Successfully! UPI VPA set.', 'success');
                  }}
                  className="glow-btn"
                  style={{ width: '100%', padding: '10px', background: 'var(--primary-gradient)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '600', cursor: 'pointer' }}
                >
                  Simulate QR Scan Success
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full-Screen securing payment animation loading overlay */}
        <AnimatePresence>
          {processing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#09090b',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
            >
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid rgba(99,102,241,0.1)', borderTop: '4px solid var(--primary-color)', animation: 'spin 1s linear infinite', marginBottom: '30px' }} />
              
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>

              <h2 className="neon-text" style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '10px' }}>
                {processStep === 1 && 'Initializing secure checkout...'}
                {processStep === 2 && 'Authenticating payment...'}
                {processStep === 3 && 'Payment Authorized! Booking listing...'}
                {processStep === 4 && 'Payment Complete! Redirecting...'}
              </h2>
              
              <div style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>
                {processStep === 1 && 'Connecting to PCI-DSS compliant server...'}
                {processStep === 2 && 'Verifying payment credentials with bank gateway...'}
                {processStep === 3 && 'Upgrading booking history records in MongoDB...'}
                {processStep === 4 && 'Successfully registered! Unlocking document locker.'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </PageTransition>
  );
}
