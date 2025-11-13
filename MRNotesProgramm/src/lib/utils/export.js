// ========================================
// MRNotes - Export Utilities
// ========================================

import { db } from '../db/database';

// Helper: Convert Blob to Base64
export async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Helper: Download file
export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Get all settings
async function getSettings() {
  const settings = {};
  const allSettings = await db.settings.toArray();
  allSettings.forEach(s => settings[s.key] = s.value);
  return settings;
}

// Export complete backup (.mrnote)
export async function exportAllAsFile() {
  const notebooks = await db.notebooks.toArray();
  const allData = {
    fileFormat: 'MRNotes',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    exportedAt: new Date().toISOString(),
    notebooks: [],
    tags: await db.tags.toArray(),
    settings: await getSettings()
  };

  // Load complete hierarchy for each notebook
  for (const notebook of notebooks) {
    const sections = await db.sections.where('notebookId').equals(notebook.id).toArray();

    const notebookData = {
      ...notebook,
      sections: []
    };

    for (const section of sections) {
      const pages = await db.pages.where('sectionId').equals(section.id).toArray();

      const sectionData = {
        ...section,
        pages: await Promise.all(pages.map(async (page) => {
          // Load tags for page
          const pageTags = await db.pageTags.where('pageId').equals(page.id).toArray();
          const tags = await Promise.all(
            pageTags.map(pt => db.tags.get(pt.tagId))
          );

          // Load attachments and convert to Base64
          const attachments = await db.attachments.where('pageId').equals(page.id).toArray();
          const attachmentsData = await Promise.all(
            attachments.map(async (att) => ({
              filename: att.filename,
              mimeType: att.mimeType,
              fileSize: att.fileSize,
              createdAt: att.createdAt,
              data: await blobToBase64(att.blob)
            }))
          );

          // Load subpages
          const subpages = await db.pages.where('parentPageId').equals(page.id).toArray();

          return {
            ...page,
            tags,
            attachments: attachmentsData,
            subpages
          };
        }))
      };

      notebookData.sections.push(sectionData);
    }

    allData.notebooks.push(notebookData);
  }

  // Save as .mrnote file
  const blob = new Blob([JSON.stringify(allData, null, 2)], {
    type: 'application/json'
  });
  downloadFile(blob, `mrnotes-backup-${Date.now()}.mrnote`);
}

// Export single notebook (.mrbook)
export async function exportNotebookAsFile(notebookId) {
  const notebook = await db.notebooks.get(notebookId);
  const sections = await db.sections.where('notebookId').equals(notebookId).toArray();

  const bookData = {
    fileFormat: 'MRBook',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    notebook: {
      title: notebook.title,
      description: notebook.description,
      color: notebook.color,
      icon: notebook.icon,
      createdAt: notebook.createdAt,
      updatedAt: notebook.updatedAt
    },
    sections: []
  };

  // Load sections and pages
  for (const section of sections) {
    const pages = await db.pages.where('sectionId').equals(section.id).toArray();

    const sectionData = {
      ...section,
      pages: await Promise.all(pages.map(async (page) => {
        const pageTags = await db.pageTags.where('pageId').equals(page.id).toArray();
        const tags = await Promise.all(pageTags.map(pt => db.tags.get(pt.tagId)));

        const attachments = await db.attachments.where('pageId').equals(page.id).toArray();
        const attachmentsData = await Promise.all(
          attachments.map(async (att) => ({
            filename: att.filename,
            mimeType: att.mimeType,
            fileSize: att.fileSize,
            data: await blobToBase64(att.blob)
          }))
        );

        const subpages = await db.pages.where('parentPageId').equals(page.id).toArray();

        return {
          ...page,
          tags,
          attachments: attachmentsData,
          subpages
        };
      }))
    };

    bookData.sections.push(sectionData);
  }

  // Save as .mrbook file
  const blob = new Blob([JSON.stringify(bookData, null, 2)], {
    type: 'application/json'
  });
  downloadFile(blob, `${notebook.title.replace(/[^a-z0-9]/gi, '_')}.mrbook`);
}

// Export page as Markdown
export async function exportPageAsMarkdown(pageId) {
  const page = await db.pages.get(pageId);
  if (!page) return;

  let markdown = `# ${page.title}\n\n`;

  // Convert TipTap JSON to Markdown (simplified)
  if (page.content && page.content.content) {
    const convertToMarkdown = (node) => {
      if (node.type === 'paragraph') {
        return (node.content || []).map(c => c.text || '').join('') + '\n\n';
      }
      if (node.type === 'heading') {
        const level = '#'.repeat(node.attrs?.level || 1);
        return `${level} ${(node.content || []).map(c => c.text || '').join('')}\n\n`;
      }
      return '';
    };

    page.content.content.forEach(node => {
      markdown += convertToMarkdown(node);
    });
  }

  const blob = new Blob([markdown], { type: 'text/markdown' });
  downloadFile(blob, `${page.title}.md`);
}
