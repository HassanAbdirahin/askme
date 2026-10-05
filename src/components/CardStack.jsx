import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../utils/audio';

const SWIPE_THRESHOLD = 90;

export default function CardStack({
  cards,
  currentIndex,
  onSwipe,
  animatingDirection
}) {
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const startPos = useRef({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const activeCard = cards[currentIndex];

  // Reset drag offset when active card changes
  useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
    setIsDragging(false);
  }, [currentIndex, activeCard]);

  // Pointer drag handlers for mouse & touch
  const handlePointerDown = (e) => {
    if (e.target.closest('button')) return;
    if (e.button !== undefined && e.button !== 0) return;

    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };

    if (e.currentTarget && e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Fallback
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startPos.current.x;
    const dy = e.clientY - startPos.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (e.currentTarget && e.currentTarget.releasePointerCapture) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Fallback
      }
    }

    const { x, y } = dragOffset;
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    // If dragged beyond threshold, trigger swipe in that direction
    if (absX > SWIPE_THRESHOLD) {
      const direction = x > 0 ? 'right' : 'left';
      onSwipe(direction);
    } else if (absX < 8 && absY < 8) {
      // Direct click / tap on the card: click animation to advance to next card!
      onSwipe('right');
    } else {
      // Snap back smoothly
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
  };

  if (!activeCard) {
    return null;
  }

  // Calculate live drag visual styling for top card
  const dragRotation = dragOffset.x * 0.08;
  const isInteracting = isDragging && (Math.abs(dragOffset.x) > 6 || Math.abs(dragOffset.y) > 6);

  // Intent stamp opacities
  const rightOpacity = Math.max(0, Math.min(dragOffset.x / SWIPE_THRESHOLD, 1));
  const leftOpacity = Math.max(0, Math.min(-dragOffset.x / SWIPE_THRESHOLD, 1));

  // Determine animation classes
  let animationClass = '';
  if (animatingDirection === 'right') animationClass = 'animate-swipe-right';
  if (animatingDirection === 'left') animationClass = 'animate-swipe-left';
  if (animatingDirection === 'undo') animationClass = 'animate-swipe-undo';

  return (
    <div className="card-stack-wrapper">
      <div className="card-stack-stage">
        {/* Render visible background cards (3 layered behind for real physical stack illusion) */}
        {cards.slice(currentIndex + 1, currentIndex + 4).map((card, i) => {
          const depthIndex = i + 1; // 1, 2, 3
          const scale = 1 - depthIndex * 0.045;
          const translateY = depthIndex * 15;
          const rotate = depthIndex % 2 === 1 ? -depthIndex * 1 : depthIndex * 1;
          const opacity = Math.max(0.25, 1 - depthIndex * 0.28);

          return (
            <div
              key={card.id}
              className="stacked-card background-card"
              style={{
                transform: `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`,
                opacity,
                zIndex: 10 - depthIndex
              }}
            >
              <div className="card-content-minimal">
                <div className="card-top-bar">
                  <span className="category-pill-badge">{card.category}</span>
                </div>
                <div className="card-body-bold">
                  <p className="card-question-bold preview-faded">{card.question}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Active Front Card */}
        <div
          ref={cardRef}
          className={`stacked-card active-card ${animationClass}`}
          style={{
            transform: !animatingDirection
              ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragRotation}deg)`
              : undefined,
            transition: isDragging ? 'none' : 'transform 0.38s cubic-bezier(0.18, 0.89, 0.32, 1.15), box-shadow 0.25s ease',
            cursor: isDragging ? 'grabbing' : 'grab',
            zIndex: 20
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          {/* Subtle live drag swipe indicators */}
          {isInteracting && (
            <>
              <div 
                className="swipe-indicator indicator-right"
                style={{ opacity: rightOpacity }}
              >
                <span>NEXT →</span>
              </div>
              <div 
                className="swipe-indicator indicator-left"
                style={{ opacity: leftOpacity }}
              >
                <span>← SKIP</span>
              </div>
            </>
          )}

          {/* Minimalist Bold Card Content */}
          <div className="card-content-minimal">
            <div className="card-top-bar">
              <span className="category-pill-badge">{activeCard.category}</span>
              <span className="card-number-tag">
                #{activeCard.id} • {currentIndex + 1}/{cards.length}
              </span>
            </div>

            <div className="card-body-bold">
              <h2 className="card-question-bold">
                {activeCard.question}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
