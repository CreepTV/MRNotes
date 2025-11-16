import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFile,
  faPlus,
  faChevronLeft,
  faChevronRight,
  faStar as faStarSolid
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import InputModal from './InputModal';

export default function PagesPanel({ sectionId, onClose }) {
  const navigate = useNavigate();
  const { pageId: currentPageId } = useParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [panelWidth, setPanelWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef(null);

  const section = useLiveQuery(
    () => db.sections.get(sectionId),
    [sectionId]
  );

  const pages = useLiveQuery(
    () => db.pages
      .where('sectionId')
      .equals(sectionId)
      .sortBy('orderIndex'),
    [sectionId]
  ) || [];

  const handleCreatePage = async (title) => {
    if (title && sectionId) {
      const maxOrder = pages.length > 0 
        ? Math.max(...pages.map(p => p.orderIndex || 0))
        : 0;

      const id = await db.pages.add({
        sectionId,
        title,
        content: '',
        orderIndex: maxOrder + 1,
        isFavorite: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      navigate(`/pages/${id}`);
      setShowCreateModal(false);
    }
  };

  const toggleFavorite = async (e, page) => {
    e.stopPropagation();
    await db.pages.update(page.id, {
      isFavorite: page.isFavorite ? 0 : 1
    });
  };

  // Resize functionality
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 200 && newWidth <= 600) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  if (!section) return null;

  return (
    <>
      <div 
        ref={panelRef}
        className="pages-panel"
        style={{ width: `${panelWidth}px` }}
      >
        <div 
          className="pages-panel__resizer"
          onMouseDown={handleMouseDown}
        />
        
        <div className="pages-panel__header">
          <div className="pages-panel__title">
            <FontAwesomeIcon icon={faFile} className="pages-panel__icon" />
            <h3>{section.title}</h3>
          </div>
          <div className="pages-panel__actions">
            <button
              className="pages-panel__action-btn"
              onClick={() => setShowCreateModal(true)}
              title="Neue Seite"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button
              className="pages-panel__action-btn"
              onClick={onClose}
              title="Schließen"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>

        <div className="pages-panel__content">
          {pages.length === 0 ? (
            <div className="pages-panel__empty">
              <p>Keine Seiten vorhanden</p>
              <button
                className="btn btn--primary btn--sm"
                onClick={() => setShowCreateModal(true)}
              >
                <FontAwesomeIcon icon={faPlus} /> Erste Seite erstellen
              </button>
            </div>
          ) : (
            <div className="pages-panel__list">
              {pages.map(page => (
                <div
                  key={page.id}
                  className={`pages-panel__item ${currentPageId == page.id ? 'pages-panel__item--active' : ''}`}
                  onClick={() => navigate(`/pages/${page.id}`)}
                >
                  <div className="pages-panel__item-content">
                    <FontAwesomeIcon icon={faFile} className="pages-panel__item-icon" />
                    <span className="pages-panel__item-title">{page.title}</span>
                  </div>
                  <button
                    className="pages-panel__item-favorite"
                    onClick={(e) => toggleFavorite(e, page)}
                    title={page.isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                  >
                    <FontAwesomeIcon icon={page.isFavorite ? faStarSolid : faStarRegular} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <InputModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePage}
        title="Neue Seite"
        label="Seiten Name"
        placeholder="Meine Seite"
        submitText="Erstellen"
        cancelText="Abbrechen"
      />
    </>
  );
}
