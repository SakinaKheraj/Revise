import React, { useRef, useState } from 'react';
import { Upload, FileText, X, Sparkles, FileCode } from 'lucide-react';

export default function InputPanel({
  text,
  setText,
  file,
  setFile,
  onSubmit,
  loading
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle textarea text change
  const handleTextChange = (e) => {
    setText(e.target.value);
    // Mutually exclusive: typing text clears the uploaded file
    if (file) {
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processSelectedFile(selectedFile);
  };

  // Process file (verify type and set)
  const processSelectedFile = (selectedFile) => {
    if (!selectedFile) return;

    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (extension !== 'pdf' && extension !== 'txt') {
      alert('Only .pdf and .txt files are supported.');
      return;
    }

    setFile(selectedFile);
    // Mutually exclusive: uploading a file clears pasted text
    setText('');
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    processSelectedFile(droppedFile);
  };

  // Clear selected file
  const handleClearFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasInput = text.trim().length > 0 || file !== null;

  return (
    <div className="input-panel-container fade-in">
      <div className="panel-header">
        <h2 className="panel-title">Step 1: Input Your Study Material</h2>
        <p className="panel-subtitle">Paste your notes directly or upload a study file (.pdf, .txt)</p>
      </div>

      <div className="input-split">
        {/* Textarea Panel */}
        <div className="text-input-area">
          <label htmlFor="notes-textarea" className="input-label">Paste Notes</label>
          <textarea
            id="notes-textarea"
            className="notes-textarea"
            placeholder="Paste your raw, dense study notes, articles, or revision guidelines here..."
            value={text}
            onChange={handleTextChange}
            disabled={loading}
          />
          {text && (
            <div className="char-counter">
              {text.length.toLocaleString()} / 15,000 characters
              {text.length > 15000 && <span className="warning-text"> (will be truncated)</span>}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="input-divider">
          <span className="divider-text">OR</span>
        </div>

        {/* Drag & Drop Area */}
        <div className="file-input-area">
          <label className="input-label">Upload Document</label>
          <div
            className={`drag-drop-zone ${isDragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !loading && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.txt"
              style={{ display: 'none' }}
              disabled={loading}
            />

            {file ? (
              <div className="selected-file-details">
                <div className="file-icon-wrapper">
                  {file.name.endsWith('.pdf') ? (
                    <FileCode size={36} className="file-icon pdf" />
                  ) : (
                    <FileText size={36} className="file-icon txt" />
                  )}
                </div>
                <div className="file-meta">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
                <button
                  type="button"
                  className="clear-file-btn"
                  onClick={handleClearFile}
                  title="Clear file"
                  disabled={loading}
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="drag-drop-content">
                <div className="upload-icon-wrapper">
                  <Upload size={32} className="upload-icon" />
                </div>
                <span className="upload-prompt-primary">Drag & drop your study file here</span>
                <span className="upload-prompt-secondary">Supports PDF or plain TXT</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="action-row">
        <button
          onClick={onSubmit}
          disabled={!hasInput || loading}
          className="submit-btn"
        >
          <Sparkles size={18} className="btn-icon" />
          <span>{loading ? 'Distilling Material...' : 'Distill Notes to Flashcards'}</span>
        </button>
      </div>
    </div>
  );
}
