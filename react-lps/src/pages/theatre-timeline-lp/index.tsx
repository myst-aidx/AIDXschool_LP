import React from 'react';

// Theatre.js timeline LP is temporarily disabled due to build issues
// The original file has been renamed to index.tsx.bak

export default function TheatreTimelineLandingPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      color: 'white',
      fontFamily: 'sans-serif',
      padding: '2rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Theatre Timeline LP</h1>
        <p style={{ fontSize: '1.5rem', opacity: 0.8 }}>
          This page is temporarily disabled due to Theatre.js configuration issues.
        </p>
        <p style={{ marginTop: '2rem' }}>
          Please check back later or contact support.
        </p>
      </div>
    </div>
  );
}