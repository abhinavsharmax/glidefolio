import { useEffect } from "react";
import { useBookStore } from "../store";

export const useResponsiveBook = () => {
  const { setViewMode } = useBookStore();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Logic Breakpoint: 768px
      if (width < 768) {
        setViewMode("mobile");
      } else {
        setViewMode("desktop");
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setViewMode]);
};
