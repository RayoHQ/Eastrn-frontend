import React, { useState, useCallback } from 'react';
import './ResizableDivider.css';

function ResizableDivider({ onDrag }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging) {
        onDrag(e.movementX); // Pass horizontal movement to parent
      }
    },
    [isDragging, onDrag]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add and remove event listeners on document
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    // Cleanup on component unmount
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);

  return (
    <div
      className="resizable-divider"
      onMouseDown={handleMouseDown}
    />
  );
}

export default ResizableDivider;
