import { useState } from 'react';
import { db } from '../../lib/db/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faPlus, faTrash, faEdit, faEllipsisV, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import InputModal from '../shared/InputModal';
import ConfirmModal from '../shared/ConfirmModal';

export default function SectionList({ notebookId, sections, selectedSection, onSelectSection }) {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);

  const handleCreate = async (title) => {
    if (title) {
      await db.sections.add({
        notebookId,
        title,
        orderIndex: sections.length,
        color: '#3b82f6',
        createdAt: new Date()
      });
    }
  };

  const handleEdit = async (title) => {
    if (showEditModal && title) {
      await db.sections.update(showEditModal.id, {
        title,
        updatedAt: new Date()
      });
      setShowContextMenu(null);
      setShowEditModal(null);
    }
  };

  const handleDelete = async () => {
    if (showDeleteModal) {
      await db.pages.where('sectionId').equals(showDeleteModal.id).delete();
      await db.sections.delete(showDeleteModal.id);
      setShowContextMenu(null);
      setShowDeleteModal(null);
    }
  };

  return (
    <div className="section-list">
      <div className="section-list__header">
        <h2><FontAwesomeIcon icon={faFolder} /> Sections</h2>
        <button className="btn btn--ghost btn--icon" onClick={() => setShowCreateModal(true)} title="New Section">
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="section-list__empty">
          <p>No sections yet</p>
          <button className="btn btn--sm btn--primary" onClick={() => setShowCreateModal(true)}>
            <FontAwesomeIcon icon={faPlus} />
            Create Section
          </button>
        </div>
      ) : (
        <div className="section-list__items">
          {sections.map(section => (
            <div
              key={section.id}
              className={`section-list__item ${selectedSection === section.id ? 'section-list__item--active' : ''}`}
              onClick={() => onSelectSection(section.id)}
            >
              <div className="section-list__item-icon" style={{ color: section.color }}>
                <FontAwesomeIcon icon={faFolder} />
              </div>
              <span className="section-list__item-title">{section.title}</span>
              <div className="section-list__item-actions">
                <button
                  className="btn btn--ghost btn--icon btn--sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowContextMenu(showContextMenu === section.id ? null : section.id);
                  }}
                  title="More options"
                >
                  <FontAwesomeIcon icon={faEllipsisV} />
                </button>
                
                {showContextMenu === section.id && (
                  <div className="context-menu" onClick={(e) => e.stopPropagation()}>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setShowEditModal({ id: section.id, title: section.title });
                      setShowContextMenu(null);
                    }}>
                      <FontAwesomeIcon icon={faEdit} /> Rename
                    </button>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal({ id: section.id, title: section.title });
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
        title="Neue Section"
        label="Section Name"
        placeholder="Meine Section"
        submitText="Erstellen"
        cancelText="Abbrechen"
      />

      <InputModal
        isOpen={!!showEditModal}
        onClose={() => setShowEditModal(null)}
        onSubmit={handleEdit}
        title="Section umbenennen"
        label="Section Name"
        defaultValue={showEditModal?.title || ''}
        submitText="Speichern"
        cancelText="Abbrechen"
      />

      <ConfirmModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={handleDelete}
        title="Section löschen?"
        message={`Möchtest du die Section "${showDeleteModal?.title}" wirklich löschen? Alle enthaltenen Seiten werden ebenfalls gelöscht.`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        type="danger"
      />
    </div>
  );
}