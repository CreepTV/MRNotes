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

// Export for use in components
export default db;
