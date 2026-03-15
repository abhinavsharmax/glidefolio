"use client";

import React from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { useBookStore } from "../store";

interface FlipPageProps {
  sheetIndex: number;
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  totalSheets: number;
  viewMode: "desktop" | "mobile";
}

export const FlipSheet: React.FC<FlipPageProps> = ({
  sheetIndex,
  frontContent,
  backContent,
  totalSheets,
  viewMode,
}) => {
  const { currentPage } = useBookStore();

  // Determine if this sheet is flipped
  const isFlipped =
    viewMode === "desktop"
      ? currentPage > sheetIndex * 2 // Desktop: Pair based
      : currentPage > sheetIndex; // Mobile: Single page based

  // Use Spring for smooth animation
  const rotateValue = isFlipped ? -180 : 0;

  const springConfig = { damping: 40, stiffness: 300, mass: 1 };
  const rotateSpring = useSpring(rotateValue, springConfig);

  // Update spring when isFlipped changes
  React.useEffect(() => {
    rotateSpring.set(isFlipped ? -180 : 0);
  }, [isFlipped, rotateSpring]);

  // Z-Index Calculation
  const zIndex = useTransform(rotateSpring, (deg) => {
    if (deg > -90) {
      // Right/Top Side (Unflipped)
      return totalSheets - sheetIndex;
    } else {
      // Left/Flipped Side
      return sheetIndex;
    }
  });

  return (
    <motion.div
      style={{
        zIndex,
        rotateY: rotateSpring,
        transformStyle: "preserve-3d",
        transformOrigin: "left center",
      }}
      className={`absolute top-0 h-full cursor-pointer will-change-transform select-none ${viewMode === "desktop"
          ? "w-1/2 right-0" // Desktop: Right half
          : "w-full right-0" // Mobile: Full width
        }`}
    >
      {/* Front Face */}
      <div
        className="absolute inset-0 w-full h-full backface-hidden"
        style={{ backfaceVisibility: "hidden" }}
      >
        {frontContent}
        {/* Removed lighting gradient as requested */}
      </div>

      {/* Back Face */}
      <div
        className={`absolute inset-0 w-full h-full backface-hidden`}
        style={{
          backfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
        }}
      >
        {backContent}
        {/* Removed lighting gradient as requested */}
      </div>
    </motion.div>
  );
};
