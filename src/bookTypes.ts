export interface PageData {
  id: string;
  content: React.ReactNode; // Or image URL, component, etc.
  type: "image" | "text" | "component";
}

export type ViewMode = "desktop" | "mobile";

export interface BookState {
  currentPage: number;
  totalPages: number;
  viewMode: ViewMode;
  isFlipping: boolean;
  direction: "next" | "prev" | null;
  loadedImages: Set<number>;
}

export interface BookActions {
  setPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setViewMode: (mode: ViewMode) => void;
  setTotalPages: (total: number) => void;
  setIsFlipping: (isFlipping: boolean) => void;
  markImageLoaded: (index: number) => void;
}

export interface BookStore extends BookState, BookActions { }
