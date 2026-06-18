import React from 'react';

export default function LoadingScreen({ progress }) {
  return (
    <div className="loading-screen animate-fade-in">
      <div className="loader"></div>
      <h2 className="cinematic-text" style={{ color: 'var(--primary-color)', textShadow: 'var(--glow-orange)' }}>
        LOADING ASSETS...
      </h2>
      <div className="bar-container" style={{ width: '300px', marginTop: '1rem', height: '10px' }}>
        <div className="health-bar" style={{ width: `${progress}%`, background: 'white', boxShadow: '0 0 10px white' }}></div>
      </div>
      <div style={{ marginTop: '0.5rem', color: '#888', fontSize: '0.9rem' }}>{Math.round(progress)}%</div>
    </div>
  );
}
