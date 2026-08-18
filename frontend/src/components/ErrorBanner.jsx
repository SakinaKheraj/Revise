import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBanner({ message, onRetry }) {
  return (
    <div className="error-banner-container fade-in">
      <div className="error-content-wrapper">
        <div className="error-icon-box">
          <AlertCircle size={24} className="error-icon" />
        </div>
        <div className="error-text-box">
          <h4 className="error-heading">Revision Processing Failed</h4>
          <p className="error-message">{message || 'An unexpected server error occurred. Please try again.'}</p>
        </div>
      </div>
      
      {onRetry && (
        <button onClick={onRetry} className="retry-btn">
          <RefreshCw size={14} className="btn-icon" />
          <span>Retry Processing</span>
        </button>
      )}
    </div>
  );
}
