# MRNotes - OneNote Web-Alternative
## Projektplan und Umsetzungsstrategie

**Ziel:** Eine vollwertige, moderne Web-Alternative zu Microsoft OneNote mit hierarchischer Struktur und allen wichtigen Funktionen.

---

## 1. Kernfunktionen (Must-Have)

### 1.1 Hierarchische Struktur (OneNote-inspiriert)
- **Notizbücher** (Notebooks) - Oberste Ebene
- **Abschnitte** (Sections) - Gruppierung innerhalb eines Notizbuchs
- **Seiten** (Pages) - Einzelne Notizen
- **Unterseiten** (Subpages) - Optionale Verschachtelung

### 1.2 Rich-Text-Editor
- Formatierung: Fett, Kursiv, Unterstrichen, Durchgestrichen
- Überschriften (H1-H6)
- Listen (Aufzählungen, Nummerierungen, Checklisten)
- Einrückungen und Zitate
- Farben für Text und Hintergrund
- Tabellen

### 1.3 Multimedia-Unterstützung
- Bilder einfügen (Upload, Drag & Drop, URL)
- Dateianhänge
- Audio-/Video-Einbettung
- Zeichnungen/Skizzen

### 1.4 Organisationsfeatures
- Tags/Labels für Seiten
- Volltextsuche
- Favoriten/Lesezeichen
- Sortierung und Filterung
- Drag & Drop zum Reorganisieren

### 1.5 Zusammenarbeit
- Teilen von Notizbüchern
- Echtzeit-Kollaboration (optional in Phase 2)
- Kommentare
- Versionsverlauf

---

## 2. Technologie-Stack (Client-Side Only)

### 2.1 Frontend
**Empfohlener Stack: React + Vite (Pure Client-Side)**
- **Framework:** Vite + React 18 (schnell, lightweight)
- **Alternative:** Next.js mit Static Export (SSG ohne Server)
- **Editor:** TipTap (moderne WYSIWYG, offline-fähig)
- **Styling:** SCSS/SASS (modular, wiederverwendbar)
- **State Management:** Zustand (einfach, lightweight)
- **Lokale Datenbank:** IndexedDB (via Dexie.js)

### 2.2 Lokale Datenspeicherung
**Keine Server/Cloud - Alles im Browser:**
- **Datenbank:** IndexedDB (strukturierte Daten, unbegrenzt*)
- **Alternative:** LocalStorage (nur für kleine Daten < 10MB)
- **Dateispeicher:** IndexedDB (Blobs für Bilder/Dateien)
- **Suche:** Lokale Volltextsuche (Fuse.js oder MiniSearch)
- **Backup:** Export/Import als JSON oder ZIP

*Browser erlauben meist 50%+ vom verfügbaren Speicher

### 2.3 PWA (Progressive Web App)
**Offline-First Ansatz:**
- **Service Worker:** Für Offline-Funktionalität
- **Cache API:** Für statische Assets
- **Installation:** Als Desktop/Mobile App installierbar
- **Sync:** Optional später als Erweiterung

### 2.4 Deployment
**Statisches Hosting (kostenlos):**
- **Firebase Hosting** (Empfohlen - 10GB kostenlos)
- **Vercel** (Unlimited static sites)
- **Netlify** (100GB/Monat kostenlos)
- **GitHub Pages** (Direkt aus Repository)
- **Cloudflare Pages** (Unlimited Bandbreite)

---

## 3. IndexedDB Schema (Client-Side)

### 3.1 Dexie.js Struktur
```javascript
// IndexedDB via Dexie.js (einfache API)
import Dexie from 'dexie';

const db = new Dexie('MRNotesDB');

db.version(1).stores({
  // Object Stores (= Tabellen)
  notebooks: '++id, title, createdAt, updatedAt, deletedAt',
  sections: '++id, notebookId, title, orderIndex, createdAt',
  pages: '++id, sectionId, parentPageId, title, orderIndex, isFavorite, createdAt, updatedAt',
  tags: '++id, name, color, createdAt',
  pageTags: '[pageId+tagId], pageId, tagId',
  attachments: '++id, pageId, filename, createdAt',
  settings: 'key' // Key-Value Store für App-Einstellungen
});

// Beispiel Datenstruktur
const notebook = {
  id: 1,
  title: 'Mein Notizbuch',
  description: 'Beschreibung',
  color: '#2563eb',
  icon: 'book',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
};

const page = {
  id: 1,
  sectionId: 1,
  parentPageId: null, // null = Hauptseite, sonst Unterseite
  title: 'Meine Notiz',
  content: {
    type: 'doc',
    content: [/* TipTap JSON */]
  },
  orderIndex: 0,
  isFavorite: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

const attachment = {
  id: 1,
  pageId: 1,
  filename: 'bild.jpg',
  blob: new Blob([...], { type: 'image/jpeg' }), // Datei als Blob
  fileSize: 123456,
  mimeType: 'image/jpeg',
  createdAt: new Date()
};
```

### 3.2 Datenzugriff Beispiele
```javascript
// Erstellen
await db.notebooks.add({ title: 'Neues Notizbuch', color: '#3b82f6' });

// Lesen
const allNotebooks = await db.notebooks.toArray();
const notebook = await db.notebooks.get(1);

// Hierarchie abfragen
const sections = await db.sections.where('notebookId').equals(1).toArray();
const pages = await db.pages.where('sectionId').equals(1).toArray();

// Suche (einfach)
const results = await db.pages
  .filter(page => page.title.toLowerCase().includes('suchwort'))
  .toArray();

// Update
await db.pages.update(1, { title: 'Neuer Titel', updatedAt: new Date() });

// Löschen (soft delete)
await db.pages.update(1, { deletedAt: new Date() });
```

---

## 4. Lokale Datenspeicherung

### 4.1 IndexedDB Storage-Limits
```
Browser-Limits (typisch):
- Chrome/Edge: 60% des verfügbaren Speichers
- Firefox: 50% des verfügbaren Speichers  
- Safari: ~1GB (kann mehr anfragen)

Beispiel: 100GB freier Speicher = ~60GB für IndexedDB
```

### 4.2 Datei-Handling (Blobs in IndexedDB)
```javascript
// Bild speichern
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

await db.attachments.add({
  pageId: currentPageId,
  filename: file.name,
  blob: file, // Browser speichert als Blob
  fileSize: file.size,
  mimeType: file.type,
  createdAt: new Date()
});

// Bild anzeigen
const attachment = await db.attachments.get(attachmentId);
const url = URL.createObjectURL(attachment.blob);
imgElement.src = url;

// Aufräumen
URL.revokeObjectURL(url);
```

### 4.3 MRNotes Dateiformate (.mrnote & .mrbook)

**Dateiformat-Spezifikation:**
- **`.mrnote`** - Komplette Datenbank (alle Notebooks)
- **`.mrbook`** - Einzelnes Notebook mit Sections & Pages

```javascript
// ========================================
// .mrnote Format (Alle Daten)
// ========================================
const mrnoteStructure = {
  fileFormat: 'MRNotes',
  version: '1.0.0',
  createdAt: '2025-11-13T10:30:00.000Z',
  exportedAt: '2025-11-13T10:30:00.000Z',
  
  // Alle Notebooks
  notebooks: [
    {
      id: 1,
      title: 'Mein Notizbuch',
      description: 'Beschreibung',
      color: '#2563eb',
      icon: 'book',
      createdAt: '2025-11-13T10:30:00.000Z',
      updatedAt: '2025-11-13T10:30:00.000Z',
      
      // Sections in diesem Notebook
      sections: [
        {
          id: 1,
          title: 'Abschnitt 1',
          orderIndex: 0,
          color: '#3b82f6',
          createdAt: '2025-11-13T10:30:00.000Z',
          
          // Pages in dieser Section
          pages: [
            {
              id: 1,
              title: 'Seite 1',
              parentPageId: null,
              content: {
                type: 'doc',
                content: [/* TipTap JSON */]
              },
              orderIndex: 0,
              isFavorite: false,
              createdAt: '2025-11-13T10:30:00.000Z',
              updatedAt: '2025-11-13T10:30:00.000Z',
              
              // Tags für diese Page
              tags: [
                { id: 1, name: 'wichtig', color: '#ef4444' }
              ],
              
              // Attachments als Base64
              attachments: [
                {
                  id: 1,
                  filename: 'bild.jpg',
                  mimeType: 'image/jpeg',
                  fileSize: 123456,
                  data: 'base64EncodedData...',
                  createdAt: '2025-11-13T10:30:00.000Z'
                }
              ],
              
              // Unterseiten
              subpages: [
                {
                  id: 2,
                  title: 'Unterseite 1.1',
                  parentPageId: 1,
                  content: { /* ... */ },
                  // ... weitere Felder
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  
  // Globale Tags
  tags: [
    { id: 1, name: 'wichtig', color: '#ef4444', createdAt: '2025-11-13T10:30:00.000Z' },
    { id: 2, name: 'todo', color: '#f59e0b', createdAt: '2025-11-13T10:30:00.000Z' }
  ],
  
  // App-Einstellungen
  settings: {
    theme: 'light',
    defaultNotebook: 1,
    autoSaveInterval: 2000
  }
};

// ========================================
// .mrbook Format (Einzelnes Notebook)
// ========================================
const mrbookStructure = {
  fileFormat: 'MRBook',
  version: '1.0.0',
  exportedAt: '2025-11-13T10:30:00.000Z',
  
  // Notebook-Metadaten
  notebook: {
    id: 1, // Optional bei Import (neue ID generieren)
    title: 'Mein Notizbuch',
    description: 'Beschreibung',
    color: '#2563eb',
    icon: 'book',
    createdAt: '2025-11-13T10:30:00.000Z',
    updatedAt: '2025-11-13T10:30:00.000Z'
  },
  
  // Sections
  sections: [
    {
      id: 1,
      title: 'Abschnitt 1',
      orderIndex: 0,
      color: '#3b82f6',
      createdAt: '2025-11-13T10:30:00.000Z',
      
      pages: [
        {
          id: 1,
          title: 'Seite 1',
          parentPageId: null,
          content: { /* TipTap JSON */ },
          orderIndex: 0,
          isFavorite: false,
          tags: [
            { name: 'wichtig', color: '#ef4444' }
          ],
          attachments: [
            {
              filename: 'bild.jpg',
              mimeType: 'image/jpeg',
              data: 'base64...'
            }
          ],
          subpages: [ /* ... */ ]
        }
      ]
    }
  ]
};

// ========================================
// Export-Funktionen
// ========================================

// Kompletten Export (.mrnote)
async function exportAllAsFile() {
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
  
  // Für jedes Notebook die komplette Hierarchie laden
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
          // Tags für Page laden
          const pageTags = await db.pageTags.where('pageId').equals(page.id).toArray();
          const tags = await Promise.all(
            pageTags.map(pt => db.tags.get(pt.tagId))
          );
          
          // Attachments laden und zu Base64 konvertieren
          const attachments = await db.attachments.where('pageId').equals(page.id).toArray();
          const attachmentsData = await Promise.all(
            attachments.map(async (att) => ({
              filename: att.filename,
              mimeType: att.mimeType,
              fileSize: att.fileSize,
              data: await blobToBase64(att.blob),
              createdAt: att.createdAt
            }))
          );
          
          // Unterseiten laden
          const subpages = await db.pages.where('parentPageId').equals(page.id).toArray();
          
          return {
            ...page,
            tags,
            attachments: attachmentsData,
            subpages: subpages // Rekursiv wenn nötig
          };
        }))
      };
      
      notebookData.sections.push(sectionData);
    }
    
    allData.notebooks.push(notebookData);
  }
  
  // Als .mrnote speichern
  const blob = new Blob([JSON.stringify(allData, null, 2)], { 
    type: 'application/json' 
  });
  downloadFile(blob, `mrnotes-backup-${Date.now()}.mrnote`);
}

// Einzelnes Notebook exportieren (.mrbook)
async function exportNotebookAsFile(notebookId) {
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
  
  // Sections und Pages laden (gleich wie oben)
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
  
  // Als .mrbook speichern
  const blob = new Blob([JSON.stringify(bookData, null, 2)], { 
    type: 'application/json' 
  });
  downloadFile(blob, `${notebook.title.replace(/[^a-z0-9]/gi, '_')}.mrbook`);
}

// ========================================
// Import-Funktionen
// ========================================

// .mrnote importieren
async function importMRNote(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  
  if (data.fileFormat !== 'MRNotes') {
    throw new Error('Ungültiges .mrnote Format');
  }
  
  // Globale Tags importieren
  for (const tag of data.tags) {
    await db.tags.add(tag);
  }
  
  // Notebooks mit kompletter Hierarchie importieren
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
        
        // Tags verknüpfen
        for (const tag of pageData.tags) {
          await db.pageTags.add({ pageId, tagId: tag.id });
        }
        
        // Attachments importieren (Base64 → Blob)
        for (const att of pageData.attachments) {
          const blob = await base64ToBlob(att.data, att.mimeType);
          await db.attachments.add({
            pageId,
            filename: att.filename,
            blob,
            fileSize: att.fileSize,
            mimeType: att.mimeType,
            createdAt: att.createdAt
          });
        }
      }
    }
  }
  
  console.log('✅ .mrnote erfolgreich importiert');
}

// .mrbook importieren
async function importMRBook(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  
  if (data.fileFormat !== 'MRBook') {
    throw new Error('Ungültiges .mrbook Format');
  }
  
  // Notebook erstellen
  const notebookId = await db.notebooks.add({
    title: data.notebook.title,
    description: data.notebook.description,
    color: data.notebook.color,
    icon: data.notebook.icon,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Sections und Pages importieren (analog zu .mrnote)
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
      
      // Tags importieren (erstellen falls nicht vorhanden)
      for (const tagData of pageData.tags) {
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
      
      // Attachments
      for (const att of pageData.attachments) {
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
  
  console.log('✅ .mrbook erfolgreich importiert');
}

// ========================================
// Hilfsfunktionen
// ========================================

async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function getSettings() {
  const settings = {};
  const allSettings = await db.settings.toArray();
  allSettings.forEach(s => settings[s.key] = s.value);
  return settings;
}
```

### 4.4 Dateiformate - Zusammenfassung

| Format | Verwendung | Inhalt |
|--------|-----------|---------|
| `.mrnote` | Komplettes Backup | Alle Notebooks, Sections, Pages, Tags, Settings |
| `.mrbook` | Einzelnes Notebook teilen | Ein Notebook mit allen Sections & Pages |

**Vorteile:**
- ✅ Menschenlesbar (JSON mit Formatierung)
- ✅ Einfach zu teilen (Drag & Drop)
- ✅ Versionierbar (Git-kompatibel)
- ✅ Plattformübergreifend
- ✅ Attachments embedded (Base64)

---

## 5. Projektphasen und Zeitplan

### Phase 1: MVP (3-4 Wochen)
**Woche 1-2: Setup & Grundgerüst**
- [ ] Vite + React Projekt-Setup
- [ ] IndexedDB Schema erstellen (Dexie.js)
- [ ] Basis-UI-Layout (Sidebar, Navigation)
- [ ] PWA Setup (Service Worker, Manifest)

**Woche 3-4: Kernfunktionen**
- [ ] CRUD für Notizbücher, Abschnitte, Seiten (IndexedDB)
- [ ] Rich-Text-Editor integrieren (TipTap)
- [ ] Hierarchie-Navigation implementieren
- [ ] Basis-Formatierungen
- [ ] Auto-Save (lokal)

**Optional: Erweiterte MVP-Features**
- [ ] Bilder-Upload (als Blobs in IndexedDB)
- [ ] Lokale Suche (Fuse.js)
- [ ] Tags-System
- [ ] Drag & Drop für Reorganisation
- [ ] Export/Import (.mrnote & .mrbook Dateien)

### Phase 2: Erweiterte Features (3-4 Wochen)
- [ ] Dateianhänge (Blobs in IndexedDB)
- [ ] Tabellen-Editor
- [ ] Checklisten mit Interaktivität
- [ ] Export-Funktionen (PDF via jsPDF, Markdown, HTML, .mrnote, .mrbook)
- [ ] Import von Markdown/.mrnote/.mrbook
- [ ] Erweiterte Suche mit Filtern
- [ ] Keyboard-Shortcuts
- [ ] Versionsverlauf (lokal gespeichert)
- [ ] Drag & Drop für .mrbook Import

### Phase 3: PWA & Offline (2-3 Wochen)
- [ ] Service Worker Optimierung
- [ ] Offline-Funktionalität testen
- [ ] App-Installation (Desktop/Mobile)
- [ ] Cache-Strategien
- [ ] Background-Sync (für spätere Cloud-Sync vorbereiten)
- [ ] Push-Benachrichtigungen (optional)

### Phase 4: Polish & UX (2-3 Wochen)
- [ ] Responsive Design optimieren
- [ ] Performance-Optimierung (Virtual Scrolling)
- [ ] Themes (Dark Mode, Custom)
- [ ] Accessibility (WCAG)
- [ ] Onboarding/Tutorial
- [ ] Datenmigrations-Tool
- [ ] Speicher-Management (Warnung bei > 80% voll)

**Zukünftig (Optional):**
- [ ] Cloud-Sync als opt-in Feature (Firebase/Supabase)
- [ ] Geräte-Übergreifende Synchronisation
- [ ] Sharing-Funktionen (via Export/Link)

---

## 6. Architektur-Übersicht (Client-Side Only)

### 6.1 Frontend-Struktur (Vite + React)
```
/src
  /app
    /App.jsx (Haupt-Komponente)
    /routes.jsx (React Router)
  /components
    /ui (wiederverwendbare UI-Komponenten)
    /editor
      /TipTapEditor.jsx
      /Toolbar.jsx
    /notebooks
      /NotebookList.jsx
      /NotebookItem.jsx
    /sections
      /SectionList.jsx
      /SectionTree.jsx
    /pages
      /PageList.jsx
      /PageEditor.jsx
      /PageHeader.jsx
    /shared
      /Sidebar.jsx
      /Header.jsx
      /SearchBar.jsx
  /lib
    /db
      /database.js (Dexie.js Setup)
      /queries.js (Wiederverwendbare DB-Queries)
    /hooks
      /useNotebooks.js
      /usePages.js
      /useSearch.js
      /useAutoSave.js
    /utils
      /export.js
      /import.js
      /search.js
    /store
      /appStore.js (Zustand - UI State)
  /types
    /index.d.ts
  /assets
    /icons
    /images
  /styles
    /main.scss (Haupt-SCSS-Datei)
    /variables.scss (Farben, Breakpoints, etc.)
    /mixins.scss (SCSS Mixins)
    /components (Komponenten-spezifische Styles)
      /_button.scss
      /_sidebar.scss
      /_editor.scss
      /_notebook.scss
```

### 6.2 Service Worker Struktur
```
/public
  /sw.js (Service Worker für PWA)
  /manifest.json (PWA Manifest)
  /icons (App Icons verschiedene Größen)

// sw.js Beispiel
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('mrnotes-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles/main.css',
        '/bundle.js'
      ]);
    })
  );
});
```

---

## 7. Wichtige Features im Detail

### 7.1 Rich-Text-Editor (TipTap)
**Vorteile:**
- Headless, sehr flexibel
- Prosemirror-basiert (wie in Notion, Atlassian)
- Extensible mit Plugins
- Kollaborations-Support eingebaut

**Extensions:**
- StarterKit (Basis-Formatierung)
- Image, Table, Code Block
- TaskList (Checklisten)
- Highlight, TextAlign
- Link, Mention
- Collaboration (Yjs-basiert)

### 7.2 Lokale Suche
**Client-Side Suche (ohne Server):**
```javascript
// Option 1: Fuse.js (Fuzzy Search)
import Fuse from 'fuse.js';

const pages = await db.pages.toArray();
const fuse = new Fuse(pages, {
  keys: ['title', 'content.text'], // Durchsuchbare Felder
  threshold: 0.3, // Wie "fuzzy" die Suche sein soll
  includeScore: true
});

const results = fuse.search('suchwort');

// Option 2: MiniSearch (Volltext-Index)
import MiniSearch from 'minisearch';

const miniSearch = new MiniSearch({
  fields: ['title', 'content'], // Felder zum Durchsuchen
  storeFields: ['title', 'id'], // Felder zum Zurückgeben
  searchOptions: {
    boost: { title: 2 }, // Titel höher gewichten
    fuzzy: 0.2
  }
});

// Indexieren
const allPages = await db.pages.toArray();
await miniSearch.addAll(allPages);

// Suchen
const results = miniSearch.search('notiz', {
  filter: (result) => !result.deletedAt // Gelöschte ausschließen
});
```

**Such-Features:**
- Suche in: Titel, Content, Tags
- Filter: Notebook, Section, Datum, Favoriten
- Autosuggest (während Tippen)
- Keyboard-Navigation (↑↓ Enter)

### 7.3 Offline-First Design (PWA)
**Lokale Daten - Keine Server nötig:**
- Alle Daten in IndexedDB
- Service Worker für App-Caching
- Funktioniert komplett ohne Internet
- Installation als Desktop/Mobile App möglich

**Auto-Save Strategie:**
```javascript
// Debounced Auto-Save
import { debounce } from 'lodash';

const autoSave = debounce(async (pageId, content) => {
  await db.pages.update(pageId, {
    content,
    updatedAt: new Date()
  });
  console.log('✅ Automatisch gespeichert');
}, 2000); // 2 Sekunden nach letzter Eingabe

// Im Editor
editor.on('update', ({ editor }) => {
  const content = editor.getJSON();
  autoSave(currentPageId, content);
});
```

**Conflict-Resolution (für späteren Cloud-Sync):**
- Last-Write-Wins (einfach)
- Versionsvergleich (advanced)
- Manuelle Konfliktauflösung (UI)

### 7.4 Offline-Support (PWA)
- Service Worker für Caching
- IndexedDB für lokale Datenhaltung
- Sync-Queue für Offline-Änderungen
- Conflict-Resolution beim Reconnect

---

## 8. Lokale Datensicherheit

### 8.1 Keine Authentifizierung nötig
- Daten bleiben auf dem Gerät
- Browser isoliert Daten pro Domain
- Kein Login/Registrierung erforderlich
- Optional: Browser-Passwort für App-Lock

### 8.2 Datensicherheit
- **HTTPS erzwingen** (wichtig für PWA)
- **Input-Sanitization** (XSS-Schutz im Editor)
- **File-Upload-Validierung** (Typ, Größe)
- **Content Security Policy** (CSP Header)

### 8.3 Backup-Strategie
**User-verantwortliche Backups:**
```javascript
// Automatischer Export-Reminder
setInterval(() => {
  const lastBackup = localStorage.getItem('lastBackup');
  const daysSinceBackup = (Date.now() - lastBackup) / (1000 * 60 * 60 * 24);
  
  if (daysSinceBackup > 7) {
    showNotification('💾 Backup empfohlen!', 'Letzte Sicherung vor 7+ Tagen');
  }
}, 1000 * 60 * 60); // Stündlich prüfen

// Export-Funktionen
async function createBackup() {
  const allData = {
    notebooks: await db.notebooks.toArray(),
    sections: await db.sections.toArray(),
    pages: await db.pages.toArray(),
    tags: await db.tags.toArray(),
    attachments: await db.attachments.toArray()
  };
  
  downloadJSON(allData, `backup-${Date.now()}.json`);
  localStorage.setItem('lastBackup', Date.now());
}
```

**Export-Formate:**
- `.mrnote` (komplette Datenbank)
- `.mrbook` (einzelnes Notebook)
- JSON (kompatibel mit älteren Versionen)
- Markdown (nur Text, für jede Page einzeln)
- HTML (mit Styling)
- ZIP (Markdown + Bilder)

---

## 9. UI/UX-Konzept

### 9.1 Layout
```
┌─────────────────────────────────────────────────────┐
│  Header (Logo, Search, User-Menu)                   │
├──────────┬─────────────┬────────────────────────────┤
│          │             │                            │
│ Notebook │  Sections   │   Page Content             │
│ List     │  & Pages    │                            │
│          │             │   [Rich Text Editor]       │
│ + New    │  Section 1  │                            │
│ 📘 NB1   │  ├─ Page 1  │                            │
│ 📗 NB2   │  └─ Page 2  │                            │
│          │  Section 2  │                            │
│          │  ├─ Page 3  │                            │
│          │  │  └─Sub 1 │                            │
│          │             │                            │
│          │  + New Page │                            │
└──────────┴─────────────┴────────────────────────────┘
```

### 9.2 Design-Prinzipien
- **Minimalistisch:** Fokus auf Inhalt
- **Intuitiv:** Vertraute Patterns (ähnlich OneNote/Notion)
- **Schnell:** Optimistische Updates, Lazy Loading
- **Zugänglich:** Keyboard-Navigation, Screen-Reader-Support

### 9.3 Farb- & Icon-System
- Custom-Colors für Notebooks und Sections
- Icon-Library: Lucide Icons oder Heroicons
- Dark Mode / Light Mode
- High-Contrast-Option

---

## 10. Performance-Optimierung

### 10.1 Frontend
- Code-Splitting (Next.js automatisch)
- Image-Optimization (Next.js Image)
- Virtual Scrolling für lange Listen
- Debouncing für Autosave
- Lazy Loading für Komponenten

### 10.2 Client-Side Performance
- **IndexedDB Optimierung:**
  - Compound Indexes für häufige Queries
  - Lazy Loading von großen Blobs
  - Pagination für lange Listen
- **Caching:**
  - Service Worker Cache für Assets
  - Memory-Cache für aktuelle Page
  - LocalStorage für Settings
- **Bundle-Optimierung:**
  - Code-Splitting (React.lazy)
  - Tree-Shaking
  - Vite's optimiertes Bundling

### 10.3 Monitoring & Debugging
- **Browser DevTools:**
  - Application Tab → IndexedDB Inspector
  - Performance Tab → Profiling
  - Network Tab → Cache Überprüfung
- **Error-Tracking (optional):**
  - Sentry (Client-Side only)
  - Console.log strategisch einsetzen
- **Storage Monitoring:**
  - `navigator.storage.estimate()` für Speicher-Info
  - Warnung bei > 80% voll

---

## 11. Testing-Strategie

### 11.1 Unit-Tests
- **Frontend:** Jest + React Testing Library
- **Backend:** Jest + Supertest
- Ziel: 80%+ Code-Coverage

### 11.2 Integration-Tests
- IndexedDB Operationen
- Export/Import Flow (.mrnote & .mrbook)
- File-Upload und Blob-Handling
- Search-Funktionalität
- Base64 Konvertierung (Attachments)

### 11.3 E2E-Tests
- **Tool:** Playwright oder Cypress
- Kritische User-Flows:
  - App öffnen & Installation (PWA)
  - Notebook/Page erstellen
  - Inhalt bearbeiten & Auto-Save
  - Bild hochladen
  - Suche
  - Export (.mrnote & .mrbook)
  - Import (Drag & Drop .mrbook)
  - Offline-Modus testen

---

## 12. Zukünftige Erweiterungen (Optional)

### 12.1 Cloud-Sync als Add-On
**Opt-In Feature (später hinzufügbar):**
- Firebase/Supabase Integration
- Geräte-übergreifende Synchronisation
- User-Account optional
- Lokale Daten bleiben primär

### 12.2 Freemium-Modell (mit Cloud-Sync)
**Free Tier (Lokal):**
- Unbegrenzte Notizbücher
- Unbegrenzter Speicher (Browser-Limit)
- Alle Basis-Features
- Kein Account nötig

**Pro Tier ($3-5/Monat) - mit Cloud:**
- Cloud-Synchronisation
- Mehrere Geräte
- 10 GB Cloud-Storage
- Automatische Backups
- Web-Zugriff von überall

**Team Tier ($15-20/Monat):**
- Alles aus Pro
- Echtzeit-Kollaboration
- Sharing-Funktionen
- Team-Berechtigung
- Priority-Support

### 12.3 Self-Hosted Option
- Open Source Kern bleibt kostenlos
- Sync-Server optional selbst hosten
- Docker-Container bereitstellen

---

## 13. Nächste Schritte

### 13.1 Sofort starten
1. **Repository erstellen** (GitHub/GitLab)
2. **Vite + React Setup**
   ```bash
   npm create vite@latest mrnotes -- --template react
   cd mrnotes
   npm install
   ```
3. **Dependencies installieren:**
   ```bash
   npm install dexie @tiptap/react @tiptap/starter-kit
   npm install zustand fuse.js lucide-react
   npm install -D sass
   ```
4. **IndexedDB Schema** implementieren
5. **Basis-Layout** erstellen

### 13.2 Entscheidungen (Empfehlungen)
- ✅ **Framework:** Vite + React (schnell, lightweight)
- ✅ **Datenbank:** IndexedDB via Dexie.js
- ✅ **Editor:** TipTap
- ✅ **Hosting:** Firebase Hosting (kostenlos)
- ✅ **UI:** shadcn/ui + Tailwind CSS
- ✅ **Projektname:** MRNotes ✓

### 13.3 Ressourcen
- **Dexie.js:** https://dexie.org
- **TipTap:** https://tiptap.dev
- **shadcn/ui:** https://ui.shadcn.com
- **Vite:** https://vitejs.dev
- **PWA Guide:** https://web.dev/progressive-web-apps/
- **IndexedDB Guide:** https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

---

## 14. Inspiration & Referenzen

### Client-Side Alternativen (Open Source)
- **Joplin:** Markdown-basiert, Desktop & Mobile, Sync optional
- **Standard Notes:** Privacy-fokussiert, verschlüsselt
- **Trilium Notes:** Hierarchisch, sehr feature-reich, selbst-gehostet
- **Obsidian:** Markdown, lokale Dateien, Community-Plugins
- **Logseq:** Outliner-Style, lokale Markdown-Dateien
- **Notesnook:** Privacy-first, encrypted, optional Cloud

### Technische Referenzen
- **PouchDB:** Weitere IndexedDB-Alternative mit Sync-Features
- **LocalForage:** Vereinfachte Storage API (localStorage-like)
- **Workbox:** Google's PWA Toolkit für Service Worker

### Kommerzielle Alternativen (zum Vergleichen)
- Microsoft OneNote (Online + Offline)
- Notion (hauptsächlich online)
- Evernote (Sync-fokussiert)
- Apple Notes (iCloud-Sync)

---

## Fazit

Die Entwicklung einer **client-side OneNote-Alternative** ist ideal für:

✅ **Vorteile:**
1. **Privacy:** Daten bleiben auf dem Gerät
2. **Kostenlos:** Kein Server nötig → keine Hosting-Kosten
3. **Offline-First:** Funktioniert immer, auch ohne Internet
4. **Schnell:** Keine Netzwerk-Latenz
5. **Einfach:** Weniger Komplexität als Full-Stack
6. **PWA:** Installierbar als Desktop/Mobile App

⚠️ **Einschränkungen:**
1. Kein automatisches Backup (User-verantwortlich)
2. Keine geräteübergreifende Sync (initial)
3. Browser-Speicher-Limits (meist 50%+ verfügbar)
4. Keine Kollaboration (initial)

**Perfekt für:**
- Persönliche Notizen
- Kleine Teams (Export/Import-basiert teilen)
- Privacy-bewusste User
- Offline-Szenarien
- MVP zum schnellen Testen

**Später erweiterbar mit:**
- Optional Cloud-Sync (Firebase/Supabase)
- Sharing-Features
- Multi-Device-Support

**Nächster Schritt:** Vite-Projekt aufsetzen und mit IndexedDB starten! 🚀
