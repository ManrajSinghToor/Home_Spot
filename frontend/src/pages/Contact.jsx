import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import ThreeDTilt from '../components/ThreeDTilt';
import { useToast } from '../components/Toast';
import { motion } from 'framer-motion';

export default function Contact() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Store contact message in localStorage
    const contactMessages = JSON.parse(localStorage.getItem('contactMessages')) || [];
    const newMessage = {
      id: Date.now(),
      ...formData,
      timestamp: new Date().toISOString()
    };
    
    contactMessages.push(newMessage);
    localStorage.setItem('contactMessages', JSON.stringify(contactMessages));
    
    showToast('Thank you for your message! We will get back to you soon.', 'success');
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: 'fas fa-map-marker-alt',
      title: 'Address',
      details: 'Phase 8, Mohali, Punjab, India',
      link: '#'
    },
    {
      icon: 'fas fa-phone',
      title: 'Phone',
      details: '+91 98765-43210',
      link: 'tel:+919876543210'
    },
    {
      icon: 'fas fa-envelope',
      title: 'Email',
      details: 'contact@homespot.in',
      link: 'mailto:contact@homespot.in'
    },
    {
      icon: 'fas fa-clock',
      title: 'Business Hours',
      details: 'Mon - Fri: 9:00 AM - 6:00 PM',
      link: '#'
    }
  ];

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
          <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '700' }}>Contact Us</h1>
          <p style={{ fontSize: '1.2rem', marginTop: '1rem', color: '#a1a1aa' }}>Get in touch with our team</p>
        </section>

        <section style={{ padding: '60px 0' }}>
          <div className="container">
            <div className="grid-responsive-1-2">
              
              {/* Contact Info Cards */}
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '20px', color: '#fff', fontWeight: '700' }}>Get in Touch</h2>
                <p style={{ color: '#a1a1aa', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '35px' }}>
                  Have questions about our services or need help finding your perfect rental home? Our support team is here to assist you at every step of the journey in Punjab.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {contactInfo.map((info, idx) => (
                    <ThreeDTilt 
                      key={idx} 
                      className="glass-panel"
                      maxTilt={5}
                      scale={1.02}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '20px 25px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '46px',
                        height: '46px',
                        background: 'var(--primary-gradient)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '20px',
                        color: '#fff',
                        fontSize: '1.2rem',
                        boxShadow: '0 0 10px rgba(99, 102, 241, 0.3)'
                      }}>
                        <i className={info.icon}></i>
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', marginBottom: '5px', color: '#fff', fontWeight: '600' }}>{info.title}</h4>
                        {info.link !== '#' ? (
                          <a href={info.link} style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s', ':hover': { color: '#fff' } }}>
                            {info.details}
                          </a>
                        ) : (
                          <span style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>{info.details}</span>
                        )}
                      </div>
                    </ThreeDTilt>
                  ))}
                </div>
              </div>

              {/* Message Input form */}
              <div className="glass-panel" style={{ padding: '35px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <h3 style={{ color: '#fff', fontSize: '1.4rem', fontWeight: '600', marginBottom: '25px', textAlign: 'left' }}>Send us a Message</h3>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>Full Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required className="glass-input" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>Email Address *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="glass-input" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>Phone Number</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="glass-input" style={{ width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>Subject *</label>
                      <input type="text" name="subject" value={formData.subject} onChange={handleChange} required className="glass-input" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '6px' }}>Message *</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows="4" className="glass-input" style={{ width: '100%', resize: 'none' }} placeholder="Write your inquiry here..."></textarea>
                  </div>

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
                      marginTop: '10px'
                    }}
                  >
                    Send Message
                  </button>
                </form>
              </div>

            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}
