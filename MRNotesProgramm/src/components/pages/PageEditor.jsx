import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db/database';
import CanvasEditor from '../canvas/CanvasEditor';
import RichToolbar from '../editor/RichToolbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faStar, faEllipsisV, faDownload, faImage } from '@fortawesome/free-solid-svg-icons';
import { exportPageAsMarkdown } from '../../lib/utils/export';

export default function PageEditor() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [title, setTitle] = useState('');
  const [createdDate, setCreatedDate] = useState('');
  const [activeEditor, setActiveEditor] = useState(null);

  const page = useLiveQuery(
    () => pageId ? db.pages.get(parseInt(pageId)) : null,
    [pageId]
  );

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      // Format createdAt date
      const date = new Date(page.createdAt);
      const formattedDate = date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      setCreatedDate(formattedDate);
    }
  }, [page]);

  const handleTitleSave = async () => {
    if (title.trim() && page) {
      await db.pages.update(parseInt(pageId), {
        title: title.trim(),
        updatedAt: new Date()
      });
    }
    setIsEditingTitle(false);
  };

  const handleDateSave = async () => {
    if (createdDate.trim() && page) {
      // Parse date in DD.MM.YYYY format
      const parts = createdDate.split('.');
      if (parts.length === 3) {
        const newDate = new Date(parts[2], parts[1] - 1, parts[0]);
        if (!isNaN(newDate.getTime())) {
          await db.pages.update(parseInt(pageId), {
            createdAt: newDate,
            updatedAt: new Date()
          });
        }
      }
    }
    setIsEditingDate(false);
  };

  const toggleFavorite = async () => {
    if (page) {
      await db.pages.update(parseInt(pageId), {
        isFavorite: page.isFavorite ? 0 : 1
      });
    }
  };

  const handleExport = () => {
    if (pageId) {
      exportPageAsMarkdown(parseInt(pageId));
    }
  };

  // Add image element
  const handleAddImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const elements = await db.pageElements.where('pageId').equals(parseInt(pageId)).toArray();
        const maxZ = elements.length > 0 ? Math.max(...elements.map(el => el.zIndex || 0)) : 0;

        await db.pageElements.add({
          pageId: parseInt(pageId),
          type: 'image',
          positionX: 100,
          positionY: 100,
          width: 400,
          height: 300,
          zIndex: maxZ + 1,
          content: event.target.result,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  if (!page) {
    return (
      <div className="page-editor-loading">
        <div className="spinner"></div>
        <p>Loading page...</p>
      </div>
    );
  }

  return (
    <div className="page-editor">
      {/* Minimal Header mit Canvas-Aktionen */}
      <div className="page__header-minimal">
        <div className="page__header-actions">
          <button
            className="btn btn--ghost btn--icon"
            onClick={() => navigate(-1)}
            title="Zurück"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          
          {isEditingTitle ? (
            <div style={{ flex: 1, marginRight: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <input
                type="text"
                className="page__header-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') {
                    setTitle(page.title);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
              />
              {isEditingDate ? (
                <input
                  type="text"
                  className="page__header-date-input"
                  value={createdDate}
                  onChange={(e) => setCreatedDate(e.target.value)}
                  onBlur={handleDateSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDateSave();
                    if (e.key === 'Escape') {
                      const date = new Date(page.createdAt);
                      setCreatedDate(date.toLocaleDateString('de-DE'));
                      setIsEditingDate(false);
                    }
                  }}
                  placeholder="TT.MM.JJJJ"
                  autoFocus
                />
              ) : (
                <span 
                  className="page__header-date"
                  onClick={() => setIsEditingDate(true)}
                  title="Klicken zum Ändern"
                >
                  {createdDate}
                </span>
              )}
            </div>
          ) : (
            <div 
              style={{ flex: 1, marginRight: 'auto', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
              onClick={() => setIsEditingTitle(true)}
              title="Klicken zum Bearbeiten"
            >
              <span className="page__header-title">
                {page.title}
              </span>
              {isEditingDate ? (
                <input
                  type="text"
                  className="page__header-date-input"
                  value={createdDate}
                  onChange={(e) => setCreatedDate(e.target.value)}
                  onBlur={handleDateSave}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDateSave();
                    if (e.key === 'Escape') {
                      const date = new Date(page.createdAt);
                      setCreatedDate(date.toLocaleDateString('de-DE'));
                      setIsEditingDate(false);
                    }
                  }}
                  placeholder="TT.MM.JJJJ"
                  autoFocus
                />
              ) : (
                <span 
                  className="page__header-date"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingDate(true);
                  }}
                  title="Klicken zum Ändern"
                >
                  {createdDate}
                </span>
              )}
            </div>
          )}

          <button
            className="btn btn--ghost btn--icon"
            onClick={handleAddImage}
            title="Bild einfügen"
          >
            <FontAwesomeIcon icon={faImage} />
          </button>
          
          <button
            className={`btn btn--ghost btn--icon ${page.isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
            title={page.isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
          >
            <FontAwesomeIcon icon={faStar} style={{ color: page.isFavorite ? '#fbbf24' : 'currentColor' }} />
          </button>
          
          <button 
            className="btn btn--ghost btn--icon" 
            onClick={handleExport}
            title="Als Markdown exportieren"
          >
            <FontAwesomeIcon icon={faDownload} />
          </button>
          
          <button className="btn btn--ghost btn--icon" title="Weitere Optionen">
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>
        </div>
      </div>

      {/* Rich Toolbar - immer sichtbar, über dem Header */}
      <RichToolbar editor={activeEditor} />

      {/* OneNote-Style Infinite Canvas */}
      <CanvasEditor pageId={pageId ? parseInt(pageId) : null} onEditorFocus={setActiveEditor} />
    </div>
  );
}
