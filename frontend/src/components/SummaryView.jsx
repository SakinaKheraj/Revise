import React from 'react';
import { FileText } from 'lucide-react';

// Lightweight, dependency-free Markdown parser for simple lists, headings, bolding, and inline code.
function parseMarkdown(markdownText) {
  if (!markdownText) return '';
  
  const lines = markdownText.split('\n');
  const htmlParts = [];
  let inList = false;
  
  const formatInline = (text) => {
    // Escape HTML entities to prevent rendering issues
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
      
    // **bold** to strong
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // `inline code` to code
    formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
    
    return formatted;
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    
    // Handle headings
    if (trimmed.startsWith('# ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h1>${formatInline(trimmed.substring(2))}</h1>`);
      return;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h2>${formatInline(trimmed.substring(3))}</h2>`);
      return;
    }
    if (trimmed.startsWith('### ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h3>${formatInline(trimmed.substring(4))}</h3>`);
      return;
    }
    
    // Handle horizontal rules
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push('<hr className="summary-hr" />');
      return;
    }
    
    // Handle unordered lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) { htmlParts.push('<ul className="summary-list">'); inList = true; }
      htmlParts.push(`<li>${formatInline(trimmed.substring(2))}</li>`);
      return;
    }
    
    // Empty line (acts as spacing or breaks list)
    if (trimmed === '') {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      return;
    }
    
    // Normal paragraph text
    if (inList) { htmlParts.push('</ul>'); inList = false; }
    htmlParts.push(`<p className="summary-paragraph">${formatInline(trimmed)}</p>`);
  });
  
  if (inList) htmlParts.push('</ul>');
  
  return htmlParts.join('\n');
}

export default function SummaryView({ summary }) {
  const parsedHtml = parseMarkdown(summary);

  return (
    <div className="summary-view-card fade-in">
      <div className="summary-header">
        <div className="summary-icon-wrapper">
          <FileText size={20} className="summary-icon" />
        </div>
        <h3 className="summary-title">Revision Summary</h3>
      </div>
      
      <div 
        className="summary-content markdown-body" 
        dangerouslySetInnerHTML={{ __html: parsedHtml }}
      />
    </div>
  );
}
