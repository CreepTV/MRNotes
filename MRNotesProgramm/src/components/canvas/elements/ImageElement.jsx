import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical, faTimes, faArrowUp } from '@fortawesome/free-solid-svg-icons';

const ImageElement = ({ 
  element, 
  isSelected, 
  onSelect, 
  onMove, 
  onResize, 
  onDelete,
  onBringToFront,
  gridSize = 20
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 }); // Visual offset during drag
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const elementRef = useRef(null);
  const dragRectRef = useRef(null);

  // Drag functionality
  const handleMouseDownDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
    onBringToFront(element.id);
    
    setIsDragging(true);
    
    const canvasContent = elementRef.current.parentElement;
    const rect = canvasContent.getBoundingClientRect();
    dragRectRef.current = rect;
    
    setDragStart({
      x: e.clientX - rect.left - element.positionX,
      y: e.clientY - rect.top - element.positionY
    });
  };

  const handleMouseMoveDrag = (e) => {
    if (!isDragging || !dragRectRef.current) return;
    
    const rect = dragRectRef.current;
    
    const newX = e.clientX - rect.left - dragStart.x;
    const newY = e.clientY - rect.top - dragStart.y;
    
    // Only update visual offset, don't call onMove yet
    setDragOffset({
      x: Math.max(0, newX) - element.positionX,
      y: Math.max(0, newY) - element.positionY
    });
  };

  const handleMouseUpDrag = (e) => {
    if (isDragging && dragRectRef.current) {
      // On mouse up, apply final position with snapping (unless Alt is held)
      const skipSnap = e.altKey;
      const rect = dragRectRef.current;
      const newX = e.clientX - rect.left - dragStart.x;
      const newY = e.clientY - rect.top - dragStart.y;
      onMove(element.id, Math.max(0, newX), Math.max(0, newY), skipSnap);
    }
    setIsDragging(false);
    setDragOffset({ x: 0, y: 0 });
    dragRectRef.current = null;
  };

  // Resize functionality
  const handleMouseDownResize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({
      width: element.width,
      height: element.height,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseMoveResize = (e) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    const newWidth = Math.max(100, resizeStart.width + deltaX);
    const newHeight = Math.max(100, resizeStart.height + deltaY);
    
    onResize(element.id, newWidth, newHeight);
  };

  const handleMouseUpResize = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMoveDrag, { passive: true });
      window.addEventListener('mouseup', handleMouseUpDrag);
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveDrag, { passive: true });
        window.removeEventListener('mouseup', handleMouseUpDrag);
      };
    }
  }, [isDragging, dragStart]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMoveResize, { passive: true });
      window.addEventListener('mouseup', handleMouseUpResize);
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveResize, { passive: true });
        window.removeEventListener('mouseup', handleMouseUpResize);
      };
    }
  }, [isResizing, resizeStart]);

  return (
    <div
      ref={elementRef}
      className={`canvas-element canvas-element--image ${isSelected ? 'canvas-element--selected' : ''}`}
      style={{
        position: 'absolute',
        left: element.positionX,
        top: element.positionY,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex || 0,
        cursor: isDragging ? 'grabbing' : 'grab',
        transform: isDragging ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` : 'none'
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

      {/* Image */}
      <img 
        src={element.content}
        alt="Canvas Image"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none'
        }}
      />

      {/* Resize Handle */}
      {isSelected && (
        <div 
          className="canvas-element__resize-handle"
          onMouseDown={handleMouseDownResize}
        />
      )}
    </div>
  );
};

export default ImageElement;
