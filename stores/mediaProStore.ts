import { create } from 'zustand';

interface MediaItemPro {
  filename: string;
  originalName: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: Date;
  uploadedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  documentId: string;
  documentTitle: string;
}

interface MediaProStore {
  allMedia: MediaItemPro[];
  selectedItems: Set<string>;
  searchQuery: string;
  loading: boolean;
  viewMode: 'document' | 'all'; // ✅ NEW: Switch between document and all media
  
  setAllMedia: (media: MediaItemPro[]) => void;
  addMedia: (item: MediaItemPro) => void;
  removeMedia: (filename: string) => void;
  toggleSelection: (filename: string) => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setViewMode: (mode: 'document' | 'all') => void;
  updateMediaName: (filename: string, newName: string) => void;
}

export const useMediaProStore = create<MediaProStore>((set) => ({
  allMedia: [],
  selectedItems: new Set(),
  searchQuery: '',
  loading: false,
  viewMode: 'document',

  setAllMedia: (allMedia) => set({ allMedia }),
  
  addMedia: (item) => set((state) => ({ 
    allMedia: [item, ...state.allMedia] 
  })),
  
  removeMedia: (filename) => set((state) => ({
    allMedia: state.allMedia.filter(m => m.filename !== filename),
    selectedItems: new Set([...state.selectedItems].filter(f => f !== filename))
  })),
  
  toggleSelection: (filename) => set((state) => {
    const newSelection = new Set(state.selectedItems);
    if (newSelection.has(filename)) {
      newSelection.delete(filename);
    } else {
      newSelection.add(filename);
    }
    return { selectedItems: newSelection };
  }),
  
  clearSelection: () => set({ selectedItems: new Set() }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ loading }),
  setViewMode: (mode) => set({ viewMode: mode }),
  
  updateMediaName: (filename, newName) => set((state) => ({
    allMedia: state.allMedia.map(m => 
      m.filename === filename ? { ...m, originalName: newName } : m
    )
  })),
}));