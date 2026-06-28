import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I search for rental properties?",
      answer: "You can search for properties using our advanced search filters. Simply enter your preferred location, budget range, property type, and other preferences. Our system will show you the most relevant matches."
    },
    {
      question: "What areas in Punjab do you cover?",
      answer: "We cover all major cities in Punjab including Ludhiana, Amritsar, Jalandhar, Mohali, Patiala, Bathinda, and many more. Our network extends across the entire state."
    },
    {
      question: "How much does it cost to use HomeSpot?",
      answer: "HomeSpot is completely free for tenants to search and browse properties. We only charge a small commission to property owners when a successful rental agreement is signed."
    },
    {
      question: "Can I schedule property visits?",
      answer: "Yes! Once you find a property you're interested in, you can contact the property owner directly through our platform to schedule a visit at a convenient time."
    },
    {
      question: "What documents do I need for renting?",
      answer: "Typically, you'll need identity proof (Aadhaar card, PAN card), address proof, employment letter, salary slips, and bank statements. The exact requirements may vary by property owner."
    },
    {
      question: "How do I contact property owners?",
      answer: "You can contact property owners directly through our messaging system. Simply click on the 'Contact Owner' button on any property listing to start a conversation."
    },
    {
      question: "Is my personal information secure?",
      answer: "Absolutely! We take data security very seriously. All your personal information is encrypted and stored securely. We never share your details with third parties without your consent."
    },
    {
      question: "Can I save properties for later viewing?",
      answer: "Yes! You can add properties to your favorites list by clicking the star icon. This allows you to easily access them later and compare different options."
    },
    {
      question: "What if I have issues with my rental agreement?",
      answer: "We provide legal support and guidance for rental agreements. Our team can help you understand your rights and responsibilities, and assist with dispute resolution if needed."
    },
    {
      question: "How do I list my property on HomeSpot?",
      answer: "Property owners can easily list their properties by creating an account and filling out our property listing form. We'll help you create an attractive listing with photos and detailed information."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
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
          <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '700' }}>Frequently Asked Questions</h1>
          <p style={{ fontSize: '1.2rem', marginTop: '1rem', color: '#a1a1aa' }}>Find answers to common questions about our services</p>
        </section>

        <section className="faq-section" style={{ padding: '60px 0' }}>
          <div className="container">
            <div className="faq-container" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="glass-panel" 
                  style={{
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '10px'
                  }}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    style={{
                      width: '100%',
                      padding: '22px 30px',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '1.05rem',
                      fontWeight: '600',
                      color: '#fff',
                      transition: 'background 0.3s ease'
                    }}
                  >
                    <span>{faq.question}</span>
                    <motion.i 
                      className="fas fa-chevron-down" 
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      style={{ color: 'var(--primary-color)', fontSize: '0.9rem' }}
                    />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                      >
                        <div style={{
                          padding: '0 30px 22px',
                          color: '#a1a1aa',
                          lineHeight: '1.7',
                          fontSize: '0.95rem',
                          borderTop: '1px solid rgba(255,255,255,0.06)'
                        }}>
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-cta" style={{ padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '15px', color: '#fff', fontWeight: '700' }}>Still have questions?</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '25px', color: '#a1a1aa' }}>Our support team is here to help you 24/7</p>
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
              Contact Support
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </PageTransition>
  );
}
