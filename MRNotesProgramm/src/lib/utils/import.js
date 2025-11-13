// ========================================
// MRNotes - Import Utilities
// ========================================

import { db } from '../db/database';

// Helper: Convert Base64 to Blob
export async function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Import .mrnote file
export async function importMRNote(file) {
  const text = await file.text();
  const data = JSON.parse(text);

  if (data.fileFormat !== 'MRNotes') {
    throw new Error('Invalid .mrnote file format');
  }

  // Import global tags
  for (const tag of data.tags || []) {
    const existing = await db.tags.where('name').equals(tag.name).first();
    if (!existing) {
      await db.tags.add(tag);
    }
  }

  // Import notebooks with complete hierarchy
  for (const notebookData of data.notebooks) {
    const notebookId = await db.notebooks.add({
      title: notebookData.title,
      description: notebookData.description,
      color: notebookData.color,
      icon: notebookData.icon,
      createdAt: notebookData.createdAt,
      updatedAt: notebookData.updatedAt
    });

    for (const sectionData of notebookData.sections) {
      const sectionId = await db.sections.add({
        notebookId,
        title: sectionData.title,
        orderIndex: sectionData.orderIndex,
        color: sectionData.color,
        createdAt: sectionData.createdAt
      });

      for (const pageData of sectionData.pages) {
        const pageId = await db.pages.add({
          sectionId,
          parentPageId: pageData.parentPageId,
          title: pageData.title,
          content: pageData.content,
          orderIndex: pageData.orderIndex,
          isFavorite: pageData.isFavorite,
          createdAt: pageData.createdAt,
          updatedAt: pageData.updatedAt
        });

        // Link tags
        for (const tag of pageData.tags || []) {
          let dbTag = await db.tags.where('name').equals(tag.name).first();
          if (!dbTag) {
            const tagId = await db.tags.add({
              name: tag.name,
              color: tag.color,
              createdAt: new Date()
            });
            dbTag = { id: tagId };
          }
          await db.pageTags.add({ pageId, tagId: dbTag.id });
        }

        // Import attachments (Base64 → Blob)
        for (const att of pageData.attachments || []) {
          const blob = await base64ToBlob(att.data, att.mimeType);
          await db.attachments.add({
            pageId,
            filename: att.filename,
            blob,
            mimeType: att.mimeType,
            fileSize: att.fileSize,
            createdAt: att.createdAt
          });
        }
      }
    }
  }

  console.log('✅ .mrnote successfully imported');
}

// Import .mrbook file
export async function importMRBook(file) {
  const text = await file.text();
  const data = JSON.parse(text);

  if (data.fileFormat !== 'MRBook') {
    throw new Error('Invalid .mrbook file format');
  }

  // Create notebook
  const notebookId = await db.notebooks.add({
    title: data.notebook.title,
    description: data.notebook.description,
    color: data.notebook.color,
    icon: data.notebook.icon,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Import sections and pages
  for (const sectionData of data.sections) {
    const sectionId = await db.sections.add({
      notebookId,
      title: sectionData.title,
      orderIndex: sectionData.orderIndex,
      color: sectionData.color,
      createdAt: new Date()
    });

    for (const pageData of sectionData.pages) {
      const pageId = await db.pages.add({
        sectionId,
        parentPageId: pageData.parentPageId,
        title: pageData.title,
        content: pageData.content,
        orderIndex: pageData.orderIndex,
        isFavorite: pageData.isFavorite,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Import tags (create if not exists)
      for (const tagData of pageData.tags || []) {
        let tag = await db.tags.where('name').equals(tagData.name).first();
        if (!tag) {
          const tagId = await db.tags.add({
            name: tagData.name,
            color: tagData.color,
            createdAt: new Date()
          });
          tag = { id: tagId };
        }
        await db.pageTags.add({ pageId, tagId: tag.id });
      }

      // Import attachments
      for (const att of pageData.attachments || []) {
        const blob = await base64ToBlob(att.data, att.mimeType);
        await db.attachments.add({
          pageId,
          filename: att.filename,
          blob,
          mimeType: att.mimeType,
          createdAt: new Date()
        });
      }
    }
  }

  console.log('✅ .mrbook successfully imported');
  return notebookId;
}

// Import Markdown file as new page
export async function importMarkdown(file, sectionId) {
  const text = await file.text();
  const lines = text.split('\n');

  // Extract title from first heading
  let title = file.name.replace('.md', '');
  if (lines[0].startsWith('# ')) {
    title = lines[0].substring(2).trim();
  }

  // Simple Markdown to TipTap JSON conversion
  const content = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text }]
      }
    ]
  };

  const pageId = await db.pages.add({
    sectionId,
    parentPageId: null,
    title,
    content,
    orderIndex: 0,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  console.log('✅ Markdown file imported as page');
  return pageId;
}
