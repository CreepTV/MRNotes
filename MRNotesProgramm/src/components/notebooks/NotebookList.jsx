import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faPlus, faTrash, faEdit, faEllipsisV, faPalette } from '@fortawesome/free-solid-svg-icons';
import InputModal from '../shared/InputModal';
import ConfirmModal from '../shared/ConfirmModal';
import ColorPickerModal from '../shared/ColorPickerModal';

export default function NotebookList() {
  const navigate = useNavigate();
  const [showContextMenu, setShowContextMenu] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(null);
  
  const notebooks = useLiveQuery(() => 
    db.notebooks.filter(notebook => !notebook.deletedAt).toArray()
  ) || [];

  const colors = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#be185d'];

  const handleCreate = async (title) => {
    if (title) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const id = await db.notebooks.add({
        title,
        description: '',
        color: randomColor,
        icon: 'book',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      });

      navigate(`/notebooks/${id}`);
    }
  };

  const handleDelete = async () => {
    if (showDeleteModal) {
      // Soft delete
      await db.notebooks.update(showDeleteModal.id, { deletedAt: new Date() });
      
      // Also delete associated sections and pages
      const sections = await db.sections.where('notebookId').equals(showDeleteModal.id).toArray();
      for (const section of sections) {
        await db.pages.where('sectionId').equals(section.id).delete();
      }
      await db.sections.where('notebookId').equals(showDeleteModal.id).delete();
      setShowContextMenu(null);
      setShowDeleteModal(null);
    }
  };

  const handleEdit = async (title) => {
    if (showEditModal && title) {
      await db.notebooks.update(showEditModal.id, {
        title,
        updatedAt: new Date()
      });
      setShowContextMenu(null);
      setShowEditModal(null);
    }
  };

  const handleChangeColor = async (e, notebook) => {
    e.stopPropagation();
    setShowColorPicker(notebook);
    setShowContextMenu(null);
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

  return (
    <div className="notebook-list-container">
      <div className="notebook-list-header">
        <h1><FontAwesomeIcon icon={faBook} /> My Notebooks</h1>
        <button className="btn btn--primary" onClick={() => setShowCreateModal(true)}>
          <FontAwesomeIcon icon={faPlus} />
          New Notebook
        </button>
      </div>

      {notebooks.length === 0 ? (
        <div className="notebook__empty">
          <div className="notebook__empty-icon">
            <FontAwesomeIcon icon={faBook} size="4x" />
          </div>
          <div className="notebook__empty-text">No notebooks yet</div>
          <div className="notebook__empty-hint">
            Create your first notebook to get started
          </div>
          <button className="btn btn--primary" onClick={() => setShowCreateModal(true)}>
            <FontAwesomeIcon icon={faPlus} />
            Create Notebook
          </button>
        </div>
      ) : (
        <div className="notebook__grid">
          {notebooks.map(notebook => (
            <div
              key={notebook.id}
              className="notebook__card"
              onClick={() => navigate(`/notebooks/${notebook.id}`)}
            >
              <div 
                className="notebook__card-header" 
                style={{ backgroundColor: notebook.color || '#2563eb' }}
              >
                <FontAwesomeIcon icon={faBook} size="2x" />
                <button
                  className="btn btn--icon btn--ghost notebook__card-menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowContextMenu(showContextMenu === notebook.id ? null : notebook.id);
                  }}
                >
                  <FontAwesomeIcon icon={faEllipsisV} />
                </button>
                
                {showContextMenu === notebook.id && (
                  <div className="context-menu" onClick={(e) => e.stopPropagation()}>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setShowEditModal({ id: notebook.id, title: notebook.title });
                      setShowContextMenu(null);
                    }}>
                      <FontAwesomeIcon icon={faEdit} /> Rename
                    </button>
                    <button onClick={(e) => handleChangeColor(e, notebook)}>
                      <FontAwesomeIcon icon={faPalette} /> Change Color
                    </button>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal({ id: notebook.id, title: notebook.title });
                      setShowContextMenu(null);
                    }} className="danger">
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </div>
                )}
              </div>
              <div className="notebook__card-body">
                <h3 className="notebook__card-title">{notebook.title}</h3>
                {notebook.description && (
                  <p className="notebook__card-description">{notebook.description}</p>
                )}
                <div className="notebook__card-meta">
                  <span className="notebook__card-date">
                    Created {new Date(notebook.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="notebook__card notebook__card--add" onClick={() => setShowCreateModal(true)}>
            <div className="notebook__card-add-content">
              <FontAwesomeIcon icon={faPlus} size="3x" />
              <span>Create New Notebook</span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <InputModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        title="Neues Notizbuch"
        label="Notizbuch Name"
        placeholder="Mein Notizbuch"
        submitText="Erstellen"
        cancelText="Abbrechen"
      />

      <InputModal
        isOpen={!!showEditModal}
        onClose={() => setShowEditModal(null)}
        onSubmit={handleEdit}
        title="Notizbuch umbenennen"
        label="Notizbuch Name"
        defaultValue={showEditModal?.title || ''}
        submitText="Speichern"
        cancelText="Abbrechen"
      />

      <ConfirmModal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        onConfirm={handleDelete}
        title="Notizbuch löschen?"
        message={`Möchtest du das Notizbuch "${showDeleteModal?.title}" wirklich löschen? Alle enthaltenen Sections und Seiten werden ebenfalls gelöscht.`}
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
    </div>
  );
}