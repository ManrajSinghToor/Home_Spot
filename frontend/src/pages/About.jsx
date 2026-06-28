import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import ThreeDTilt from '../components/ThreeDTilt';
import { motion } from 'framer-motion';

export default function About() {
  const team = [
    { name: 'Mannat Dhiman', role: 'Lead Property Agent', initials: 'MD' },
    { name: 'Manprabhnoor Kaur', role: 'Marketing Director', initials: 'MK' },
    { name: 'Manpreet Singh', role: 'Client Relations', initials: 'MS' },
    { name: 'Manraj Singh', role: 'Lead Developer', initials: 'MR' }
  ];

  const values = [
    { icon: 'fas fa-check-circle', title: 'Verified Listings', desc: 'Every property is carefully vetted by our team to ensure quality and accuracy across Punjab.' },
    { icon: 'fas fa-user-shield', title: 'Unmatched Security', desc: 'We prioritize your safety with secure messaging, local mock database transactions, and privacy protection.' },
    { icon: 'fas fa-headset', title: '24/7 Support', desc: 'Our dedicated support team is always available to assist tenants and landlords at any hour.' }
  ];

  return (
    <PageTransition>
      <Header />
      <main style={{ background: '#09090b', minHeight: '95vh', paddingBottom: '60px', position: 'relative' }}>
        <div className="grid-bg"></div>

        {/* Hero Section */}
        <section className="page-hero" style={{
          padding: '50px 20px',
          textAlign: 'center',
          color: 'var(--light-text)',
          background: 'radial-gradient(circle at center, #1b1b2f, #09090b)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}>
          <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '700' }}>About HomeSpot</h1>
        </section>

        {/* Story Section */}
        <section style={{ padding: '60px 0' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center' }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2232&auto=format&fit=crop" 
                alt="Collaborating office team" 
                style={{ width: '100%', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }} 
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              style={{ textAlign: 'left' }}
            >
              <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', color: '#fff', fontWeight: '600' }}>Simplifying Your Rental Search in Punjab</h3>
              <p style={{ marginBottom: '15px', color: '#a1a1aa', lineHeight: '1.8' }}>
                HomeSpot was founded with a single principle: finding a rental home should be an exciting and stress-free experience. We understand the unique needs of the Punjabi community and are committed to providing the best rental properties across Ludhiana, Amritsar, Jalandhar, and Mohali.
              </p>
              <p style={{ color: '#a1a1aa', lineHeight: '1.8' }}>
                Our mission is to connect renters with their perfect homes through a transparent, user-friendly platform. We leverage technology to provide high-quality listings, interactive virtual tours, and a direct line of communication between renters and property owners, making the entire journey seamless and secure.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section style={{ padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="container">
            <h2 style={{ fontSize: '2.2rem', marginBottom: '40px', color: '#fff', textAlign: 'center', fontWeight: '700' }}>Why Choose Us?</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', textAlign: 'center' }}>
              {values.map((v, idx) => (
                <motion.div 
                  key={idx}
                  className="glass-panel"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  style={{ padding: '35px 25px', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'var(--primary-gradient)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: '#fff',
                    fontSize: '1.5rem',
                    boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)'
                  }}>
                    <i className={v.icon}></i>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', color: '#fff', fontWeight: '600' }}>{v.title}</h3>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.6' }}>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section style={{ padding: '60px 0' }}>
          <div className="container">
            <h2 style={{ fontSize: '2.2rem', marginBottom: '40px', color: '#fff', textAlign: 'center', fontWeight: '700' }}>Meet Our Team</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px' }}>
              {team.map((t, idx) => (
                <ThreeDTilt 
                  key={idx}
                  className="glass-panel"
                  maxTilt={8}
                  scale={1.03}
                  style={{ padding: '35px 20px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', cursor: 'pointer' }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1.5px solid rgba(99, 102, 241, 0.4)',
                    color: 'var(--primary-color)',
                    fontSize: '1.4rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    boxShadow: '0 0 10px rgba(99, 102, 241, 0.1)'
                  }}>
                    {t.initials}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '5px', fontWeight: '600' }}>{t.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '500', margin: 0 }}>{t.role}</p>
                </ThreeDTilt>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}
