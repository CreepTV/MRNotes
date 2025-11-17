import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './lib/db/database';
import { useAppStore } from './lib/store/appStore';
import Sidebar from './components/shared/Sidebar';
import Header from './components/shared/Header';
import NotebookView from './components/notebooks/NotebookView';
import PageEditor from './components/pages/PageEditor';
import PageList from './components/pages/PageList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function AppContent({ selectedSectionId, setSelectedSectionId }) {
  const { sectionId } = useParams();
  const location = useLocation();
  const isPageEditorOpen = location.pathname.startsWith('/pages/');
  const [pagesSidebarWidth, setPagesSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [pagesSidebarOpen, setPagesSidebarOpen] = useState(true);

  // Sync selectedSectionId with URL
  useEffect(() => {
    if (sectionId) {
      setSelectedSectionId(parseInt(sectionId));
    }
  }, [sectionId, setSelectedSectionId]);

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const sidebarWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-width'));
      const newWidth = e.clientX - sidebarWidth;
      if (newWidth >= 200 && newWidth <= 600) {
        setPagesSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.classList.remove('is-resizing');
    };

    if (isResizing) {
      document.body.classList.add('is-resizing');
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Load pages for selected section
  const pages = useLiveQuery(
    () => {
      if (selectedSectionId) {
        return db.pages
          .where('sectionId')
          .equals(selectedSectionId)
          .sortBy('orderIndex');
      }
      return [];
    },
    [selectedSectionId]
  ) || [];

  return (
    <>
      <Sidebar 
        onSectionSelect={setSelectedSectionId}
        selectedSectionId={selectedSectionId}
      />
      <Header />
      {selectedSectionId && (
        <>
          <button
            className="pages-sidebar__toggle"
            onClick={() => setPagesSidebarOpen(!pagesSidebarOpen)}
            data-has-page-editor={isPageEditorOpen ? 'true' : 'false'}
            data-open={pagesSidebarOpen ? 'true' : 'false'}
            title={pagesSidebarOpen ? 'Sidebar schließen' : 'Sidebar öffnen'}
          >
            <FontAwesomeIcon icon={pagesSidebarOpen ? faChevronLeft : faChevronRight} />
          </button>
          <div 
            className="pages-sidebar" 
            data-has-page-editor={isPageEditorOpen ? 'true' : 'false'}
            data-open={pagesSidebarOpen ? 'true' : 'false'}
            style={{ width: pagesSidebarOpen ? `${pagesSidebarWidth}px` : '0px' }}
          >
            <PageList
              sectionId={selectedSectionId}
              pages={pages}
              isOpen={pagesSidebarOpen}
              onToggle={() => setPagesSidebarOpen(!pagesSidebarOpen)}
            />
            {pagesSidebarOpen && (
              <div 
                className="pages-sidebar__resize-handle"
                onMouseDown={() => setIsResizing(true)}
              />
            )}
          </div>
        </>
      )}
      <div 
        className="app-content" 
        data-has-pages-sidebar={selectedSectionId ? 'true' : 'false'}
        style={{ marginLeft: selectedSectionId && pagesSidebarOpen ? `calc(var(--sidebar-width) + ${pagesSidebarWidth}px)` : 'var(--sidebar-width)' }}
      >
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/notebooks" replace />} />
            <Route path="/notebooks" element={<NotebookView />} />
            <Route path="/notebooks/:notebookId" element={<NotebookView />} />
            <Route path="/notebooks/:notebookId/sections/:sectionId" element={<NotebookView />} />
            <Route path="/pages/:pageId" element={<PageEditor />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const { sidebarOpen, theme } = useAppStore();

  useEffect(() => {
    // Initialize database
    const initDB = async () => {
      try {
        await db.open();
        console.log('✅ IndexedDB initialized');
        console.log('Database tables:', db.tables.map(t => t.name));
        
        // Check if we have any notebooks, if not create a demo one
        const count = await db.notebooks.count();
        console.log('Notebooks count:', count);
        
        if (count === 0) {
          console.log('Creating demo notebook...');
          await db.notebooks.add({
            title: 'Welcome to MRNotes',
            description: 'Your first notebook',
            color: '#2563eb',
            icon: 'book',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null
          });
          console.log('Demo notebook created!');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Failed to initialize IndexedDB:', error);
        setIsLoading(false);
      }
    };

    initDB();
  }, []);

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <p>Loading MRNotes...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-layout" data-theme={theme}>
        <AppContent 
          selectedSectionId={selectedSectionId}
          setSelectedSectionId={setSelectedSectionId}
        />
      </div>
    </Router>
  );
}

export default App;
