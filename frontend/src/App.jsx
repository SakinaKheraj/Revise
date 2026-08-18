import React, { useState, useEffect } from 'react';
import { Layers, AlertTriangle, Sun, Moon } from 'lucide-react';
import InputPanel from './components/InputPanel';
import LoadingIndicator from './components/LoadingIndicator';
import SummaryView from './components/SummaryView';
import FlashcardDeck from './components/FlashcardDeck';
import ExportButton from './components/ExportButton';
import ErrorBanner from './components/ErrorBanner';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://revise-zu2s.onrender.com';

export default function App() {
  const [status, setStatus] = useState('idle'); // idle | loading | results | error
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  
  // Theme state: dark by default, falls back to system preference
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSubmit = async (isFileUpload) => {
    if (isFileUpload && !file) {
      setError('Please choose a file to parse first.');
      return;
    }
    if (!isFileUpload && !text.trim()) {
      setError('Please type or paste some notes first.');
      return;
    }

    setStatus('loading');
    setError('');
    setResult(null);

    try {
      let response;
      
      if (isFileUpload) {
        const formData = new FormData();
        formData.append('file', file);

        response = await fetch(`${API_BASE_URL}/api/process`, {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });
      }

      if (!response.ok) {
        let errorMsg = 'An unexpected error occurred.';
        try {
          const errData = await response.json();
          errorMsg = errData.detail || errorMsg;
        } catch {
          errorMsg = `Server returned status ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      setResult(data);
      setStatus('results');
    } catch (err) {
      console.error('Submission Error:', err);
      if (err.message.includes('Failed to fetch')) {
        setError('Cannot connect to the revision backend. Please ensure the backend server is running and accessible.');
      } else {
        setError(err.message || 'Failed to process study material.');
      }
      setStatus('error');
    }
  };

  const handleStartOver = () => {
    setText('');
    setFile(null);
    setResult(null);
    setError('');
    setStatus('idle');
  };

  return (
    <div className="app-container">
      {/* Top Navbar Area */}
      <nav className="app-navbar">
        <div className="logo-container">
          <div className="logo-badge">
            <Layers size={16} color="var(--logo-color)" />
          </div>
          <span className="logo-text">revise</span>
        </div>
        
        {/* Sleek Theme Switcher */}
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </nav>

      {/* App Header */}
      <header className="app-header">
        <h1 className="header-title">Distill Study Notes Instantly</h1>
        <p className="header-subtitle">
          Transform raw lectures, dense code manuals, or technical pdfs into clean structured summaries and active-recall flashcard decks.
        </p>
      </header>

      {/* Main Workflow Area */}
      <main className="main-content">
        {status === 'idle' && (
          <InputPanel
            text={text}
            setText={setText}
            file={file}
            setFile={setFile}
            onSubmit={handleSubmit}
            loading={false}
          />
        )}

        {status === 'loading' && <LoadingIndicator />}

        {status === 'error' && (
          <div>
            <ErrorBanner message={error} onRetry={handleSubmit} />
            <div className="action-row" style={{ marginTop: '20px', justifyContent: 'center' }}>
              <button onClick={handleStartOver} className="restart-btn">
                Start Over
              </button>
            </div>
          </div>
        )}

        {status === 'results' && result && (
          <div className="results-container">
            {/* Top Navigation Row */}
            <div className="results-navigation-header">
              <div>
                {result.truncated && (
                  <div className="truncation-warning">
                    <AlertTriangle size={14} style={{ marginRight: '6px', flexShrink: 0 }} />
                    <span>Input exceeded 15,000 characters and was truncated.</span>
                  </div>
                )}
              </div>
              
              <div className="results-actions-right">
                <button onClick={handleStartOver} className="restart-btn">
                  Start Over
                </button>
                <ExportButton flashcards={result.flashcards} />
              </div>
            </div>

            {/* Split Results Panels */}
            <div className="results-grid-split">
              {/* Left Column: Markdown Summary */}
              <SummaryView summary={result.summary} />

              {/* Right Column: Interactive Flashcard Deck */}
              <FlashcardDeck flashcards={result.flashcards} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
