import React, { useState } from 'react';
import ResizableDivider from './ResizableDivider';
import './Sidebar.css';

function LeftSidebar({ isCollapsed, toggleSidebar, children }) {
  const [width, setWidth] = useState(200); // Default width

  const handleResize = (movementX) => {
    if (!isCollapsed) {
      setWidth((prevWidth) => Math.max(Math.min(prevWidth + movementX, 300), 100));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row' }}>
      <div
        className={`sidebar left-sidebar ${isCollapsed ? 'collapsed' : ''}`}
        style={{ width: isCollapsed ? '0px' : `${width}px` }}
      >
        <button onClick={toggleSidebar} className="left-toggle-button">
            <img src="/icons/menu.svg" alt="Toggle Sidebar" width="20" />
        </button>

        {!isCollapsed && (
          <div className="logo-container">
            <img src="/Rayo white logo.png" alt="Rayo Logo" className="sidebar-logo" />
          </div>
        )}

        {!isCollapsed && children} {/* Render children only when sidebar is expanded */}
      </div>

      {!isCollapsed && (
        <ResizableDivider onDrag={(movementX) => handleResize(movementX)} />
      )}
    </div>
  );
}

export default LeftSidebar;
