import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../lib/store/appStore';
import { db } from '../../lib/db/database';
import Fuse from 'fuse.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import ImportExport from './ImportExport';

export default function Header() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, setSearchResults, currentNotebook, currentSection } = useAppStore();
  const [allPages, setAllPages] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [fuse, setFuse] = useState(null);

  useEffect(() => {
    // Load all pages for search
    const loadPages = async () => {
      const pages = await db.pages.toArray();
      setAllPages(pages);

      // Initialize Fuse.js
      const fuseInstance = new Fuse(pages, {
        keys: ['title', 'content'],
        threshold: 0.3,
        includeScore: true,
      });
      setFuse(fuseInstance);
    };

    loadPages();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim() || !fuse) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = fuse.search(query);
    setSearchResults(results.map(r => r.item));
    setShowResults(true);
  };

  const handleResultClick = (pageId) => {
    navigate(`/pages/${pageId}`);
    setShowResults(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__search">
          <div className="searchbar">
            <div className="searchbar__icon">
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <input
              type="text"
              className="searchbar__input"
              placeholder="Search pages..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />
            {searchQuery && (
              <button
                className={`searchbar__clear ${searchQuery ? 'searchbar__clear--visible' : ''}`}
                onClick={handleClear}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}

            {showResults && (
              <div className="searchbar__results">
                {useAppStore.getState().searchResults.length > 0 ? (
                  useAppStore.getState().searchResults.map(page => (
                    <div
                      key={page.id}
                      className="searchbar__results-item"
                      onMouseDown={() => handleResultClick(page.id)}
                    >
                      <div className="searchbar__results-item-title">{page.title}</div>
                      <div className="searchbar__results-item-preview">
                        {typeof page.content === 'string' ? page.content.substring(0, 100) : 'No preview'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="searchbar__results-empty">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="header__actions">
          <ImportExport 
            notebookId={currentNotebook} 
            sectionId={currentSection}
          />
        </div>
      </div>
    </header>
  );
}