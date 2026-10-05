import React from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Volume2, 
  VolumeX
} from 'lucide-react';
import { CATEGORIES } from '../data/questions';
import { sound } from '../utils/audio';

export default function Header({
  activeCategory,
  onSelectCategory,
  currentIndex,
  totalCards,
  onReset,
  soundEnabled,
  onToggleSound
}) {
  const handleReset = () => {
    sound.playReset();
    onReset();
  };

  const currentNum = totalCards > 0 ? Math.min(currentIndex + 1, totalCards) : 0;

  return (
    <header className="app-header">
      <div className="header-top">
        {/* Brand Logo: Clean "askME" */}
        <div className="brand-group" onClick={handleReset} title="Reset to start">
          <h1 className="brand-title">askME</h1>
        </div>

        <div className="header-actions">
          {/* Card Counter - Optimized for Mobile & Desktop */}
          <div className="deck-counter-badge" title="Deck progress">
            <span className="counter-dot" />
            <div className="counter-numbers">
              <span className="counter-current">{currentNum}</span>
              <span className="counter-slash">/</span>
              <span className="counter-total">{totalCards}</span>
            </div>
          </div>

          {/* Reset Deck Header Button */}
          <button 
            className="header-action-pill-btn"
            onClick={handleReset}
            title="Reset stack to first card"
          >
            <RotateCcw size={14} />
            <span className="btn-label-desktop">Reset</span>
          </button>

          {/* Sound Toggle */}
          <button 
            className="icon-btn" 
            onClick={onToggleSound} 
            title={soundEnabled ? "Mute audio" : "Unmute audio"}
            aria-label="Toggle audio effects"
          >
            {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <nav className="category-nav" aria-label="Deck categories">
        <div className="category-scroll-container">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                className={`category-pill ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat)}
              >
                {cat === 'All' && <Sparkles size={13} className="pill-icon" />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
