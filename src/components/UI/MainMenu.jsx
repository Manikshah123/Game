import React from 'react';

export default function MainMenu({ onStartGame }) {
  return (
    <div className="ui-layer">
      <div className="main-menu animate-fade-in">
        <div className="title-container animate-slide-up">
          <h1 className="main-title">SHINOBI WAR</h1>
          <div className="sub-title">NARUTO VS MADARA</div>
        </div>
        
        <div className="menu-buttons animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <button className="btn primary" onClick={onStartGame}>
            Start Battle
          </button>
          <button className="btn">Training Mode</button>
          <button className="btn">Settings</button>
        </div>
      </div>
    </div>
  );
}
