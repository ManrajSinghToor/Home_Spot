import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTransition from '../components/PageTransition';

const BLOG_POSTS = [
  {
    id: 1,
    title: 'Renting in Punjab: The Legal Checklist',
    category: 'Legal Rights',
    date: 'June 25, 2026',
    author: 'Mannat Dhiman',
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=2070&auto=format&fit=crop',
    excerpt: 'Avoid disputes! Here is the complete legal checklist for signing a tenancy agreement in Ludhiana and Mohali.',
    content: `Renting a home in Punjab is a major milestone, but it requires careful legal review. Punjab tenancy regulations mandate a signed agreement registered with the local authority. 

Here is what you MUST check:
1. **Security Deposit Cap:** Deposits are normally equivalent to two months of rent. Beware of landlords asking for excessive advances.
2. **Police Verification:** In Punjab, registering tenant identity (Police Verification Form) is mandatory for safety. Ensure your landlord initiates this.
3. **Maintenance Allocation:** Make sure the agreement specifies who pays for major structural repairs (landlord) vs. daily upkeep (tenant).
4. **Notice Period:** The standard notice period is 1 to 2 months. Make sure this is clearly defined to avoid losing security deposits.`
  },
  {
    id: 2,
    title: 'Ludhiana vs. Mohali: Rent & Life Quality',
    category: 'City Guides',
    date: 'June 18, 2026',
    author: 'Manpreet Singh',
    image: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2070&auto=format&fit=crop',
    excerpt: 'Comparing Punjab\'s two heavyweights. Which city fits your budget, family needs, and career goals?',
    content: `Deciding where to settle down in Punjab? Let\'s compare the two primary economic powerhouses:

**Mohali (IT Hub & Planned Layouts):**
- **Pros:** Planned city sectors, high green index, excellent proximity to Chandigarh, growing tech parks.
- **Rent Estimate:** ₹25,000 for a standard 2BHK.
- **Vibe:** Modern, professional, fast-paced.

**Ludhiana (Industrial Wealth & Culture):**
- **Pros:** Core commercial center, rich culinary scene, lower cost of living, established community structures.
- **Rent Estimate:** ₹18,000 for a standard 2BHK.
- **Vibe:** Busy, heritage-focused, mercantile.`
  },
  {
    id: 3,
    title: 'Decor Tips for Modern Glass Apartments',
    category: 'Interior Design',
    date: 'June 12, 2026',
    author: 'Manprabhnoor Kaur',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop',
    excerpt: 'How to utilize glass partition walls, LED strips, and mirrors to create a modern, futuristic studio.',
    content: `Modern rental homes are increasingly using open glass structures and minimalist partitions. Here is how to style your space:

1. **Ambient Backlighting:** Place smart LED strips behind TVs, headboards, and under cabinetry to give a floating 3D effect.
2. **Strategic Mirrors:** Mount floor-length mirrors opposite windows to double the natural light.
3. **Glass Divisions:** Use sliding glass partitions instead of wooden doors to keep the apartment looking open, wide, and futuristic.`
  }
];

export default function Blog() {
  const [selectedPost, setSelectedPost] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <PageTransition>
      <Header />
      <main style={{ background: '#09090b', minHeight: '95vh', padding: '60px 0', position: 'relative' }}>
        <div className="grid-bg"></div>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: '50px' }}
          >
            <h1 className="neon-text" style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '15px' }}>Renting Guides & Articles</h1>
            <p style={{ color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>
              Expert advice on rental policies, neighborhood ratings, and interior styling tips in Punjab.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '30px'
            }}
          >
            {BLOG_POSTS.map((post) => (
              <motion.div
                key={post.id}
                variants={cardVariants}
                className="glass-panel"
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                style={{
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={() => setSelectedPost(post)}
              >
                <img src={post.image} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div style={{ padding: '25px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: '600', marginBottom: '10px' }}>
                    <span>{post.category}</span>
                    <span style={{ color: '#71717a' }}>{post.date}</span>
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '600', marginBottom: '10px', lineHeight: '1.4' }}>{post.title}</h3>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem', lineHeight: '1.6', flexGrow: 1, marginBottom: '20px' }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: '#fff', fontSize: '0.8rem', fontWeight: '600', justifyContent: 'center' }}>
                      {post.author.charAt(0)}
                    </div>
                    <span style={{ color: '#e4e4e7', fontSize: '0.85rem' }}>{post.author}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Detailed Read Modal overlay */}
          <AnimatePresence>
            {selectedPost && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedPost(null)}
                  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(9, 9, 11, 0.85)', backdropFilter: 'blur(8px)' }}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  className="glass-panel"
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '680px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '0',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    background: '#0e0e11'
                  }}
                >
                  <button
                    onClick={() => setSelectedPost(null)}
                    style={{ position: 'absolute', top: '20px', right: '20px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', zIndex: 10 }}
                  >
                    <i className="fas fa-times"></i>
                  </button>

                  <img src={selectedPost.image} alt={selectedPost.title} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />

                  <div style={{ padding: '35px' }}>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(99,102,241,0.15)', color: 'var(--primary-color)', padding: '5px 12px', borderRadius: '30px', fontWeight: '600' }}>
                      {selectedPost.category}
                    </span>
                    <h2 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: '700', marginTop: '15px', marginBottom: '8px' }}>{selectedPost.title}</h2>
                    <div style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '25px' }}>
                      By {selectedPost.author} &bull; {selectedPost.date}
                    </div>

                    <div style={{ color: '#e4e4e7', lineHeight: '1.8', whiteSpace: 'pre-line', fontSize: '1rem' }}>
                      {selectedPost.content}
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
}
