// ========================================
// useNotebooks - Custom Hook for Notebook Operations
// ========================================

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useNavigate } from 'react-router-dom';

export function useNotebooks() {
  const navigate = useNavigate();

  // Get all notebooks
  const notebooks = useLiveQuery(() => db.notebooks.toArray()) || [];

  // Get single notebook
  const getNotebook = async (id) => {
    return await db.notebooks.get(id);
  };

  // Create notebook
  const createNotebook = async (data) => {
    const id = await db.notebooks.add({
      title: data.title || 'Untitled Notebook',
      description: data.description || '',
      color: data.color || '#2563eb',
      icon: data.icon || 'book',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    });
    return id;
  };

  // Update notebook
  const updateNotebook = async (id, updates) => {
    await db.notebooks.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  };

  // Delete notebook (soft delete)
  const deleteNotebook = async (id) => {
    await db.notebooks.update(id, {
      deletedAt: new Date()
    });
    
    // Also delete associated sections and pages
    const sections = await db.sections.where('notebookId').equals(id).toArray();
    for (const section of sections) {
      await db.pages.where('sectionId').equals(section.id).delete();
    }
    await db.sections.where('notebookId').equals(id).delete();
  };

  // Permanently delete notebook
  const permanentlyDeleteNotebook = async (id) => {
    const sections = await db.sections.where('notebookId').equals(id).toArray();
    for (const section of sections) {
      await db.pages.where('sectionId').equals(section.id).delete();
    }
    await db.sections.where('notebookId').equals(id).delete();
    await db.notebooks.delete(id);
  };

  return {
    notebooks,
    getNotebook,
    createNotebook,
    updateNotebook,
    deleteNotebook,
    permanentlyDeleteNotebook
  };
}

export default useNotebooks;
