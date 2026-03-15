"use client";

import React, { useMemo } from "react";
import { useBookStore } from "@/store";
import Image from "next/image";

interface BookPageProps {
  pageIndex: number;
  src: string;
}

export const BookPage: React.FC<BookPageProps> = ({ pageIndex, src }) => {
  const currentPage = useBookStore((state) => state.currentPage);

  // Define a render window window.
  // We want to keep:
  // - The current page(s)
  // - The immediate next/prev pages for smooth flipping
  // Desktop shows 2 pages at once, so window needs to be slightly larger.
  // Mobile shows 1.
  // Let's use a safe window of +/- 3 indices.
  const shouldRender = useMemo(() => {
    const distance = Math.abs(currentPage - pageIndex);
    return distance <= 3;
  }, [currentPage, pageIndex]);

  // Priority loading for the first few pages to ensure immediate LCP
  const isPriority = pageIndex < 2;

  if (!shouldRender) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-neutral-100 border-t-neutral-300 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative select-none">
      <Image
        src={src}
        alt={`Page ${pageIndex + 1}`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-contain"
        priority={isPriority}
        draggable={false}
      />
    </div>
  );
};
