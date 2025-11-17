import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db/database';
import NotebookList from './NotebookList';

export default function NotebookView() {
  const { notebookId, sectionId } = useParams();

  const notebook = useLiveQuery(
    () => notebookId ? db.notebooks.get(parseInt(notebookId)) : null,
    [notebookId]
  );

  if (!notebookId) {
    return <NotebookList />;
  }

  // Show notebook overview
  return (
    <div className="notebook-view">
      <div className="notebook-view__content">
        <div className="notebook-view__logo">
          <img 
            src="/data/logo/MRNotes_Logo_Blau_Transparent.png"
            alt="MRNotes Logo" 
            className="notebook-view__logo-img" 
          />
        </div>
        <h1>{notebook?.title || 'Notizbuch'}</h1>
        <p className="text-secondary">Wähle eine Section aus der Sidebar, um Seiten anzuzeigen.</p>
      </div>
    </div>
  );
}