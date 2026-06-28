import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import ThreeDTilt from '../components/ThreeDTilt';
import { motion } from 'framer-motion';

export default function Services() {
  const services = [
    {
      icon: 'fas fa-search',
      title: 'Property Search',
      description: 'Find your perfect rental home with our advanced search filters and location-based recommendations.'
    },
    {
      icon: 'fas fa-eye',
      title: 'Virtual Tours',
      description: 'Take 360° virtual tours of properties from the comfort of your home before scheduling visits.'
    },
    {
      icon: 'fas fa-handshake',
      title: 'Property Management',
      description: 'Comprehensive property management services for landlords including tenant screening and maintenance.'
    },
    {
      icon: 'fas fa-calculator',
      title: 'Rent Calculator',
      description: 'Get accurate rent estimates and budget planning tools to make informed decisions.'
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Legal Support',
      description: 'Expert legal assistance for rental agreements, documentation, and dispute resolution.'
    },
    {
      icon: 'fas fa-headset',
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you with any queries or concerns.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } }
  };

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
          <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '700' }}>Our Services</h1>
          <p style={{ fontSize: '1.2rem', marginTop: '1rem', color: '#a1a1aa' }}>Comprehensive rental solutions for Punjab</p>
        </section>

        <section className="services-section" style={{ padding: '60px 0' }}>
          <div className="container">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="services-grid" 
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}
            >
              {services.map((service, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <ThreeDTilt 
                    className="glass-panel" 
                    maxTilt={8}
                    scale={1.03}
                    style={{
                      padding: '40px 30px',
                      textAlign: 'center',
                      border: '1px solid rgba(255,255,255,0.08)',
                      height: '100%',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: 'var(--primary-gradient)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 25px',
                      color: '#fff',
                      fontSize: '1.6rem',
                      boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
                    }}>
                      <i className={service.icon}></i>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '15px', color: '#fff', fontWeight: '600' }}>{service.title}</h3>
                    <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.7' }}>{service.description}</p>
                  </ThreeDTilt>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="cta-section" style={{ padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '15px', color: '#fff', fontWeight: '700' }}>Ready to Get Started?</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '30px', color: '#a1a1aa' }}>Contact us today to learn more about our services</p>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="glow-btn" style={{
                display: 'inline-block',
                padding: '14px 32px',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#fff',
                background: 'var(--primary-gradient)',
                borderRadius: '8px',
                textDecoration: 'none'
              }}>
                Contact Us
              </Link>
              <Link to="/listings" className="glow-btn" style={{
                display: 'inline-block',
                padding: '14px 32px',
                fontSize: '1rem',
                fontWeight: '600',
                color: '#fff',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                textDecoration: 'none'
              }}>
                Browse Properties
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}
