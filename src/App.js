import React, { useState, useRef, useEffect } from 'react';
import LeftSidebar from './components/sidebar/LeftSidebar';
import RightSidebar from './components/sidebar/RightSidebar';
import SearchBar from './components/searchbar/SearchBar';
import FileDrop from './components/filedrop/FileDrop';
import PDFViewer from './components/filedrop/PDFViewer';
import './App.css';

function App() {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(true);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [interactionMessage, setInteractionMessage] = useState('');
  const [fileUrl, setFileUrl] = useState(null);
  const searchBarRef = useRef(null);
  const pdfViewerRef = useRef(null);

  useEffect(() => {
    // Automatically focus on the search bar when the app loads
    if (searchBarRef.current) {
      searchBarRef.current.focus();
    }
  }, []);

  const toggleLeftSidebar = () => setIsLeftSidebarCollapsed(prev => !prev);
  const toggleRightSidebar = () => setIsRightSidebarCollapsed(prev => !prev);

  // Handle commands from the search bar
  const handleCommand = async (command) => {
    console.log("Command received:", command);
    console.log("File URL at the time of command:", fileUrl); // Check whether fileUrl is properly set at the time the search command is executed
    setInteractionMessage(command.message); // Update message in RightSidebar

    // Execute the command based on type
    if (command.type === 'goToPage') {
      // Execute go-to-page logic in PDF viewer
      console.log(`Going to page ${command.pageNumber}`);
      if (pdfViewerRef.current) {
        pdfViewerRef.current.goToPage(command.pageNumber);
      }
    } else if (command.type === 'search') {
      // Execute backend API search logic
    console.log(`Searching for "${command.term}"`);
    if (!fileUrl) {
      console.error("No PDF file loaded. Cannot perform search.");
      setInteractionMessage("No PDF file loaded. Please upload a file.");
      return;
    }

    // Log the payload being sent to the backend
    console.log("Sending to backend:", {
      pdf_path: fileUrl,
      keyword: command.term,
    });

    // Call backend API for keyword search
    try {
      console.log("Calling backend with:", { pdf_path: fileUrl, keyword: command.term });
      const response = await fetch("http://127.0.0.1:8000/keyword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdf_path: fileUrl, // Pass the loaded file URL as the PDF path
          keyword: command.term, // The keyword to search
        }),
      });

      if (!response.ok) {
        console.error("Error fetching keyword results:", response.statusText);
        setInteractionMessage(`Error searching for "${command.term}". Please try again.`);
        return;
      }

      const data = await response.json();
      console.log("Search results received from backend:", data); // Debug response
  if (!data.results) {
    console.error("Results field missing in backend response:", data);
  }

      // Check if the results are valid
    if (!data || !data.results) {
      console.error("Invalid data format received:", data);
      setInteractionMessage(`No valid results for "${command.term}".`);
      return;
    }

      setSearchResults(data.results); // Update search results in state
      setInteractionMessage(`Found ${data.results.length} results for "${command.term}"`);

      // Highlight results in the PDF viewer
      if (pdfViewerRef.current) {
        pdfViewerRef.current.searchAndHighlight(data.results);
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      setInteractionMessage(`Error connecting to backend for "${command.term}".`);
    }
  }
};

  return (
    <div className="app-container">
      <LeftSidebar isCollapsed={isLeftSidebarCollapsed} toggleSidebar={toggleLeftSidebar} >
        {/* Only render SearchBar inside LeftSidebar when expanded */}
        {!isLeftSidebarCollapsed && (
          <SearchBar
            onCommand={handleCommand}
            isLeftSidebarCollapsed={isLeftSidebarCollapsed}
            isRightSidebarCollapsed={isRightSidebarCollapsed}
            toggleLeftSidebar={toggleLeftSidebar}
          />
        )}
        </LeftSidebar>

      <main className="main-content">
        {/* Render SearchBar in main content when LeftSidebar is collapsed */}
        {isLeftSidebarCollapsed && (
          <SearchBar 
            onCommand={handleCommand}
            isLeftSidebarCollapsed={isLeftSidebarCollapsed} 
            isRightSidebarCollapsed={isRightSidebarCollapsed} 
            toggleLeftSidebar={toggleLeftSidebar}
          />
        )}
        {fileUrl ? (
          <PDFViewer ref={pdfViewerRef} fileUrl={fileUrl} />
        ) : (
          <FileDrop
          setFileUrl={(url) => {
            console.log("File URL set in App:", url); // Debugging statement
            setFileUrl(url);
          }}
          />
        )}
      </main>

      <RightSidebar 
      isCollapsed={isRightSidebarCollapsed} 
      toggleSidebar={toggleRightSidebar} 
      interactionMessage={interactionMessage}
      searchResults={searchResults}
      navigateToResult={(result) => {
        // Logic to navigate to the specific search result in PDFViewer
          console.log("Navigate to result:", result);
          if (pdfViewerRef.current) {
            pdfViewerRef.current.goToPage(result.page);
          }
      }}
      />
    </div>
  );
}

export default App;
