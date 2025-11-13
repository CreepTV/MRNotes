// ========================================
// usePages - Custom Hook for Page Operations
// ========================================

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';

export function usePages(sectionId = null) {
  // Get all pages or pages by section
  const pages = useLiveQuery(
    () => {
      if (sectionId) {
        return db.pages.where('sectionId').equals(sectionId).toArray();
      }
      return db.pages.toArray();
    },
    [sectionId]
  ) || [];

  // Get single page
  const getPage = async (id) => {
    return await db.pages.get(id);
  };

  // Get page with tags
  const getPageWithTags = async (id) => {
    const page = await db.pages.get(id);
    if (!page) return null;

    const pageTags = await db.pageTags.where('pageId').equals(id).toArray();
    const tags = await Promise.all(
      pageTags.map(pt => db.tags.get(pt.tagId))
    );

    return { ...page, tags };
  };

  // Create page
  const createPage = async (data) => {
    const id = await db.pages.add({
      sectionId: data.sectionId,
      parentPageId: data.parentPageId || null,
      title: data.title || 'Untitled Page',
      content: data.content || { type: 'doc', content: [] },
      orderIndex: data.orderIndex || 0,
      isFavorite: data.isFavorite || false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return id;
  };

  // Update page
  const updatePage = async (id, updates) => {
    await db.pages.update(id, {
      ...updates,
      updatedAt: new Date()
    });
  };

  // Update page content
  const updatePageContent = async (id, content) => {
    await db.pages.update(id, {
      content,
      updatedAt: new Date()
    });
  };

  // Toggle favorite
  const toggleFavorite = async (id) => {
    const page = await db.pages.get(id);
    if (page) {
      await db.pages.update(id, {
        isFavorite: page.isFavorite ? 0 : 1,
        updatedAt: new Date()
      });
    }
  };

  // Delete page
  const deletePage = async (id) => {
    // Delete subpages first
    const subpages = await db.pages.where('parentPageId').equals(id).toArray();
    for (const subpage of subpages) {
      await deletePage(subpage.id);
    }
    
    // Delete attachments
    await db.attachments.where('pageId').equals(id).delete();
    
    // Delete page-tag relations
    await db.pageTags.where('pageId').equals(id).delete();
    
    // Delete page
    await db.pages.delete(id);
  };

  // Add tag to page
  const addTagToPage = async (pageId, tagId) => {
    await db.pageTags.add({ pageId, tagId });
  };

  // Remove tag from page
  const removeTagFromPage = async (pageId, tagId) => {
    await db.pageTags.where({ pageId, tagId }).delete();
  };

  return {
    pages,
    getPage,
    getPageWithTags,
    createPage,
    updatePage,
    updatePageContent,
    toggleFavorite,
    deletePage,
    addTagToPage,
    removeTagFromPage
  };
}

export default usePages;
