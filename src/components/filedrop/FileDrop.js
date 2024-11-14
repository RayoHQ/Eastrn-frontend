import React, { useState, useRef, useEffect } from 'react';
import PDFViewer from './PDFViewer';
import './FileDrop.css';

function FileDrop({ isSearchFocused }) {
    const [fileUrl, setFileUrl] = useState(null);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);
    const fileDropRef = useRef(null); // Ref for the div

    useEffect(() => {
        // Set focus on FileDrop only if search bar is not focused
        if (!isSearchFocused && fileDropRef.current) {
            fileDropRef.current.focus();
        }
    }, [isSearchFocused]);

  // Handle file drop event
  const handleFileDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      const url = URL.createObjectURL(file); // Create a URL for the PDF
      setFileUrl(url); // Set the file URL to display the PDF
    } else {
      alert('Please upload a PDF file.');
    }
  };

  // Handle file selection from input
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      const url = URL.createObjectURL(file); // Create a URL for the PDF
      setFileUrl(url); // Set the file URL to display the PDF
    } else {
      alert('Please upload a PDF file.');
    }
  };

  // Handle Enter key to open file dialog
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !isSearchFocused) {
      fileInputRef.current.click();
    }
  };

  return (
    <div
      className="file-drop"
      onDrop={handleFileDrop}
      onDragOver={(e) => e.preventDefault()}
      onKeyDown={handleKeyDown} // Updated to onKeyDown
      ref={fileDropRef} // Attach the ref to the div
      tabIndex="0" // Make the div focusable to listen for key events
    >
      <p>Drag file or press enter</p>
      {fileName && <p>Uploaded file: {fileName}</p>}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        accept="application/pdf"
      />

      {/* Display the PDFViewer if a PDF file has been uploaded */}
      {fileUrl && <PDFViewer fileUrl={fileUrl} />}
    </div>
  );
}

export default FileDrop;
