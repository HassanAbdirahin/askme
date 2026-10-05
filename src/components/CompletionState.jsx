import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Shuffle, Sparkles, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

export default function CompletionState({
  totalExplored,
  onReset,
  onShuffle
}) {
  useEffect(() => {
    sound.playComplete();
    try {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0f172a', '#475569', '#94a3b8', '#cbd5e1']
      });
    } catch {
      // fallback
    }
  }, []);

  return (
    <div className="completion-card-wrapper">
      <div className="completion-card">
        <div className="completion-icon-wrapper">
          <CheckCircle2 size={36} className="completion-icon" />
        </div>

        <span className="completion-badge">
          <Sparkles size={13} />
          <span>Deck Finished</span>
        </span>

        <h2 className="completion-title">All Questions Answered!</h2>
        <p className="completion-subtitle">
          You've scrolled through all {totalExplored} questions in this deck. Reset anytime to start a new round.
        </p>

        <div className="completion-actions">
          <button 
            className="btn-primary" 
            onClick={() => {
              sound.playReset();
              onReset();
            }}
          >
            <RotateCcw size={16} />
            <span>Reset Deck from Start</span>
          </button>

          <button 
            className="btn-secondary" 
            onClick={() => {
              sound.playReset();
              onShuffle();
            }}
          >
            <Shuffle size={16} />
            <span>Shuffle & Start Again</span>
          </button>
        </div>
      </div>
    </div>
  );
}
