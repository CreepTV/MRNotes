import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../lib/db/database';
import TextBoxElement from './elements/TextBoxElement';
import ImageElement from './elements/ImageElement';
import FileElement from './elements/FileElement';

const CanvasEditor = ({ pageId, onEditorFocus }) => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [pendingCursor, setPendingCursor] = useState(null); // { x, y } for blinking cursor
  const [newElementId, setNewElementId] = useState(null); // Track newly created element for auto-focus
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 3000, height: 3000 });
  
  // Grid snapping configuration
  const GRID_SIZE = 20; // Must match background grid size
  
  // Snap to grid function
  const snapToGrid = (value) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  };

  // Load elements from database
  useEffect(() => {
    if (!pageId) return;

    const loadElements = async () => {
      const loadedElements = await db.pageElements
        .where('pageId')
        .equals(pageId)
        .toArray();
      setElements(loadedElements);
    };

    loadElements();
  }, [pageId]);

  // Handle canvas click - show cursor, wait for typing
  const handleCanvasClick = (e) => {
    // Only respond if clicking directly on canvas background (not on elements)
    const isCanvasBackground = 
      e.target.classList.contains('canvas-editor') || 
      e.target.classList.contains('canvas-editor__content');
    
    if (!isCanvasBackground) return;

    const contentDiv = canvasRef.current.querySelector('.canvas-editor__content');
    const rect = contentDiv.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Show blinking cursor at this position
    setPendingCursor({ x: Math.max(0, x - 150), y: Math.max(0, y - 50) });
  };

  // Handle keyboard input - create textbox when user starts typing
  useEffect(() => {
    if (!pendingCursor) return;

    const handleKeyDown = async (e) => {
      // Ignore special keys except Enter
      if (e.key === 'Escape') {
        setPendingCursor(null);
        return;
      }

      // Ignore modifier keys, arrows, etc.
      if (e.key.length > 1 && e.key !== 'Enter') {
        return;
      }

      // Prevent default to avoid the key being typed elsewhere
      e.preventDefault();

      const maxZ = elements.length > 0 
        ? Math.max(...elements.map(el => el.zIndex || 0))
        : 0;

      // Create initial content with the typed character
      const initialChar = e.key === 'Enter' ? '<p></p>' : `<p>${e.key}</p>`;

      // Create new text element at cursor position
      const newElement = {
        pageId,
        type: 'text',
        positionX: pendingCursor.x,
        positionY: pendingCursor.y,
        width: 300,
        height: 100,
        zIndex: maxZ + 1,
        content: initialChar,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const id = await db.pageElements.add(newElement);
      setElements([...elements, { ...newElement, id }]);
      setSelectedElement(id);
      setNewElementId(id); // Mark for auto-focus
      setPendingCursor(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pendingCursor, elements, pageId]);

  // Click anywhere else removes cursor
  useEffect(() => {
    if (!pendingCursor) return;

    const handleClickOutside = (e) => {
      const isCanvasBackground = 
        e.target.classList.contains('canvas-editor') || 
        e.target.classList.contains('canvas-editor__content');
      
      if (!isCanvasBackground) {
        setPendingCursor(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [pendingCursor]);

  // Update element position
  const handleElementMove = async (elementId, newX, newY, skipSnap = false) => {
    // Apply grid snapping unless skipSnap is true
    const finalX = skipSnap ? newX : snapToGrid(newX);
    const finalY = skipSnap ? newY : snapToGrid(newY);
    
    // Optimistic update - update state immediately
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, positionX: finalX, positionY: finalY } : el
    ));
    
    // Update database asynchronously
    db.pageElements.update(elementId, {
      positionX: finalX,
      positionY: finalY,
      updatedAt: new Date()
    });

    // Auto-expand canvas if needed
    const newWidth = Math.max(canvasSize.width, finalX + 500);
    const newHeight = Math.max(canvasSize.height, finalY + 500);
    if (newWidth > canvasSize.width || newHeight > canvasSize.height) {
      setCanvasSize({ width: newWidth, height: newHeight });
    }
  };

  // Update element size
  const handleElementResize = async (elementId, newWidth, newHeight) => {
    // Optimistic update - update state immediately
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, width: newWidth, height: newHeight } : el
    ));
    
    // Update database asynchronously
    db.pageElements.update(elementId, {
      width: newWidth,
      height: newHeight,
      updatedAt: new Date()
    });
  };

  // Update element content
  const handleElementUpdate = async (elementId, newContent) => {
    await db.pageElements.update(elementId, {
      content: newContent,
      updatedAt: new Date()
    });

    setElements(elements.map(el => 
      el.id === elementId 
        ? { ...el, content: newContent }
        : el
    ));
  };

  // Delete element
  const handleElementDelete = async (elementId) => {
    await db.pageElements.delete(elementId);
    setElements(elements.filter(el => el.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  // Bring element to front
  const bringToFront = async (elementId) => {
    const maxZ = Math.max(...elements.map(el => el.zIndex || 0));
    await db.pageElements.update(elementId, {
      zIndex: maxZ + 1
    });

    setElements(elements.map(el => 
      el.id === elementId 
        ? { ...el, zIndex: maxZ + 1 }
        : el
    ));
  };

  const renderElement = (element) => {
    switch (element.type) {
      case 'text':
        return (
          <TextBoxElement
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            isNew={newElementId === element.id}
            onSelect={() => setSelectedElement(element.id)}
            onMove={handleElementMove}
            onResize={handleElementResize}
            onUpdate={handleElementUpdate}
            onDelete={handleElementDelete}
            onBringToFront={bringToFront}
            onFocused={() => setNewElementId(null)}
            onEditorReady={onEditorFocus}
            gridSize={GRID_SIZE}
          />
        );
      case 'image':
        return (
          <ImageElement
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            onSelect={() => setSelectedElement(element.id)}
            onMove={handleElementMove}
            onResize={handleElementResize}
            onDelete={handleElementDelete}
            onBringToFront={bringToFront}
            gridSize={GRID_SIZE}
          />
        );
      case 'file':
        return (
          <FileElement
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            onSelect={() => setSelectedElement(element.id)}
            onMove={handleElementMove}
            onDelete={handleElementDelete}
            onBringToFront={bringToFront}
            gridSize={GRID_SIZE}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={canvasRef}
      className="canvas-editor"
      onClick={handleCanvasClick}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        position: 'relative',
        cursor: 'crosshair'
      }}
    >
      <div 
        className="canvas-editor__content"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          position: 'relative',
          backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          backgroundPosition: '-0.5px -0.5px' // Align dots exactly to grid points (0, 20, 40, etc.)
        }}
      >
        {elements
          .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
          .map(renderElement)}
        
        {/* Blinking cursor when waiting for text input */}
        {pendingCursor && (
          <div 
            className="canvas-cursor"
            style={{
              position: 'absolute',
              left: pendingCursor.x + 150,
              top: pendingCursor.y + 50,
              width: 2,
              height: 24,
              background: 'var(--primary)',
              animation: 'blink 1s infinite',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default CanvasEditor;
