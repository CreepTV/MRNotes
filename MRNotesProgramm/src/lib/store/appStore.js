// ========================================
// MRNotes - Zustand App Store
// ========================================

import { create } from 'zustand';

export const useAppStore = create((set, get) => ({
  // UI State
  sidebarOpen: true,
  currentNotebook: null,
  currentSection: null,
  currentPage: null,
  theme: 'light',

  // Search State
  searchQuery: '',
  searchResults: [],

  // Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setCurrentNotebook: (notebookId) => set({ currentNotebook: notebookId }),
  
  setCurrentSection: (sectionId) => set({ currentSection: sectionId }),
  
  setCurrentPage: (pageId) => set({ currentPage: pageId }),
  
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
  
  setTheme: (theme) => set({ theme }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSearchResults: (results) => set({ searchResults: results }),
  
  clearSearch: () => set({ searchQuery: '', searchResults: [] }),
}));

export default useAppStore;
