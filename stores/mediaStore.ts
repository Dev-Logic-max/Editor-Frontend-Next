import { create } from 'zustand';

interface MediaItem {
  filename: string;
  originalName: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  uploadedAt: Date;
}

interface MediaStore {
  media: MediaItem[];
  selectedItems: Set<string>;
  searchQuery: string;
  loading: boolean;
  
  // Actions
  setMedia: (media: MediaItem[]) => void;
  addMedia: (item: MediaItem) => void;
  removeMedia: (filename: string) => void;
  toggleSelection: (filename: string) => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  updateMediaName: (filename: string, newName: string) => void;
}

export const useMediaStore = create<MediaStore>((set) => ({
  media: [],
  selectedItems: new Set(),
  searchQuery: '',
  loading: false,

  setMedia: (media) => set({ media }),
  
  addMedia: (item) => set((state) => ({ 
    media: [item, ...state.media] 
  })),
  
  removeMedia: (filename) => set((state) => ({
    media: state.media.filter(m => m.filename !== filename),
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
  
  updateMediaName: (filename, newName) => set((state) => ({
    media: state.media.map(m => 
      m.filename === filename ? { ...m, originalName: newName } : m
    )
  })),
}));