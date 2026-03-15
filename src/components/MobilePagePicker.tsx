"use client";

import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface MobilePagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: number;
  totalPages: number;
  onSelectPage: (pageIndex: number) => void;
}

export const MobilePagePicker: React.FC<MobilePagePickerProps> = ({
  isOpen,
  onClose,
  currentPage,
  totalPages,
  onSelectPage,
}) => {
  const listRef = useRef<HTMLUListElement>(null);

  // Auto-scroll to selected page when opened
  useEffect(() => {
    if (isOpen && listRef.current) {
      const selectedEl = listRef.current.querySelector(
        `[data-page="${currentPage}"]`,
      );
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: "center", behavior: "auto" });
      }
    }
  }, [isOpen, currentPage]);

  // Prevent scrolling background when picker is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent Backdrop to catch clicks outside */}
          <div
            className="fixed inset-0 z-[150] pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />

          {/* Popover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="mb-4 z-[200] w-48 bg-neutral-900/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-[250px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Minimal */}
            <div className="px-3 py-2.5 border-b border-white/10 bg-white/5 flex justify-center sticky top-0 z-10 backdrop-blur-md">
              <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">
                Select Page
              </span>
            </div>

            {/* List */}
            <div className="overflow-y-auto overflow-x-hidden p-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
              <ul ref={listRef} className="space-y-1">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const isSelected = currentPage === index;
                  return (
                    <li key={index}>
                      <button
                        data-page={index}
                        onClick={() => {
                          onSelectPage(index);
                          onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-xs ${
                          isSelected
                            ? "bg-white/20 text-white font-bold"
                            : "text-neutral-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>Page {index + 1}</span>
                        {isSelected && (
                          <Check size={12} className="text-white" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
