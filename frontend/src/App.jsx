import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import InfoBar from './components/InfoBar';
import FeaturedListings from './components/FeaturedListings';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import PageTransition from './components/PageTransition';

export default function App() {
  return (
    <ErrorBoundary>
      <Header />
      <PageTransition>
        <main style={{ position: 'relative', overflow: 'hidden' }}>
          <Hero />
          <InfoBar />
          <FeaturedListings />
        </main>
      </PageTransition>
      <Footer />
    </ErrorBoundary>
  );
}
