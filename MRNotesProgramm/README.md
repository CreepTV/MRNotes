# MRNotes - Your Personal Notebook

Eine moderne, client-seitige Notizbuch-Anwendung mit Rich-Text-Editor, Offline-Unterstützung und umfassenden Organisations-Features.

## 🚀 Features

### Kernfunktionalität
- ✅ **Notebooks & Sections**: Organisiere deine Notizen in Notizbüchern und Sektionen
- ✅ **Rich Text Editor**: TipTap-basierter Editor mit umfangreichen Formatierungsoptionen
  - Fettdruck, Kursiv, Durchgestrichen, Code
  - Überschriften (H1-H3)
  - Listen (Aufzählung, Nummerierung, Aufgaben)
  - Tabellen, Links, Bilder
  - Text-Ausrichtung, Blockquotes, Hervorhebungen
- ✅ **Auto-Save**: Automatisches Speichern alle 2 Sekunden
- ✅ **Favoriten**: Markiere wichtige Seiten für schnellen Zugriff (max. 5)
- ✅ **Suche**: Echtzeit-Volltextsuche mit Fuse.js
- ✅ **Dark Mode**: Umschaltbares helles/dunkles Theme

### Datenverwaltung
- ✅ **IndexedDB**: Lokale Datenbank mit Dexie.js
- ✅ **Export/Import**: 
  - `.mrnote` - Vollständiges Backup aller Notizbücher
  - `.mrbook` - Einzelnes Notizbuch exportieren
  - `.md` - Einzelne Seite als Markdown
- ✅ **Tags**: Organisiere Seiten mit Tags (Backend fertig, UI offen)
- ✅ **Attachments**: Unterstützung für Dateianhänge (Backend fertig, UI offen)

### PWA-Funktionen
- ✅ **Offline-Unterstützung**: Service Worker für Offline-Zugriff
- ✅ **Installierbar**: Als App auf Desktop/Mobile installierbar
- ✅ **Responsive**: Optimiert für alle Bildschirmgrößen

## 📦 Technologie-Stack

- **Frontend**: React 18 + Vite
- **Styling**: SCSS/SASS (modular)
- **State Management**: Zustand
- **Database**: IndexedDB + Dexie.js
- **Rich Text**: TipTap Editor
- **Search**: Fuse.js (fuzzy search)
- **Icons**: Lucide React
- **Router**: React Router v6

## 🛠️ Installation & Setup

### Voraussetzungen
- Node.js 16+ 
- npm oder yarn

### Schritte

1. **Dependencies installieren**
```bash
npm install
```

2. **Development Server starten**
```bash
npm run dev
```

3. **App öffnen**
- Öffne http://localhost:5173 im Browser
- Ein Demo-Notizbuch wird automatisch erstellt beim ersten Start

4. **PWA Icons generieren (optional)**
- Öffne `generate-icons.html` im Browser
- Die Icons werden automatisch heruntergeladen
- Benenne sie um zu `icon-192.png` und `icon-512.png`
- Verschiebe sie in den `public/` Ordner

## 📁 Projektstruktur

```
MRNotesProgramm/
├── public/
│   ├── manifest.json          # PWA Manifest
│   ├── sw.js                  # Service Worker
│   ├── icon-192.svg          # App Icon (SVG Fallback)
│   └── icon-512.svg          # App Icon (SVG Fallback)
├── src/
│   ├── components/
│   │   ├── editor/            # TipTap Editor & Toolbar
│   │   ├── notebooks/         # Notebook Verwaltung
│   │   ├── pages/             # Seiten & Editor
│   │   ├── sections/          # Section Verwaltung
│   │   └── shared/            # Header, Sidebar, ImportExport
│   ├── lib/
│   │   ├── db/                # IndexedDB Schema (Dexie)
│   │   ├── hooks/             # Custom React Hooks
│   │   ├── store/             # Zustand State Management
│   │   └── utils/             # Export/Import Utilities
│   ├── styles/
│   │   ├── components/        # Component Styles
│   │   ├── variables.scss     # SCSS Variablen
│   │   ├── mixins.scss        # SCSS Mixins
│   │   └── main.scss          # Main Stylesheet
│   ├── App.jsx                # Main App Component
│   └── main.jsx               # Entry Point
├── index.html
├── package.json
└── vite.config.js
```

## 🧪 Testing Guide

### 1. Basis-Funktionalität
- [ ] App lädt erfolglich ohne Fehler
- [ ] Demo-Notizbuch wird beim ersten Start erstellt
- [ ] Dark Mode Toggle funktioniert

### 2. Notebook Verwaltung
- [ ] Neues Notizbuch erstellen
- [ ] Notizbuch umbenennen
- [ ] Notizbuch löschen
- [ ] Zwischen Notizbüchern wechseln

### 3. Section Verwaltung
- [ ] Neue Section erstellen
- [ ] Section löschen (inkl. enthaltene Seiten)
- [ ] Zwischen Sections wechseln

### 4. Seiten Verwaltung
- [ ] Neue Seite erstellen
- [ ] Seite bearbeiten (Titel + Inhalt)
- [ ] Seite löschen
- [ ] Seite als Favorit markieren/entfernen
- [ ] Auto-Save nach 2 Sekunden testen

### 5. Rich Text Editor
- [ ] Fettdruck, Kursiv, Durchgestrichen
- [ ] Überschriften (H1, H2, H3)
- [ ] Listen (Aufzählung, Nummerierung, Aufgaben)
- [ ] Code-Block, Blockquote
- [ ] Tabelle einfügen (3x3)
- [ ] Link einfügen
- [ ] Bild einfügen (URL)
- [ ] Text-Ausrichtung
- [ ] Highlight/Marker
- [ ] Undo/Redo

### 6. Suche
- [ ] Suchbegriff eingeben
- [ ] Suchergebnisse werden angezeigt
- [ ] Auf Suchergebnis klicken navigiert zur Seite
- [ ] Suche löschen

### 7. Export/Import
- [ ] "Export All" erstellt .mrnote Datei
- [ ] "Export Notebook" erstellt .mrbook Datei
- [ ] Export-Button auf Seite erstellt .md Datei
- [ ] .mrnote Import lädt alle Notizbücher
- [ ] .mrbook Import lädt einzelnes Notizbuch
- [ ] .md Import erstellt neue Seite

### 8. PWA Funktionalität
- [ ] Service Worker registriert sich (Console)
- [ ] App funktioniert offline
- [ ] "Install App" Option erscheint
- [ ] App kann installiert werden

### 9. Favoriten
- [ ] Favoriten erscheinen in Sidebar
- [ ] Max. 5 Favoriten
- [ ] Favorit-Status überlebt Reload

### 10. Responsive Design
- [ ] Desktop (1920x1080)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

## 🐛 Bekannte Probleme

### SCSS Deprecation Warnings
- **Status**: Nicht kritisch, App funktioniert normal
- **Lösung**: In Zukunft zu `@use`/`@forward` migrieren

### Icons
- SVG Icons als Fallback vorhanden
- PNG Icons mit `generate-icons.html` erstellen

## 🔄 Build für Production

```bash
npm run build    # Build erstellen
npm run preview  # Build testen
```

Build-Dateien: `dist/` Ordner

## 📝 Nächste Schritte (Optional)

- Tags UI (Tag-Filter, Farben)
- Subpages UI (Tree-View)
- Drag & Drop
- Settings Modal
- Attachment UI
- Markdown Preview
- Keyboard Shortcuts
- Note Versioning

## 📄 Lizenz

MIT
