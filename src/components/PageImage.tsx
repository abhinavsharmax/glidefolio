"use client";

import React from "react";
import Image from "next/image";
import { useBookStore } from "../store";

interface PageImageProps {
  index: number;
}

export const PageImage: React.FC<PageImageProps> = ({ index }) => {
  const { currentPage, loadedImages, markImageLoaded } = useBookStore();

  // Check cache immediately (synchronously) during render
  const isCached = loadedImages.has(index);
  const [isLoaded, setIsLoaded] = React.useState(isCached);

  // Determine visibility window
  // Window size: +/- 8 pages (approx 4 sheets) to ensure smooth flipping
  const isVisible = Math.abs(currentPage - index) <= 8;

  // Priority: Current spread (+/- 1 page)
  const isPriority = Math.abs(currentPage - index) <= 1;

  // Update store when loaded locally
  const handleLoad = () => {
    setIsLoaded(true);
    markImageLoaded(index);
  };

  if (!isVisible) {
    return <div className="w-full h-full bg-white/50 animate-pulse" />;
  }

  // If it was cached from the start, we disable transitions to ensure instant appearance
  // If it wasn't cached, we allow the fade-in transition once isLoaded becomes true
  const shouldTransition = !isCached;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative select-none bg-white">
      {/* Skeleton / Placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-neutral-100 animate-pulse" />
      )}

      <Image
        src={`/images/${index + 1}.jpg`}
        alt={`Page ${index + 1}`}
        fill
        className={`object-contain ${shouldTransition ? "transition-opacity duration-700 ease-in-out" : ""
          } ${isLoaded ? "opacity-100" : "opacity-0"}`}
        loading={isPriority ? "eager" : "lazy"}
        priority={isPriority}
        onLoad={handleLoad}
        sizes="(max-width: 768px) 100vw, 50vw"
        draggable={false}
      />
    </div>
  );
};
