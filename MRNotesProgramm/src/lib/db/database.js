// ========================================
// MRNotes - IndexedDB Database Setup
// ========================================

import Dexie from 'dexie';

// Initialize Dexie database
export const db = new Dexie('MRNotesDB');

// Define database schema
db.version(1).stores({
  notebooks: '++id, title, createdAt, updatedAt, deletedAt',
  sections: '++id, notebookId, title, orderIndex, createdAt',
  pages: '++id, sectionId, parentPageId, title, orderIndex, isFavorite, createdAt, updatedAt',
  pageElements: '++id, pageId, type, positionX, positionY, width, height, zIndex, content, createdAt, updatedAt',
  tags: '++id, name, color, createdAt',
  pageTags: '[pageId+tagId], pageId, tagId',
  attachments: '++id, pageId, filename, createdAt',
  settings: 'key' // Key-Value Store for app settings
});

// Version 2: Add color field to notebooks (non-indexed, just stored)
db.version(2).stores({
  notebooks: '++id, title, createdAt, updatedAt, deletedAt, color'
});

// Version 3: Add orderIndex to notebooks
db.version(3).stores({
  notebooks: '++id, title, orderIndex, createdAt, updatedAt, deletedAt, color'
});

// Export for use in components
export default db;
