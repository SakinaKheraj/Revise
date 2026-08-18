import React, { useState, useEffect } from 'react';
import { Layers, Grid, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import FlashcardItem from './FlashcardItem';

export default function FlashcardDeck({ flashcards }) {
  const [viewMode, setViewMode] = useState('study'); // 'study' (carousel) or 'grid'
  const [activeIndex, setActiveIndex] = useState(0);

  // Keyboard navigation for Study Mode
  useEffect(() => {
    if (viewMode !== 'study') return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.code === 'Space') {
        // Prevent default spacebar scrolling behavior
        e.preventDefault();
        const activeCardElement = document.querySelector('.study-active-wrapper .flashcard-item-container');
        if (activeCardElement) {
          activeCardElement.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, activeIndex, flashcards.length]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="empty-deck-alert fade-in">
        <HelpCircle size={24} className="alert-icon" />
        <div>
          <h4>No Flashcards Generated</h4>
          <p>Provide more detailed study material to successfully extract testable concepts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flashcard-deck-section fade-in">
      <div className="deck-control-header">
        <div className="deck-title-group">
          <h3 className="deck-title">Flashcard Deck</h3>
          <span className="deck-count-badge">{flashcards.length} cards</span>
        </div>
        
        {/* Toggle between Study Mode and Grid View */}
        <div className="view-mode-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'study' ? 'active' : ''}`}
            onClick={() => setViewMode('study')}
            title="Study Carousel (Keyboard shortcuts active)"
          >
            <Layers size={16} className="btn-icon" />
            <span>Study Carousel</span>
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="All Cards Grid"
          >
            <Grid size={16} className="btn-icon" />
            <span>Grid View</span>
          </button>
        </div>
      </div>

      {/* Render Carousel (Study Mode) */}
      {viewMode === 'study' ? (
        <div className="study-carousel-container">
          <div className="study-active-wrapper">
            <FlashcardItem 
              question={flashcards[activeIndex].question}
              answer={flashcards[activeIndex].answer}
              cardIndex={activeIndex + 1}
            />
          </div>
          
          <div className="carousel-nav-controls">
            <button 
              onClick={handlePrev}
              className="nav-btn prev-btn"
              title="Previous card (Left Arrow)"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="carousel-progress">
              <span className="current-index">{activeIndex + 1}</span>
              <span className="separator">/</span>
              <span className="total-count">{flashcards.length}</span>
            </div>
            
            <button 
              onClick={handleNext}
              className="nav-btn next-btn"
              title="Next card (Right Arrow or Space to flip)"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="keyboard-tip-badge">
            <span className="kbd-key">←</span>
            <span className="kbd-key">→</span> keys to navigate • <span className="kbd-key">Space</span> to flip card
          </div>
        </div>
      ) : (
        /* Render Grid View */
        <div className="flashcards-grid">
          {flashcards.map((card, idx) => (
            <FlashcardItem 
              key={idx}
              question={card.question}
              answer={card.answer}
              cardIndex={idx + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
