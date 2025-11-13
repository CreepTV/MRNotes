// ========================================
// useAutoSave - Custom Hook for Auto-saving Content
// ========================================

import { useEffect, useRef, useCallback } from 'react';
import { db } from '../db/database';

export function useAutoSave(pageId, content, delay = 2000) {
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef(null);

  const save = useCallback(async () => {
    if (!pageId || !content) return;

    // Don't save if content hasn't changed
    const contentString = JSON.stringify(content);
    if (lastSavedRef.current === contentString) {
      return;
    }

    try {
      await db.pages.update(pageId, {
        content,
        updatedAt: new Date()
      });
      
      lastSavedRef.current = contentString;
      console.log('✅ Auto-saved at', new Date().toLocaleTimeString());
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  }, [pageId, content]);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    if (content) {
      timeoutRef.current = setTimeout(() => {
        save();
      }, delay);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, delay, save]);

  // Save immediately on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      save();
    };
  }, [save]);

  return { save };
}

export default useAutoSave;
