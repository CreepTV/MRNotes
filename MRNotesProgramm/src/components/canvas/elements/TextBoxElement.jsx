import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical, faTimes, faArrowUp } from '@fortawesome/free-solid-svg-icons';

const TextBoxElement = React.memo(({ 
  element, 
  isSelected,
  isNew = false,
  onSelect, 
  onMove, 
  onResize, 
  onUpdate, 
  onDelete,
  onBringToFront,
  onFocused
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const elementRef = useRef(null);
  const dragRectRef = useRef(null);
  const updateTimeoutRef = useRef(null);

  // Debounced update to prevent too frequent saves
  const debouncedUpdate = useCallback((content) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(() => {
      onUpdate(element.id, content);
    }, 500); // Save after 500ms of no typing
  }, [element.id, onUpdate]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {
          depth: 10,
        },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({
        placeholder: 'Text eingeben...',
      }),
    ],
    content: element.content || '',
    onUpdate: ({ editor }) => {
      debouncedUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'textbox-editor',
        spellcheck: 'false'
      }
    },
    // Don't auto-focus to prevent jumping
    autofocus: false,
  });

  // Only update editor content when element changes from external source
  useEffect(() => {
    if (editor && !editor.isFocused && element.content !== editor.getHTML()) {
      editor.commands.setContent(element.content || '', false);
    }
  }, [element.content, editor]);

  // Auto-focus new elements and place cursor at end
  useEffect(() => {
    if (editor && isNew) {
      setTimeout(() => {
        editor.commands.focus('end');
        if (onFocused) onFocused();
      }, 100);
    }
  }, [editor, isNew, onFocused]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);
  
  // Drag functionality with performance optimization
  const handleMouseDownDrag = useCallback((e) => {
    // Don't drag when clicking inside text editor or on ProseMirror
    if (e.target.closest('.textbox-editor') || 
        e.target.closest('.ProseMirror') ||
        e.target.classList.contains('canvas-element__content')) {
      return;
    }
    
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
  }, [element.id, element.positionX, element.positionY, onSelect, onBringToFront]);

  const handleMouseMoveDrag = useCallback((e) => {
    if (!isDragging || !dragRectRef.current) return;
    
    const rect = dragRectRef.current;
    const newX = e.clientX - rect.left - dragStart.x;
    const newY = e.clientY - rect.top - dragStart.y;
    
    requestAnimationFrame(() => {
      onMove(element.id, Math.max(0, newX), Math.max(0, newY));
    });
  }, [isDragging, dragStart.x, dragStart.y, element.id, onMove]);

  const handleMouseUpDrag = useCallback(() => {
    setIsDragging(false);
    dragRectRef.current = null;
  }, []);

  // Resize functionality with performance optimization
  const handleMouseDownResize = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({
      width: element.width,
      height: element.height,
      x: e.clientX,
      y: e.clientY
    });
  }, [element.width, element.height]);

  const handleMouseMoveResize = useCallback((e) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    const newWidth = Math.max(150, resizeStart.width + deltaX);
    const newHeight = Math.max(50, resizeStart.height + deltaY);
    
    requestAnimationFrame(() => {
      onResize(element.id, newWidth, newHeight);
    });
  }, [isResizing, resizeStart, element.id, onResize]);

  const handleMouseUpResize = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Global mouse events
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMoveDrag);
      window.addEventListener('mouseup', handleMouseUpDrag);
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveDrag);
        window.removeEventListener('mouseup', handleMouseUpDrag);
      };
    }
  }, [isDragging, handleMouseMoveDrag, handleMouseUpDrag]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMoveResize);
      window.addEventListener('mouseup', handleMouseUpResize);
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveResize);
        window.removeEventListener('mouseup', handleMouseUpResize);
      };
    }
  }, [isResizing, handleMouseMoveResize, handleMouseUpResize]);

  return (
    <div
      ref={elementRef}
      className={`canvas-element canvas-element--text ${isSelected ? 'canvas-element--selected' : ''}`}
      style={{
        position: 'absolute',
        left: element.positionX,
        top: element.positionY,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex || 0,
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: isDragging ? 'none' : 'auto'
      }}
      onClick={(e) => {
        // Only select if not clicking inside the editor
        if (!e.target.closest('.ProseMirror')) {
          e.stopPropagation();
          onSelect();
        }
      }}
    >
      {/* Drag Handle - always rendered, visibility controlled by CSS */}
      <div 
        className="canvas-element__drag-handle"
        onMouseDown={handleMouseDownDrag}
        style={{ cursor: 'grab' }}
      >
        <FontAwesomeIcon icon={faGripVertical} />
      </div>

      {/* Actions - always rendered, visibility controlled by CSS */}
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

      {/* Content */}
      <div className="canvas-element__content">
        <EditorContent editor={editor} />
      </div>

      {/* Resize Handle - always rendered, visibility controlled by CSS */}
      <div 
        className="canvas-element__resize-handle"
        onMouseDown={handleMouseDownResize}
      />
    </div>
  );
});

export default TextBoxElement;
