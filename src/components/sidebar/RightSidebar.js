import React, { useState, useEffect } from 'react';
import ResizableDivider from './ResizableDivider';
import './Sidebar.css';

function RightSidebar({ isCollapsed, toggleSidebar, interactionMessage, searchResults, navigateToResult }) {
    const [width, setWidth] = useState(300); // Default width
    const [ellipsis, setEllipsis] = useState('');
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
  
    useEffect(() => {
        const interval = setInterval(() => setEllipsis((prev) => (prev.length < 3 ? prev + '.' : '')), 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setCurrentResultIndex(0); // Reset navigation index on new search
      }, [searchResults]);

  const handleResize = (movementX) => {
    if (!isCollapsed) setWidth((prevWidth) => Math.min(500, Math.max(150, prevWidth - movementX)));
  };

  const goToNextResult = () => {
    if (currentResultIndex < searchResults.length - 1) {
      const newIndex = currentResultIndex + 1;
      setCurrentResultIndex(newIndex);
      navigateToResult(searchResults[newIndex]);
    }
  };

  const goToPreviousResult = () => {
    if (currentResultIndex > 0) {
      const newIndex = currentResultIndex - 1;
      setCurrentResultIndex(newIndex);
      navigateToResult(searchResults[newIndex]);
    }
  };

  // Function to handle bookmarking
  const handleBookmark = () => {
    alert("Bookmark added!"); // Replace with actual bookmark logic
    // Implement bookmarking functionality here
  };

  // Function to handle sharing
  const handleShare = () => {
    alert("Share link copied!"); // Replace with actual sharing logic
    // Implement sharing functionality here
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
      <div
        className={`sidebar right-sidebar ${isCollapsed ? 'collapsed' : ''}`}
        style={{
          width: isCollapsed ? '32px' : `${width}px`,
          overflow: isCollapsed ? 'hidden' : 'auto',
          position: 'relative',
        }}
      >
        <button onClick={toggleSidebar} className="right-toggle-button">
          <img src="/icons/Sidebar.svg" alt="Toggle Sidebar" width="20" />
        </button>

        {/* Icons appear beneath toggle button when collapsed */}
        {isCollapsed && (
          <div className="collapsed-icons">
            <img src="/icons/Bookmark.svg" alt="Bookmark" className="icon-button" onClick={handleBookmark}/>
            <img src="/icons/Share.svg" alt="Share" className="icon-button" onClick={handleShare}/>
          </div>
        )}

        {/* Fixed icons container for expanded state */}
        {!isCollapsed && (
          <div className="pdf-icons" style={{ position: 'absolute', top: '12px', right: '15px' }}>
            <img src="/icons/Bookmark.svg" alt="Bookmark" className="icon-button" onClick={handleBookmark}/>
            <img src="/icons/Share.svg" alt="Share" className="icon-button" onClick={handleShare}/>
          </div>
        )}
        
        {!isCollapsed && (
          <div style={{ padding: '10px' }}>
            <p className="interact-text">
              {interactionMessage}
              {searchResults && ` ${ellipsis}`}
            </p>
            {searchResults && (
              <div>
                <p>Found {searchResults.length} results</p>
                <button onClick={goToPreviousResult} disabled={currentResultIndex === 0}>
                  Previous
                </button>
                <button onClick={goToNextResult} disabled={currentResultIndex === searchResults.length - 1}>
                  Next
                </button>
              </div>
            )}
            </div>
        )}
      </div>

      {/* Resizable Divider */}
      {!isCollapsed && <ResizableDivider onDrag={(movementX) => handleResize(movementX)} />}
    </div>
  );
}

export default RightSidebar;
