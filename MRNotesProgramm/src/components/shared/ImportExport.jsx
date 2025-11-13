import { useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUpload, 
  faDownload, 
  faFileCode, 
  faBook 
} from '@fortawesome/free-solid-svg-icons';
import { exportAllAsFile, exportNotebookAsFile } from '../../lib/utils/export';
import { importMRNote, importMRBook, importMarkdown } from '../../lib/utils/import';

export default function ImportExport({ notebookId = null, sectionId = null }) {
  const fileInputRef = useRef(null);

  const handleExportAll = () => {
    exportAllAsFile();
  };

  const handleExportNotebook = () => {
    if (notebookId) {
      exportNotebookAsFile(notebookId);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'mrnote') {
        await importMRNote(file);
        alert('Successfully imported all notebooks!');
      } else if (extension === 'mrbook') {
        await importMRBook(file);
        alert('Successfully imported notebook!');
      } else if (extension === 'md') {
        if (!sectionId) {
          alert('Please select a section first to import Markdown files.');
          return;
        }
        await importMarkdown(file, sectionId);
        alert('Successfully imported Markdown page!');
      } else {
        alert('Unsupported file format. Please use .mrnote, .mrbook, or .md files.');
      }
      
      // Reset file input
      e.target.value = '';
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import file: ' + error.message);
    }
  };

  return (
    <div className="import-export">
      <input
        ref={fileInputRef}
        type="file"
        accept=".mrnote,.mrbook,.md"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      
      <div className="import-export__buttons">
        <button
          className="btn btn--secondary btn--sm"
          onClick={handleImportClick}
          title="Import .mrnote, .mrbook, or .md file"
        >
          <FontAwesomeIcon icon={faUpload} />
          <span>Import</span>
        </button>

        {notebookId ? (
          <button
            className="btn btn--secondary btn--sm"
            onClick={handleExportNotebook}
            title="Export current notebook as .mrbook file"
          >
            <FontAwesomeIcon icon={faBook} />
            <span>Export Notebook</span>
          </button>
        ) : (
          <button
            className="btn btn--secondary btn--sm"
            onClick={handleExportAll}
            title="Export all notebooks as .mrnote file"
          >
            <FontAwesomeIcon icon={faDownload} />
            <span>Export All</span>
          </button>
        )}
      </div>
    </div>
  );
}
