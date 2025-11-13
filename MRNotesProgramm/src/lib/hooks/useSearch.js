// ========================================
// useSearch - Custom Hook for Search Functionality
// ========================================

import { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import Fuse from 'fuse.js';

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Get all pages for search
  const allPages = useLiveQuery(() => db.pages.toArray()) || [];

  // Create Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(allPages, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'content', weight: 1 }
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true
    });
  }, [allPages]);

  // Perform search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = fuse.search(query);
    setResults(searchResults.map(result => ({
      ...result.item,
      score: result.score,
      matches: result.matches
    })));
  }, [query, fuse]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  return {
    query,
    setQuery,
    results,
    clearSearch
  };
}

export default useSearch;
