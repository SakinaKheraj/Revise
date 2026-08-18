import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const LOADING_STEPS = [
  "Opening revision workspace...",
  "Parsing uploaded documents...",
  "Distilling key architecture and concepts...",
  "Formatting exam-focused definitions...",
  "Structuring active-recall flashcards...",
  "Finalizing flashcard deck..."
];

export default function LoadingIndicator() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loader-container fade-in">
      <div className="loader-ring-wrapper">
        <div className="loader-spinner"></div>
      </div>
      
      <div className="loader-text-wrapper">
        <div className="loader-status-badge">
          <Sparkles size={10} className="spinning-icon" />
          <span>Processing Study Material</span>
        </div>
        <h3 className="loader-main-message">{LOADING_STEPS[currentStep]}</h3>
        <p className="loader-sub-message">
          Creating your exam-prep summary and study cards. This takes about 5 to 15 seconds.
        </p>
      </div>
    </div>
  );
}
