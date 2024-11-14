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

  const handleSearchResults = ({ term, results }) => {
    console.log(`Updating interaction message: Found ${results.length} results for "${term}"`); // Debugging line
    setInteractionMessage(`Found ${results.length} results for "${term}"`);
    setSearchResults(results);
  };

  useEffect(() => {
    // Automatically focus on the search bar when the app loads
    if (searchBarRef.current) {
      searchBarRef.current.focus();
    }
  }, []);

  const toggleLeftSidebar = () => setIsLeftSidebarCollapsed(prev => !prev);
  const toggleRightSidebar = () => setIsRightSidebarCollapsed(prev => !prev);

  // Handle commands from the search bar
  const handleCommand = (command) => {
    console.log("Command received:", command); // Debug: Check if this runs twice
    setInteractionMessage(command.message); // Update message in RightSidebar

    // Execute the command based on type
    if (command.type === 'goToPage') {
      // Execute go-to-page logic in PDF viewer
      console.log(`Going to page ${command.pageNumber}`);
      if (pdfViewerRef.current) {
        pdfViewerRef.current.goToPage(command.pageNumber);
      }
    } else if (command.type === 'search') {
      // Execute search logic in PDF viewer
      console.log(`Searching for "${command.term}"`);
      if (pdfViewerRef.current) {
        pdfViewerRef.current.searchAndHighlight(command.term);
      } else {
        console.error("pdfViewerRef is null. Cannot call searchAndHighlight.");
      }
    }
  };

  return (
    <div className="app-container">
      <LeftSidebar isCollapsed={isLeftSidebarCollapsed} toggleSidebar={toggleLeftSidebar} >
        {/* Only render SearchBar inside LeftSidebar when expanded */}
        {!isLeftSidebarCollapsed && (
          <SearchBar
            ref={searchBarRef}
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
            ref={searchBarRef}
            onCommand={handleCommand}
            isLeftSidebarCollapsed={isLeftSidebarCollapsed} 
            isRightSidebarCollapsed={isRightSidebarCollapsed} 
            toggleLeftSidebar={toggleLeftSidebar}
          />
        )}
        {fileUrl ? (
          <PDFViewer
            ref={pdfViewerRef} // Attach pdfViewerRef to PDFViewer
            fileUrl={fileUrl}
          />
        ) : (
          <FileDrop setFileUrl={setFileUrl} />
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
      }}
      />
    </div>
  );
}

export default App;
