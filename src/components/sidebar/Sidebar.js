// Sidebar.js
import React, { useState } from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import SearchBar from '../searchbar/SearchBar';

function Sidebar() {
    const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(true);

  const toggleLeftSidebar = () => {
    setIsLeftSidebarCollapsed((prev) => !prev);
  };

  return (
    <div style={{ display: 'flex' }}>
      <LeftSidebar isCollapsed={isLeftSidebarCollapsed} toggleSidebar={toggleLeftSidebar} />
      <div style={{ flex: 1 }}>
        <SearchBar toggleLeftSidebar={toggleLeftSidebar} />
      </div>
      <RightSidebar />
    </div>
  );
}


export default Sidebar;