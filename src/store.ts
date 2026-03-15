import { create } from "zustand";
import type { BookState, BookActions, ViewMode, BookStore } from "./bookTypes";

export const useBookStore = create<BookStore>((set, get) => ({
  currentPage: 0,
  totalPages: 0,
  viewMode: "desktop",
  isFlipping: false,
  direction: null,
  loadedImages: new Set(),

  setPage: (page: number) => {
    const { totalPages, viewMode } = get();
    // Clamp page between 0 and totalPages
    let targetPage = Math.max(0, Math.min(page, totalPages));

    // In desktop mode, ensure we land on an even page (0, 2, 4...)
    if (viewMode === "desktop" && targetPage % 2 !== 0) {
      targetPage -= 1;
    }

    set({ currentPage: targetPage });
  },

  nextPage: () => {
    const { currentPage, totalPages, viewMode } = get();
    // In desktop mode, we advance by 2, in mobile by 1
    const increment = viewMode === "desktop" ? 2 : 1;
    const nextPage = currentPage + increment;

    // Mobile: Stop at last index (totalPages - 1) to keep last page visible
    // Desktop: Allow going to totalPages (to show back of last sheet)
    const maxPage = viewMode === "mobile" ? totalPages - 1 : totalPages;

    if (nextPage <= maxPage) {
      set({
        currentPage: nextPage,
        direction: "next",
        isFlipping: true,
      });
    }
  },

  prevPage: () => {
    const { currentPage, viewMode } = get();
    const decrement = viewMode === "desktop" ? 2 : 1;
    const prevPage = currentPage - decrement;

    if (prevPage >= 0) {
      set({
        currentPage: prevPage,
        direction: "prev",
        isFlipping: true,
      });
    }
  },

  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

  setTotalPages: (total: number) => set({ totalPages: total }),

  setIsFlipping: (isFlipping: boolean) => set({ isFlipping }),

  markImageLoaded: (index: number) => {
    const { loadedImages } = get();
    if (!loadedImages.has(index)) {
      const newSet = new Set(loadedImages);
      newSet.add(index);
      set({ loadedImages: newSet });
    }
  },
}));
