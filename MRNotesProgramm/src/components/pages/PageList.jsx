import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../lib/db/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faPlus, faStar, faTrash, faEdit, faEllipsisV, faClock } from '@fortawesome/free-solid-svg-icons';
import InputModal from '../shared/InputModal';
import ConfirmModal from '../shared/ConfirmModal';
import AlertModal from '../shared/AlertModal';

export default function PageList({ sectionId, pages }) {
  const navigate = useNavigate();
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);

  const handleCreate = async (title) => {
    if (!sectionId) {
      setShowAlertModal(true);
      return;
    }

    if (title) {
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
    }
  };

  const handleEdit = async (title) => {
    if (showEditModal && title) {
      await db.pages.update(showEditModal.id, {
        title,
        updatedAt: new Date()
      });
      setShowContextMenu(null);
      setShowEditModal(null);
    }
  };

  const handleDelete = async () => {
    if (showDeleteModal) {
      await db.pages.delete(showDeleteModal.id);
      setShowContextMenu(null);
      setShowDeleteModal(null);
    }
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
        <button className="btn btn--primary btn--sm" onClick={() => setShowCreateModal(true)}>
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
            <button className="btn btn--primary" onClick={() => setShowCreateModal(true)}>
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
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setShowEditModal({ id: page.id, title: page.title });
                      setShowContextMenu(null);
                    }}>
                      <FontAwesomeIcon icon={faEdit} /> Rename
                    </button>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal({ id: page.id, title: page.title });
                      setShowContextMenu(null);
                    }} className="danger">
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <InputModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Neue Seite"
        label="Seiten Name"
        placeholder="Meine Seite"
        submitText="Erstellen"
        cancelText="Abbrechen"
      />

      <InputModal
        isOpen={!!showEditModal}
        onClose={() => setShowEditModal(null)}
        onSubmit={handleEdit}
        title="Seite umbenennen"
        label="Seiten Name"
        defaultValue={showEditModal?.title || ''}
        submitText="Speichern"
        cancelText="Abbrechen"
      />

      <ConfirmModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={handleDelete}
        title="Seite löschen?"
        message={`Möchtest du die Seite "${showDeleteModal?.title}" wirklich löschen?`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        type="danger"
      />

      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="Keine Section ausgewählt"
        message="Bitte wähle zuerst eine Section aus, um eine Seite zu erstellen."
        type="warning"
      />
    </div>
  );
}