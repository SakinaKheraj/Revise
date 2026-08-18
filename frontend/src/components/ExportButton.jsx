import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://revise-backend-m1rp.onrender.com';

export default function ExportButton({ flashcards }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!flashcards || flashcards.length === 0) return;
    
    setIsExporting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/export-csv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flashcards),
      });

      if (!response.ok) {
        throw new Error('Failed to generate export file from backend.');
      }

      // Read download bytes and trigger standard browser download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = downloadUrl;
      tempLink.setAttribute('download', 'revise-flashcards.csv');
      document.body.appendChild(tempLink);
      tempLink.click();
      
      // Cleanup
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export Error:', err);
      alert(`Export Failed: ${err.message || 'Unknown error occurred.'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || !flashcards.length}
      className="export-csv-btn"
      title="Download CSV file for importing into Anki study application"
    >
      {isExporting ? (
        <Loader2 size={16} className="btn-icon spinning-icon" />
      ) : (
        <Download size={16} className="btn-icon" />
      )}
      <span>{isExporting ? 'Exporting...' : 'Export to Anki CSV'}</span>
    </button>
  );
}
