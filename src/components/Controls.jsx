import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Shuffle 
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function Controls({
  onNext,
  onPrevious,
  canPrevious,
  onReset,
  onShuffle,
  disabled
}) {
  const handleAction = (callback, sfx = 'click') => {
    if (disabled) return;
    if (sfx === 'swipe') sound.playCardSwipe('right');
    else if (sfx === 'reset') sound.playReset();
    else sound.playClick();
    callback();
  };

  return (
    <div className="floating-controls-dock" role="region" aria-label="Deck controls">
      {/* Previous / Undo */}
      <button
        className="control-btn control-secondary"
        onClick={() => handleAction(onPrevious, 'swipe')}
        disabled={!canPrevious || disabled}
        title="Previous question (← or Z)"
        aria-label="Previous question"
      >
        <ArrowLeft size={20} strokeWidth={2.5} />
        <span className="control-tooltip">Previous</span>
      </button>

      {/* Reset Deck */}
      <button
        className="control-btn control-reset"
        onClick={() => handleAction(onReset, 'reset')}
        disabled={disabled}
        title="Reset to beginning"
        aria-label="Reset deck"
      >
        <RotateCcw size={19} strokeWidth={2.2} />
        <span className="control-tooltip">Reset Deck</span>
      </button>

      {/* Shuffle Deck */}
      <button
        className="control-btn control-secondary"
        onClick={() => handleAction(onShuffle, 'click')}
        disabled={disabled}
        title="Shuffle questions"
        aria-label="Shuffle questions"
      >
        <Shuffle size={18} strokeWidth={2.2} />
        <span className="control-tooltip">Shuffle</span>
      </button>

      {/* Next Question (Primary large button) */}
      <button
        className="control-btn control-next-primary"
        onClick={() => handleAction(onNext, 'swipe')}
        disabled={disabled}
        title="Next question (Click card or →)"
        aria-label="Next question"
      >
        <ArrowRight size={24} strokeWidth={2.5} />
        <span className="control-tooltip">Next Question</span>
      </button>
    </div>
  );
}
