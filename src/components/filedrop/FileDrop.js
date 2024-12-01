import React, { useState, useRef, useEffect } from "react";
import "./FileDrop.css";

function FileDrop({ setFileUrl }) {
  const [fileName, setFileName] = useState(""); // Track the uploaded file's name
  const fileInputRef = useRef(null);
  const fileDropRef = useRef(null); // Ref for the div

  useEffect(() => {
    if (fileDropRef.current) {
      fileDropRef.current.focus();
    }
  }, []);

  // Handle file drop event
  const handleFileDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      await handleFileUpload(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  // Handle file selection from the file input
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      await handleFileUpload(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  // Handle the file upload to the backend
  const handleFileUpload = async (file) => {
    setFileName(file.name); // Update the displayed file name
    try {
      console.log("Uploading file:", file.name);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("Failed to upload file:", response.statusText);
        alert("Failed to upload the file. Please try again.");
        return;
      }

      const data = await response.json();
      console.log("File uploaded successfully. Server path:", data.file_path);

      // Pass the file URL to the parent component
      setFileUrl(data.file_path);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading the file. Please try again.");
    }
  };

  // Handle Enter key to open the file dialog
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
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
      <p>Drag a PDF file here or press Enter to upload</p>
      {fileName && <p>Uploaded file: {fileName}</p>} {/* Display uploaded file name */}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileSelect}
        accept="application/pdf"
      />
    </div>
  );
}

export default FileDrop;
