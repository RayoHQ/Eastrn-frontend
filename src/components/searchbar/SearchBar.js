import React, { useState, useRef } from 'react';
import './SearchBar.css';

function SearchBar({ isLeftSidebarCollapsed, isRightSidebarCollapsed, toggleLeftSidebar, onCommand }) {
  const [query, setQuery] = useState('');
  const isExecutingCommand = useRef(false); // Ref to prevent duplicate calls

  const isUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSearchandChat = () => {
    if (isExecutingCommand.current) return; // Prevent duplicate calls
    isExecutingCommand.current = true;

    console.log("Executing handleSearchandChat"); // Debugging line

    const pageCommand = query.match(/go to page (\d+)/i);
    const searchCommand = query.match(/search for (.+)/i);

    if (pageCommand) {
      const pageNumber = parseInt(pageCommand[1], 10);
      console.log(`Command detected: Navigating to page ${pageNumber}`); // Debugging line
      onCommand({
        type: 'goToPage',
        pageNumber,
        message: `Navigating to page ${pageNumber}.`
      });
    } else if (searchCommand) {
      const searchTerm = searchCommand[1];
      console.log(`Command detected: Searching for term "${searchTerm}"`); // Debugging line
      onCommand({
        type: 'search',
        term: searchTerm,
        message: `Searching for term "${searchTerm}" within the document.`
      });
    } else if (isUrl(query)) {
      alert(`Detected as URL: ${query}`);
    } else {
      alert('Please enter a valid URL or text query like "Go to page..." or "Search for term...".');
    }

    setQuery(''); // Clear input after executing command

    setTimeout(() => {
      isExecutingCommand.current = false; // Allow new commands after execution
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchandChat();
    }
  };

  const getSearchContainerClass = () => {
    if (!isLeftSidebarCollapsed) return 'search-left-inside';
    if (isLeftSidebarCollapsed && isRightSidebarCollapsed) return 'search-center';
    return 'search-left';
  };

  return (
    <div className={`search-container ${getSearchContainerClass()}`}>
      {isLeftSidebarCollapsed && (
        <button onClick={toggleLeftSidebar} className="menu-button">
          <img src="/icons/menu.svg" alt="Menu" className="menu-icon" />
        </button>
      )}
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="What do you want to do?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="search-input"
        />
      </div>
      {isLeftSidebarCollapsed && (
        <button onClick={handleSearchandChat} className="search-button">
          <img src="/icons/send.svg" alt="Search" className="send-icon" />
        </button>
      )}
    </div>
  );
}

export default SearchBar;
