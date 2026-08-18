import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle } from 'lucide-react';

export default function FlashcardItem({ question, answer, cardIndex }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip status when card data changes
  useEffect(() => {
    setIsFlipped(false);
  }, [question, answer]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div 
      className={`flashcard-item-container ${isFlipped ? 'flipped' : ''}`}
      onClick={handleFlip}
    >
      <div className="flashcard-inner">
        {/* Front Face: Question */}
        <div className="flashcard-face flashcard-front">
          <div className="flashcard-badge question-badge">
            <HelpCircle size={14} className="badge-icon" />
            <span>Card #{cardIndex} — Question</span>
          </div>
          
          <div className="flashcard-body-text">
            {question}
          </div>
          
          <div className="flashcard-footer-tip">
            Click card to reveal answer
          </div>
        </div>

        {/* Back Face: Answer */}
        <div className="flashcard-face flashcard-back">
          <div className="flashcard-badge answer-badge">
            <CheckCircle size={14} className="badge-icon" />
            <span>Card #{cardIndex} — Answer</span>
          </div>
          
          <div className="flashcard-body-text">
            {answer}
          </div>
          
          <div className="flashcard-footer-tip">
            Click card to see question
          </div>
        </div>
      </div>
    </div>
  );
}
