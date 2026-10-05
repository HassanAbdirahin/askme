import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import CardStack from './components/CardStack';
import Controls from './components/Controls';
import CompletionState from './components/CompletionState';
import { INITIAL_QUESTIONS } from './data/questions';
import { sound } from './utils/audio';
import './App.css';

const LOCAL_STORAGE_QUESTIONS_KEY = 'askme_custom_questions_v140';
const LOCAL_STORAGE_SOUND_KEY = 'askme_sound_pref_v2';

export default function App() {
  // Questions list (140 questions across 8 categories)
  const [questions, setQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_QUESTIONS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_QUESTIONS;
  });

  // Selected Category
  const [activeCategory, setActiveCategory] = useState('All');

  // Filtered deck according to category
  const deck = useMemo(() => {
    if (activeCategory === 'All') return questions;
    return questions.filter((q) => q.category === activeCategory);
  }, [questions, activeCategory]);

  // Current Card Pointer
  const [currentIndex, setCurrentIndex] = useState(0);

  // Undo History
  const [history, setHistory] = useState([]);

  // Animation state ('left' | 'right' | 'undo' | null)
  const [animatingDirection, setAnimatingDirection] = useState(null);

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const s = localStorage.getItem(LOCAL_STORAGE_SOUND_KEY);
      return s !== null ? JSON.parse(s) : true;
    } catch {
      return true;
    }
  });

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message) => {
    setToast(message);
    const timer = setTimeout(() => {
      setToast(null);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Sync questions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_QUESTIONS_KEY, JSON.stringify(questions));
    } catch {
      // ignore
    }
  }, [questions]);

  // Sync sound setting
  useEffect(() => {
    sound.enabled = soundEnabled;
    try {
      localStorage.setItem(LOCAL_STORAGE_SOUND_KEY, JSON.stringify(soundEnabled));
    } catch {
      // ignore
    }
  }, [soundEnabled]);

  // Reset card index when category changes
  const handleSelectCategory = (cat) => {
    sound.playClick();
    setActiveCategory(cat);
    setCurrentIndex(0);
    setHistory([]);
  };

  // Swipe Action (Next / Skip) with realistic SFX
  const handleSwipe = useCallback((direction = 'right') => {
    if (animatingDirection || currentIndex >= deck.length) return;

    sound.playCardSwipe(direction);
    setAnimatingDirection(direction);

    setTimeout(() => {
      setHistory((prev) => [...prev, currentIndex]);
      setCurrentIndex((prev) => prev + 1);
      setAnimatingDirection(null);
    }, 280);
  }, [animatingDirection, currentIndex, deck.length]);

  // Previous Card (Undo)
  const handlePrevious = useCallback(() => {
    if (history.length === 0 || animatingDirection) return;

    sound.playCardSwipe('left');
    const lastIndex = history[history.length - 1];
    setAnimatingDirection('undo');

    setTimeout(() => {
      setHistory((prev) => prev.slice(0, -1));
      setCurrentIndex(lastIndex);
      setAnimatingDirection(null);
    }, 280);
  }, [history, animatingDirection]);

  // Reset Deck to the first question
  const handleReset = useCallback(() => {
    sound.playReset();
    setCurrentIndex(0);
    setHistory([]);
    setAnimatingDirection(null);
    showToast('Deck reset to beginning');
  }, [showToast]);

  // Shuffle Deck
  const handleShuffle = () => {
    sound.playCardSwipe('right');
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setQuestions(shuffled);
    setCurrentIndex(0);
    setHistory([]);
    showToast('Deck shuffled');
  };

  // Keyboard Shortcuts: ArrowRight / Space to Next, ArrowLeft to Previous, R to Reset
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleSwipe('right');
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipe, handlePrevious, handleReset]);

  const isCompleted = currentIndex >= deck.length && deck.length > 0;

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification" role="status">
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        currentIndex={currentIndex}
        totalCards={deck.length}
        onReset={handleReset}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
      />

      {/* Main Deck Canvas */}
      <main className="main-content">
        {!isCompleted ? (
          <CardStack
            cards={deck}
            currentIndex={currentIndex}
            onSwipe={handleSwipe}
            animatingDirection={animatingDirection}
          />
        ) : (
          <CompletionState
            totalExplored={deck.length}
            onReset={handleReset}
            onShuffle={handleShuffle}
          />
        )}
      </main>

      {/* Floating Controls Dock */}
      {!isCompleted && (
        <Controls
          onNext={() => handleSwipe('right')}
          onPrevious={handlePrevious}
          canPrevious={history.length > 0}
          onReset={handleReset}
          onShuffle={handleShuffle}
          disabled={animatingDirection !== null}
        />
      )}
    </div>
  );
}
