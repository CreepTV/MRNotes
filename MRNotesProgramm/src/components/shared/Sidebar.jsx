import { useState, useEffect } from 'react';
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
  faChevronDown,
  faTrash,
  faEllipsisV,
  faHome,
  faBars,
  faPalette,
  faLayerGroup,
  faFolderPlus
} from '@fortawesome/free-solid-svg-icons';
import InputModal from './InputModal';
import ConfirmModal from './ConfirmModal';
import ColorPickerModal from './ColorPickerModal';

export default function Sidebar({ onSectionSelect, selectedSectionId }) {
  const navigate = useNavigate();
  const { notebookId } = useParams();
  const { sidebarOpen, setSidebarOpen, theme, toggleTheme } = useAppStore();
  const [showMenu, setShowMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [expandedNotebooks, setExpandedNotebooks] = useState(new Set());
  const [showCreateSectionModal, setShowCreateSectionModal] = useState(null);
  const [draggedNotebook, setDraggedNotebook] = useState(null);
  const [draggedSection, setDraggedSection] = useState(null);
  const [dropTargetNotebook, setDropTargetNotebook] = useState(null);
  const [dropTargetSection, setDropTargetSection] = useState(null);

  const notebooks = useLiveQuery(async () => {
    const allNotebooks = await db.notebooks.toArray();
    return allNotebooks
      .filter(notebook => !notebook.deletedAt)
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }, []) || [];
  
  const favoritePages = useLiveQuery(
    () => db.pages.where('isFavorite').equals(1).limit(5).toArray(),
    []
  ) || [];

  const currentNotebookId = notebookId ? parseInt(notebookId) : null;

  const handleCreateNotebook = async (title) => {
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

  const handleDeleteNotebook = async () => {
    if (showDeleteModal) {
      await db.notebooks.update(showDeleteModal.id, { deletedAt: new Date() });
      setShowMenu(null);
      if (currentNotebookId === showDeleteModal.id) {
        navigate('/notebooks');
      }
      setShowDeleteModal(null);
    }
  };

  const handleColorSelected = async (color) => {
    if (showColorPicker) {
      await db.notebooks.update(showColorPicker.id, {
        color,
        updatedAt: new Date()
      });
      setShowColorPicker(null);
    }
  };

  const toggleNotebook = (notebookId) => {
    setExpandedNotebooks(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(notebookId)) {
        newExpanded.delete(notebookId);
      } else {
        newExpanded.add(notebookId);
      }
      return newExpanded;
    });
  };

  const handleCreateSection = async (title) => {
    if (title && showCreateSectionModal) {
      const sections = await db.sections.where('notebookId').equals(showCreateSectionModal).toArray();
      const maxOrder = sections.length > 0 ? Math.max(...sections.map(s => s.orderIndex || 0)) : -1;
      
      await db.sections.add({
        notebookId: showCreateSectionModal,
        title,
        orderIndex: maxOrder + 1,
        createdAt: new Date()
      });
      setShowCreateSectionModal(null);
    }
  };

  const handleNotebookDragStart = (e, notebook) => {
    setDraggedNotebook(notebook);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleNotebookDragOver = (e, targetNotebook) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (targetNotebook && draggedNotebook && draggedNotebook.id !== targetNotebook.id) {
      setDropTargetNotebook(targetNotebook.id);
    }
  };

  const handleNotebookDragLeave = () => {
    setDropTargetNotebook(null);
  };

  const handleNotebookDrop = async (e, targetNotebook) => {
    e.preventDefault();
    setDropTargetNotebook(null);
    if (!draggedNotebook || draggedNotebook.id === targetNotebook.id) return;

    const fromIndex = notebooks.findIndex(n => n.id === draggedNotebook.id);
    const toIndex = notebooks.findIndex(n => n.id === targetNotebook.id);

    const reordered = [...notebooks];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    // Update orderIndex in database
    for (let i = 0; i < reordered.length; i++) {
      await db.notebooks.update(reordered[i].id, { orderIndex: i });
    }

    setDraggedNotebook(null);
  };

  const handleSectionDragStart = (e, section) => {
    setDraggedSection(section);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSectionDragOver = (e, targetSection) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (targetSection && draggedSection && draggedSection.id !== targetSection.id) {
      setDropTargetSection(targetSection.id);
    }
  };

  const handleSectionDragLeave = () => {
    setDropTargetSection(null);
  };

  const handleSectionDrop = async (e, targetSection) => {
    e.preventDefault();
    setDropTargetSection(null);
    if (!draggedSection || draggedSection.id === targetSection.id) return;
    if (draggedSection.notebookId !== targetSection.notebookId) return;

    const sections = await db.sections.where('notebookId').equals(targetSection.notebookId).toArray();
    const fromIndex = sections.findIndex(s => s.id === draggedSection.id);
    const toIndex = sections.findIndex(s => s.id === targetSection.id);

    const reordered = [...sections];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);

    for (let i = 0; i < reordered.length; i++) {
      await db.sections.update(reordered[i].id, { orderIndex: i });
    }

    setDraggedSection(null);
  };

  // Load sections for all notebooks (we'll filter display by expandedNotebooks)
  const allSections = useLiveQuery(
    () => db.sections.orderBy('orderIndex').toArray(),
    []
  ) || [];

  return (
    <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : 'sidebar--closed'}`}>
      {/* Header */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <img 
            src={theme === 'dark' ? '/data/logo/MRNotes_Logo_Transparent.png' : '/data/logo/MRNotes_Logo_Blau_Transparent.png'} 
            alt="MRNotes Logo" 
            className="sidebar__logo-img" 
          />
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
          onClick={() => setShowCreateModal(true)}
          title="Neues Notizbuch"
        >
          <FontAwesomeIcon icon={faPlus} />
          {sidebarOpen && <span>Neu</span>}
        </button>
      </div>

      {/* Notebooks List */}
      <nav className="sidebar__nav">
        {sidebarOpen && <div className="sidebar__section-title">Notizbücher</div>}
        
        {notebooks.map(notebook => {
          const isExpanded = expandedNotebooks.has(notebook.id);
          const sections = allSections.filter(s => s.notebookId === notebook.id);
          
          return (
            <div 
              key={notebook.id}
              className={`sidebar__notebook ${currentNotebookId === notebook.id ? 'sidebar__notebook--active' : ''} ${isExpanded ? 'sidebar__notebook--expanded' : ''} ${dropTargetNotebook === notebook.id ? 'sidebar__notebook--drop-target' : ''}`}
              draggable={sidebarOpen}
              onDragStart={(e) => handleNotebookDragStart(e, notebook)}
              onDragOver={(e) => handleNotebookDragOver(e, notebook)}
              onDragLeave={handleNotebookDragLeave}
              onDrop={(e) => handleNotebookDrop(e, notebook)}
            >
              <div className="sidebar__notebook-header">
                {sidebarOpen && (
                  <button
                    className="sidebar__notebook-expand"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNotebook(notebook.id);
                    }}
                    title={isExpanded ? 'Einklappen' : 'Ausklappen'}
                  >
                    <FontAwesomeIcon icon={faChevronDown} />
                  </button>
                )}
                <button
                  className="sidebar__notebook-main"
                  onClick={() => {
                    navigate(`/notebooks/${notebook.id}`);
                    if (!sidebarOpen) {
                      setSidebarOpen(true);
                    }
                  }}
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
                )}
                {showMenu === notebook.id && (
                  <div className="sidebar__menu-dropdown">
                    <button
                      className="sidebar__menu-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCreateSectionModal(notebook.id);
                        setShowMenu(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faFolderPlus} />
                      <span>Neue Section</span>
                    </button>
                    <button
                      className="sidebar__menu-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowColorPicker({ id: notebook.id, color: notebook.color });
                        setShowMenu(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faPalette} />
                      <span>Farbe ändern</span>
                    </button>
                    <button
                      className="sidebar__menu-item sidebar__menu-item--danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteModal({ id: notebook.id, title: notebook.title });
                        setShowMenu(null);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      <span>Löschen</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Sections List */}
              {isExpanded && sidebarOpen && (
                <div className="sidebar__sections">
                  {sections.map(section => (
                    <button
                      key={section.id}
                      className={`sidebar__section ${selectedSectionId === section.id ? 'sidebar__section--active' : ''} ${dropTargetSection === section.id ? 'sidebar__section--drop-target' : ''}`}
                      draggable
                      onDragStart={(e) => handleSectionDragStart(e, section)}
                      onDragOver={(e) => handleSectionDragOver(e, section)}
                      onDragLeave={handleSectionDragLeave}
                      onDrop={(e) => handleSectionDrop(e, section)}
                      onClick={() => {
                        onSectionSelect(section.id);
                        navigate(`/notebooks/${notebook.id}/sections/${section.id}`);
                      }}
                      title={section.title}
                    >
                      <FontAwesomeIcon icon={faLayerGroup} className="sidebar__section-icon" />
                      <span className="sidebar__section-title">{section.title}</span>
                    </button>
                  ))}
                  
                  {/* Drop zone at the end for sections */}
                  {draggedSection && draggedSection.notebookId === notebook.id && (
                    <div 
                      className={`sidebar__drop-zone sidebar__drop-zone--small ${dropTargetSection === `end-${notebook.id}` ? 'sidebar__drop-zone--active' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDropTargetSection(`end-${notebook.id}`);
                      }}
                      onDragLeave={handleSectionDragLeave}
                      onDrop={async (e) => {
                        e.preventDefault();
                        setDropTargetSection(null);
                        if (!draggedSection || draggedSection.notebookId !== notebook.id) return;
                        
                        // Move to end
                        const allSections = await db.sections.where('notebookId').equals(notebook.id).toArray();
                        const reordered = allSections.filter(s => s.id !== draggedSection.id);
                        reordered.push(draggedSection);
                        
                        for (let i = 0; i < reordered.length; i++) {
                          await db.sections.update(reordered[i].id, { orderIndex: i });
                        }
                        
                        setDraggedSection(null);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
            );
          })}
        
        {/* Drop zone at the end for notebooks */}
        {draggedNotebook && sidebarOpen && (
          <div 
            className={`sidebar__drop-zone ${dropTargetNotebook === 'end' ? 'sidebar__drop-zone--active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDropTargetNotebook('end');
            }}
            onDragLeave={handleNotebookDragLeave}
            onDrop={async (e) => {
              e.preventDefault();
              setDropTargetNotebook(null);
              if (!draggedNotebook) return;
              
              // Move to end
              const reordered = notebooks.filter(n => n.id !== draggedNotebook.id);
              reordered.push(draggedNotebook);
              
              for (let i = 0; i < reordered.length; i++) {
                await db.notebooks.update(reordered[i].id, { orderIndex: i });
              }
              
              setDraggedNotebook(null);
            }}
          />
        )}
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

      {/* Modals */}
      <InputModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateNotebook}
        title="Neues Notizbuch"
        label="Notizbuch Name"
        placeholder="Mein Notizbuch"
        submitText="Erstellen"
        cancelText="Abbrechen"
      />

      <InputModal
        isOpen={!!showCreateSectionModal}
        onClose={() => setShowCreateSectionModal(null)}
        onSubmit={handleCreateSection}
        title="Neue Section"
        label="Section Name"
        placeholder="Meine Section"
        submitText="Erstellen"
        cancelText="Abbrechen"
      />

      <ConfirmModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={handleDeleteNotebook}
        title="Notizbuch löschen?"
        message={`Möchtest du das Notizbuch "${showDeleteModal?.title}" wirklich löschen? Alle enthaltenen Seiten werden ebenfalls gelöscht.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        type="danger"
      />

      <ColorPickerModal
        isOpen={!!showColorPicker}
        onClose={() => setShowColorPicker(null)}
        onColorSelect={handleColorSelected}
        currentColor={showColorPicker?.color || '#2563eb'}
        title="Notizbuch Farbe wählen"
      />
    </aside>
  );
}
