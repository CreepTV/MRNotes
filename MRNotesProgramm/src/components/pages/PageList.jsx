import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/db/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faPlus, faStar, faTrash, faEdit, faEllipsisV, faClock } from '@fortawesome/free-solid-svg-icons';

export default function PageList({ sectionId, pages }) {
  const navigate = useNavigate();
  const [showContextMenu, setShowContextMenu] = useState(null);

  const handleCreate = async () => {
    if (!sectionId) {
      alert('Please select a section first');
      return;
    }

    const title = prompt('Page Name:');
    if (!title) return;

    const id = await db.pages.add({
      sectionId,
      parentPageId: null,
      title,
      content: { type: 'doc', content: [] },
      orderIndex: pages.length,
      isFavorite: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    navigate(`/pages/${id}`);
  };

  const handleEdit = async (e, page) => {
    e.stopPropagation();
    const title = prompt('Page Name:', page.title);
    if (!title) return;

    await db.pages.update(page.id, {
      title,
      updatedAt: new Date()
    });
    setShowContextMenu(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this page?')) return;

    await db.pages.delete(id);
    setShowContextMenu(null);
  };

  const toggleFavorite = async (e, page) => {
    e.stopPropagation();
    await db.pages.update(page.id, {
      isFavorite: page.isFavorite ? 0 : 1
    });
  };

  if (!sectionId) {
    return (
      <div className="page-list-empty">
        <FontAwesomeIcon icon={faFileAlt} size="3x" style={{ color: 'var(--gray-400)' }} />
        <p>Select a section to view pages</p>
      </div>
    );
  }

  return (
    <div className="page-list">
      <div className="page-list__header">
        <h2><FontAwesomeIcon icon={faFileAlt} /> Pages</h2>
        <button className="btn btn--primary btn--sm" onClick={handleCreate}>
          <FontAwesomeIcon icon={faPlus} />
          New Page
        </button>
      </div>

      {pages.length === 0 ? (
        <div className="page-list__empty">
          <div className="page__empty">
            <div className="page__empty-icon">
              <FontAwesomeIcon icon={faFileAlt} size="4x" />
            </div>
            <div className="page__empty-text">No pages yet</div>
            <button className="btn btn--primary" onClick={handleCreate}>
              <FontAwesomeIcon icon={faPlus} />
              Create Page
            </button>
          </div>
        </div>
      ) : (
        <div className="page__list">
          {pages.map(page => (
            <div
              key={page.id}
              className="page__item"
              onClick={() => navigate(`/pages/${page.id}`)}
            >
              <div className="page__item-icon">
                <FontAwesomeIcon icon={faFileAlt} />
              </div>
              <div className="page__item-content">
                <span className="page__item-title">{page.title}</span>
                <span className="page__item-date">
                  <FontAwesomeIcon icon={faClock} /> {new Date(page.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="page__item-actions">
                <button
                  className={`btn btn--ghost btn--icon btn--sm ${page.isFavorite ? 'active' : ''}`}
                  onClick={(e) => toggleFavorite(e, page)}
                  title={page.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <FontAwesomeIcon icon={faStar} style={{ color: page.isFavorite ? '#fbbf24' : 'currentColor' }} />
                </button>
                <button
                  className="btn btn--ghost btn--icon btn--sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowContextMenu(showContextMenu === page.id ? null : page.id);
                  }}
                  title="More options"
                >
                  <FontAwesomeIcon icon={faEllipsisV} />
                </button>
                
                {showContextMenu === page.id && (
                  <div className="context-menu" onClick={(e) => e.stopPropagation()}>
                    <button onClick={(e) => handleEdit(e, page)}>
                      <FontAwesomeIcon icon={faEdit} /> Rename
                    </button>
                    <button onClick={(e) => handleDelete(e, page.id)} className="danger">
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}