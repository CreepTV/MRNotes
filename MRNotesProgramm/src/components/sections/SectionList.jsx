import { useState } from 'react';
import { db } from '../../lib/db/database';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolder, faPlus, faTrash, faEdit, faEllipsisV, faChevronRight } from '@fortawesome/free-solid-svg-icons';

export default function SectionList({ notebookId, sections, selectedSection, onSelectSection }) {
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [showContextMenu, setShowContextMenu] = useState(null);

  const handleCreate = async () => {
    const title = prompt('Section Name:');
    if (!title) return;

    await db.sections.add({
      notebookId,
      title,
      orderIndex: sections.length,
      color: '#3b82f6',
      createdAt: new Date()
    });
  };

  const handleEdit = async (e, section) => {
    e.stopPropagation();
    const title = prompt('Section Name:', section.title);
    if (!title) return;

    await db.sections.update(section.id, {
      title,
      updatedAt: new Date()
    });
    setShowContextMenu(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this section and all its pages?')) return;

    await db.pages.where('sectionId').equals(id).delete();
    await db.sections.delete(id);
    setShowContextMenu(null);
  };

  return (
    <div className="section-list">
      <div className="section-list__header">
        <h2><FontAwesomeIcon icon={faFolder} /> Sections</h2>
        <button className="btn btn--ghost btn--icon" onClick={handleCreate} title="New Section">
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="section-list__empty">
          <p>No sections yet</p>
          <button className="btn btn--sm btn--primary" onClick={handleCreate}>
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
                    <button onClick={(e) => handleEdit(e, section)}>
                      <FontAwesomeIcon icon={faEdit} /> Rename
                    </button>
                    <button onClick={(e) => handleDelete(e, section.id)} className="danger">
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