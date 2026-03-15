"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBookStore } from "../store";
import { useResponsiveBook } from "../hooks/useResponsiveBook";
import { FlipSheet } from "./FlipSheet";
import { PageImage } from "@/components/PageImage";

export const BookContainer: React.FC = () => {
  useResponsiveBook();
  const { viewMode, setTotalPages, currentPage } = useBookStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR, we can't know the viewMode correctly (defaults to desktop).
  // To avoid hydration mismatch, we could render a loader or just render desktop structure but hidden?
  // Or simply suppress hydration warning on the container if we accept the flip.
  // Better: Wait for mount to render complex 3D structure if it differs.

  // Static configuration for pages could be moved outside or memoized with empty deps.
  // Since totalImages is constant 22, we can generate this once.
  const pages = useMemo(() => {
    const totalImages = 22;
    const generatedPages = [];

    for (let i = 0; i < totalImages; i++) {
      // IMPORTANT: Keys must be stable. content is JSX, so it triggers re-render if object changes.
      generatedPages.push({
        id: `page-${i}`,
        content: <PageImage index={i} />,
        type: "image" as const,
      });
    }
    return generatedPages;
  }, []);

  React.useEffect(() => {
    setTotalPages(pages.length);
  }, [pages.length, setTotalPages]);

  // Group pages into physical leaves (Sheets)
  const sheets = useMemo(() => {
    const result = [];

    if (viewMode === "desktop") {
      // Desktop: Pair pages (Front/Back)
      for (let i = 0; i < pages.length; i += 2) {
        result.push({
          index: i / 2,
          front: pages[i],
          back: pages[i + 1] || null,
        });
      }
    } else {
      // Mobile: Single page per sheet
      // Each page is a separate sheet that flips away
      for (let i = 0; i < pages.length; i++) {
        result.push({
          index: i,
          front: pages[i],
          back: null, // Back is empty/irrelevant for single stack flip
        });
      }
    }
    return result;
  }, [pages, viewMode]);

  // Keyboard Navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        useBookStore.getState().nextPage();
      } else if (e.key === "ArrowLeft") {
        useBookStore.getState().prevPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Touch/Swipe Logic
  const touchStartX = React.useRef<number | null>(null);
  const isBlockClick = React.useRef(false);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    // Ignore multi-touch (pinch-zoom)
    if (e.touches.length > 1) {
      touchStartX.current = null;
      return;
    }
    touchStartX.current = e.targetTouches[0].clientX;
    isBlockClick.current = false;
  };

  // Monitor move to cancel swipe if user adds a second finger (starts pinching)
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 1) {
      touchStartX.current = null;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;

    // Check if we ended with multiple touches (unlikely given move check, but safe)
    if (e.changedTouches.length > 1 || e.touches.length > 1) {
      touchStartX.current = null;
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      useBookStore.getState().nextPage();
      isBlockClick.current = true;
    } else if (isRightSwipe) {
      useBookStore.getState().prevPage();
      isBlockClick.current = true;
    }

    // Reset
    touchStartX.current = null;
  };

  const handleZoneClick = (direction: "next" | "prev") => {
    if (isBlockClick.current) {
      isBlockClick.current = false;
      return;
    }
    if (direction === "next") useBookStore.getState().nextPage();
    else useBookStore.getState().prevPage();
  };

  if (!mounted) return <div className="w-full h-screen bg-neutral-900" />;

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-neutral-900 perspective-2500 select-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Branding Header */}
      <div className="absolute top-6 left-0 w-full text-center z-50 pointer-events-none">
        <Link
          href="https://www.polardot.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/30 text-[10px] md:text-xs tracking-[0.2em] uppercase hover:text-white/80 transition-colors pointer-events-auto"
          draggable={false}
        >
          Designed by Polardot
        </Link>
        <Link
          href="https://www.polardot.in"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-fit mx-auto cursor-pointer"
          draggable={false}
        >
          <div className="relative h-10 mt-2 w-32">
            <Image
              src="/images/glidefolio-logo2.png"
              alt="Glidefolio Logo"
              fill
              className="object-contain hover:opacity-100 transition-opacity pointer-events-auto opacity-80"
              draggable={false}
            />
          </div>
        </Link>
      </div>

      <div
        className="relative transition-all duration-500 ease-in-out book-container-responsive"
        style={{
          transformStyle: "preserve-3d",
          transform:
            viewMode === "desktop"
              ? currentPage === 0
                ? "translateX(-25%)" // Front Cover
                : currentPage >= pages.length
                  ? "translateX(25%)" // Back Cover
                  : "translateX(0)"
              : undefined,
        }}
      >
        {/* Tap Zones */}
        <div
          className="absolute inset-y-0 left-0 w-[15%] z-40 cursor-[url('/custom-cursors/left.svg'),_auto]"
          style={{ transform: "translateZ(1000px)" }}
          onClick={(e) => {
            e.stopPropagation();
            handleZoneClick("prev");
          }}
          title="Previous Page"
        />
        <div
          className="absolute inset-y-0 right-0 w-[15%] z-40 cursor-[url('/custom-cursors/right.svg'),_auto]"
          style={{ transform: "translateZ(1000px)" }}
          onClick={(e) => {
            e.stopPropagation();
            handleZoneClick("next");
          }}
          title="Next Page"
        />

        {sheets.map((sheet) => {
          // Virtualization/Culling Logic
          // Only render sheets that are within a certain range of the current page.
          // This prevents the browser from having to composites dozens of 3D layers.

          // Calculate distance from current page buffer
          // Current sheet index vs visible range
          const visibleRange = 2; // Show +/- 2 sheets around the active one

          // Desktop: currentPage is 0, 2, 4... so sheet index matches (currentPage / 2) roughly
          // Mobile: currentPage is 0, 1, 2... so sheet index matches currentPage

          let isActive = false;
          if (viewMode === "desktop") {
            const currentSheetIndex = Math.floor(currentPage / 2);
            isActive =
              Math.abs(sheet.index - currentSheetIndex) <= visibleRange;
          } else {
            isActive = Math.abs(sheet.index - currentPage) <= visibleRange;
          }

          // Always render the last sheet to keep book structure feeling "solid" if needed,
          // or just render if active.
          // For severe flickering, strict culling is better.

          if (!isActive) return null;

          return (
            <FlipSheet
              key={sheet.index}
              sheetIndex={sheet.index}
              frontContent={sheet.front.content}
              backContent={sheet.back?.content}
              totalSheets={sheets.length}
              viewMode={viewMode}
            />
          );
        })}
      </div>
    </div>
  );
};
