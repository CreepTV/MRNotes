import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faTimes, faArrowUp } from '@fortawesome/free-solid-svg-icons';

const FileElement = ({ 
  element, 
  isSelected, 
  onSelect, 
  onMove, 
  onDelete,
  onBringToFront 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);

  const handleMouseDownDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    onBringToFront(element.id);
    
    setIsDragging(true);
    
    const canvasContent = elementRef.current.parentElement;
    const rect = canvasContent.getBoundingClientRect();
    
    setDragStart({
      x: e.clientX - rect.left - element.positionX,
      y: e.clientY - rect.top - element.positionY
    });
  };

  const handleMouseMoveDrag = (e) => {
    if (!isDragging) return;
    
    const canvasContent = elementRef.current.parentElement;
    const rect = canvasContent.getBoundingClientRect();
    
    const newX = e.clientX - rect.left - dragStart.x;
    const newY = e.clientY - rect.top - dragStart.y;
    
    onMove(element.id, Math.max(0, newX), Math.max(0, newY));
  };

  const handleMouseUpDrag = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMoveDrag);
      window.addEventListener('mouseup', handleMouseUpDrag);
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveDrag);
        window.removeEventListener('mouseup', handleMouseUpDrag);
      };
    }
  }, [isDragging, dragStart]);

  const fileData = element.content ? JSON.parse(element.content) : { name: 'Datei', type: '' };

  return (
    <div
      ref={elementRef}
      className={`canvas-element canvas-element--file ${isSelected ? 'canvas-element--selected' : ''}`}
      style={{
        position: 'absolute',
        left: element.positionX,
        top: element.positionY,
        width: 200,
        zIndex: element.zIndex || 0,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={handleMouseDownDrag}
    >
      {/* Actions */}
      {isSelected && (
        <div className="canvas-element__actions">
          <button 
            className="canvas-element__action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onBringToFront(element.id);
            }}
            title="Nach vorne bringen"
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
          <button 
            className="canvas-element__action-btn canvas-element__action-btn--delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(element.id);
            }}
            title="Löschen"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      {/* File Display */}
      <div className="canvas-element__file-content">
        <div className="canvas-element__file-icon">
          <FontAwesomeIcon icon={faFile} size="2x" />
        </div>
        <div className="canvas-element__file-info">
          <div className="canvas-element__file-name">{fileData.name}</div>
          {fileData.type && (
            <div className="canvas-element__file-type">{fileData.type}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileElement;
