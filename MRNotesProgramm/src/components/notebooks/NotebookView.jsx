import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db/database';
import NotebookList from './NotebookList';
import SectionList from '../sections/SectionList';
import PageList from '../pages/PageList';

export default function NotebookView() {
  const { notebookId, sectionId } = useParams();
  const [selectedSection, setSelectedSection] = useState(null);

  const notebook = useLiveQuery(
    () => notebookId ? db.notebooks.get(parseInt(notebookId)) : null,
    [notebookId]
  );

  const sections = useLiveQuery(
    () => notebookId ? db.sections.where('notebookId').equals(parseInt(notebookId)).toArray() : [],
    [notebookId]
  );

  const pages = useLiveQuery(
    () => {
      const secId = parseInt(sectionId || selectedSection);
      return secId ? db.pages.where('sectionId').equals(secId).toArray() : [];
    },
    [sectionId, selectedSection]
  );

  // Update selected section when URL parameter changes
  useEffect(() => {
    if (sectionId) {
      setSelectedSection(parseInt(sectionId));
    }
  }, [sectionId]);

  if (!notebookId) {
    return <NotebookList />;
  }

  return (
    <div className="notebook-view">
      <div className="notebook-view__sections">
        <SectionList
          notebookId={parseInt(notebookId)}
          sections={sections || []}
          selectedSection={selectedSection || parseInt(sectionId)}
          onSelectSection={setSelectedSection}
        />
      </div>

      <div className="notebook-view__pages">
        <PageList
          sectionId={parseInt(sectionId || selectedSection)}
          pages={pages || []}
        />
      </div>
    </div>
  );
}