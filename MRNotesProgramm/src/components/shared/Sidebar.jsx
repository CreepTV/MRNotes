import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db/database';
import { useAppStore } from '../../lib/store/appStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faPlus, 
  faStar, 
  faMoon, 
  faSun,
  faChevronLeft,
  faChevronRight,
  faTrash,
  faEllipsisV,
  faHome,
  faBars
} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar() {
  const navigate = useNavigate();
  const { notebookId } = useParams();
  const { sidebarOpen, setSidebarOpen, theme, toggleTheme } = useAppStore();
  const [showMenu, setShowMenu] = useState(null);

  const notebooks = useLiveQuery(() => 
    db.notebooks.filter(notebook => !notebook.deletedAt).toArray(), 
    []
  ) || [];
  
  const favoritePages = useLiveQuery(
    () => db.pages.where('isFavorite').equals(1).limit(5).toArray(),
    []
  ) || [];

  const currentNotebookId = notebookId ? parseInt(notebookId) : null;

  const handleCreateNotebook = async () => {
    const title = prompt('Notebook Name:');
    if (title) {
      const colors = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#be185d'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const id = await db.notebooks.add({
        title,
        color: randomColor,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      });
      navigate(`/notebooks/${id}`);
    }
  };

  const handleDeleteNotebook = async (id, e) => {
    e.stopPropagation();
    if (confirm('Notebook löschen?')) {
      await db.notebooks.update(id, { deletedAt: new Date() });
      setShowMenu(null);
      if (currentNotebookId === id) {
        navigate('/notebooks');
      }
    }
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
      {/* Header */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <FontAwesomeIcon icon={faBook} className="sidebar__logo-icon" />
          {sidebarOpen && <span className="sidebar__logo-text">MRNotes</span>}
        </div>
        <button 
          className="sidebar__toggle" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Seitenleiste schließen' : 'Seitenleiste öffnen'}
        >
          <FontAwesomeIcon icon={sidebarOpen ? faChevronLeft : faChevronRight} />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="sidebar__actions">
        <button 
          className="btn btn--primary btn--block btn--compact"
          onClick={handleCreateNotebook}
          title="Neues Notizbuch"
        >
          <FontAwesomeIcon icon={faPlus} />
          {sidebarOpen && <span>Neu</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {sidebarOpen && <div className="sidebar__section-title">Navigation</div>}
        
        <button 
          className="sidebar__nav-item"
          onClick={() => navigate('/notebooks')}
          title="Alle Notizbücher"
        >
          <FontAwesomeIcon icon={faHome} className="sidebar__nav-icon" />
          {sidebarOpen && <span>Startseite</span>}
        </button>

        {favoritePages.length > 0 && (
          <>
            {sidebarOpen && <div className="sidebar__section-title">Favoriten</div>}
            {favoritePages.map(page => (
              <button
                key={page.id}
                className="sidebar__nav-item sidebar__nav-item--favorite"
                onClick={() => navigate(`/pages/${page.id}`)}
                title={page.title}
              >
                <FontAwesomeIcon icon={faStar} className="sidebar__nav-icon sidebar__nav-icon--star" />
                {sidebarOpen && <span className="sidebar__nav-text">{page.title}</span>}
              </button>
            ))}
          </>
        )}

        {/* Notebooks List */}
        {sidebarOpen && <div className="sidebar__section-title">Notizbücher</div>}
        <div className="sidebar__notebooks">
          {notebooks.map(notebook => (
            <div 
              key={notebook.id}
              className={`sidebar__notebook ${currentNotebookId === notebook.id ? 'sidebar__notebook--active' : ''}`}
            >
              <button
                className="sidebar__notebook-main"
                onClick={() => navigate(`/notebooks/${notebook.id}`)}
                title={notebook.title}
              >
                <div 
                  className="sidebar__notebook-icon-wrapper"
                  style={{ backgroundColor: notebook.color || '#2563eb' }}
                >
                  <FontAwesomeIcon icon={faBook} className="sidebar__notebook-icon" />
                </div>
                {sidebarOpen && <span className="sidebar__notebook-title">{notebook.title}</span>}
              </button>
              {sidebarOpen && (
                <div className="sidebar__notebook-actions">
                  <button
                    className="sidebar__notebook-menu"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(showMenu === notebook.id ? null : notebook.id);
                    }}
                    title="Aktionen"
                  >
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>
                  {showMenu === notebook.id && (
                    <div className="sidebar__menu-dropdown">
                      <button
                        className="sidebar__menu-item sidebar__menu-item--danger"
                        onClick={(e) => handleDeleteNotebook(notebook.id, e)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Löschen</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar__footer">
        <button 
          className="sidebar__theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Heller Modus' : 'Dunkler Modus'}
        >
          <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
          {sidebarOpen && <span>{theme === 'dark' ? 'Hell' : 'Dunkel'}</span>}
        </button>
      </div>
    </aside>
  );
}
