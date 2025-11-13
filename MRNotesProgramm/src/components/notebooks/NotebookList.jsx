import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faPlus, faTrash, faEdit, faEllipsisV, faPalette } from '@fortawesome/free-solid-svg-icons';

export default function NotebookList() {
  const navigate = useNavigate();
  const [showContextMenu, setShowContextMenu] = useState(null);
  const notebooks = useLiveQuery(() => 
    db.notebooks.filter(notebook => !notebook.deletedAt).toArray()
  ) || [];

  const colors = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c', '#0891b2', '#be185d'];

  const handleCreate = async () => {
    const title = prompt('Notebook Name:');
    if (!title) return;

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
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this notebook and all its contents?')) return;

    // Soft delete
    await db.notebooks.update(id, { deletedAt: new Date() });
    
    // Also delete associated sections and pages
    const sections = await db.sections.where('notebookId').equals(id).toArray();
    for (const section of sections) {
      await db.pages.where('sectionId').equals(section.id).delete();
    }
    await db.sections.where('notebookId').equals(id).delete();
    setShowContextMenu(null);
  };

  const handleEdit = async (e, notebook) => {
    e.stopPropagation();
    const title = prompt('Notebook Name:', notebook.title);
    if (!title) return;

    await db.notebooks.update(notebook.id, {
      title,
      updatedAt: new Date()
    });
    setShowContextMenu(null);
  };

  const handleChangeColor = async (e, notebook) => {
    e.stopPropagation();
    const newColor = colors[Math.floor(Math.random() * colors.length)];
    await db.notebooks.update(notebook.id, {
      color: newColor,
      updatedAt: new Date()
    });
    setShowContextMenu(null);
  };

  return (
    <div className="notebook-list-container">
      <div className="notebook-list-header">
        <h1><FontAwesomeIcon icon={faBook} /> My Notebooks</h1>
        <button className="btn btn--primary" onClick={handleCreate}>
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
          <button className="btn btn--primary" onClick={handleCreate}>
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
                    <button onClick={(e) => handleEdit(e, notebook)}>
                      <FontAwesomeIcon icon={faEdit} /> Rename
                    </button>
                    <button onClick={(e) => handleChangeColor(e, notebook)}>
                      <FontAwesomeIcon icon={faPalette} /> Change Color
                    </button>
                    <button onClick={(e) => handleDelete(e, notebook.id)} className="danger">
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

          <div className="notebook__card notebook__card--add" onClick={handleCreate}>
            <div className="notebook__card-add-content">
              <FontAwesomeIcon icon={faPlus} size="3x" />
              <span>Create New Notebook</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}