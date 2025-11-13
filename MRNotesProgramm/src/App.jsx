import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { db } from './lib/db/database';
import { useAppStore } from './lib/store/appStore';
import Sidebar from './components/shared/Sidebar';
import Header from './components/shared/Header';
import NotebookView from './components/notebooks/NotebookView';
import PageEditor from './components/pages/PageEditor';

function App() {
  const [isLoading, setIsLoading] = useState(true);
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
        <Sidebar />
        <div className="app-content">
          <Header />
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
      </div>
    </Router>
  );
}

export default App;
