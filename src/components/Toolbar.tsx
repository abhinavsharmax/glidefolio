"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useBookStore } from "../store";
import { MobilePagePicker } from "./MobilePagePicker";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Info,
  Download,
  Share2,
  Home,
  Mail,
  Copy,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Toolbar: React.FC = () => {
  const { currentPage, totalPages, nextPage, prevPage, setPage, viewMode } =
    useBookStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inputPage, setInputPage] = useState("");

  // Popup States
  const [showInfo, setShowInfo] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMobilePicker, setShowMobilePicker] = useState(false);

  // Download State
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);

  // Share State
  const [linkCopied, setLinkCopied] = useState(false);

  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(
      document.documentElement &&
      !!(
        document.documentElement.requestFullscreen ||
        (document.documentElement as any).webkitRequestFullscreen ||
        (document.documentElement as any).mozRequestFullScreen ||
        (document.documentElement as any).msRequestFullscreen
      ),
    );
  }, []);

  const handleFullscreen = () => {
    const doc = document as any;
    const docEl = document.documentElement as any;

    const requestFullScreen =
      docEl.requestFullscreen ||
      docEl.webkitRequestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.msRequestFullscreen;

    const exitFullScreen =
      doc.exitFullscreen ||
      doc.webkitExitFullscreen ||
      doc.mozCancelFullScreen ||
      doc.msExitFullscreen;

    if (
      !doc.fullscreenElement &&
      !doc.mozFullScreenElement &&
      !doc.webkitFullscreenElement &&
      !doc.msFullscreenElement
    ) {
      if (requestFullScreen) {
        requestFullScreen.call(docEl);
        setIsFullscreen(true);
      }
    } else {
      if (exitFullScreen) {
        exitFullScreen.call(doc);
        setIsFullscreen(false);
      }
    }
  };

  // Sync input with current page when it changes
  useEffect(() => {
    if (viewMode === "desktop") {
      if (currentPage === 0) {
        setInputPage("1");
      } else {
        // Show spread, e.g. "2-3"
        // currentPage 0 -> Page 1
        // currentPage 2 -> Page 2 (Left) & Page 3 (Right)
        // currentPage is index.
        // Index 1 (Left) -> Page 2. Index 2 (Right) -> Page 3.
        const leftPage = currentPage; // Index 1 is displayed at currentPage 2? No.
        // Logic check:
        // currentPage 2. Left is Index 1. Right is Index 2.
        // 1-based: Left is 2. Right is 3.
        const leftNum = currentPage;
        const rightNum = currentPage + 1;
        // Check if rightNum exceeds total?
        // Index 21 is last. totalPages 22.
        if (rightNum > totalPages) setInputPage(`${leftNum}`);
        else setInputPage(`${leftNum}-${rightNum}`);
      }
    } else {
      setInputPage((currentPage + 1).toString());
    }
  }, [currentPage, viewMode, totalPages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits and hyphen
    if (val === "" || /^[\d-]+$/.test(val)) {
      setInputPage(val);
    }
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndSetPage();
  };

  const validateAndSetPage = () => {
    // Parse the first number found
    const match = inputPage.match(/(\d+)/);
    if (!match) {
      // Revert
      resetInputToCurrent();
      return;
    }

    let p = parseInt(match[1]);

    if (isNaN(p)) {
      resetInputToCurrent();
      return;
    }

    // Clamp
    p = Math.max(1, Math.min(p, totalPages));

    if (viewMode === "desktop") {
      // Calculate anchor
      // Input 1 -> 0
      // Input 2 -> 2
      // Input 3 -> 2
      // Input 4 -> 4
      if (p === 1) {
        if (currentPage === 0) resetInputToCurrent();
        else setPage(0);
      } else {
        const anchor = Math.ceil((p - 1) / 2) * 2;
        if (anchor === currentPage) resetInputToCurrent();
        else setPage(anchor);
      }
    } else {
      setPage(p - 1);
    }
  };

  const resetInputToCurrent = () => {
    if (viewMode === "desktop") {
      if (currentPage === 0) setInputPage("1");
      else {
        const leftNum = currentPage;
        const rightNum = currentPage + 1;
        if (rightNum > totalPages) setInputPage(`${leftNum}`);
        else setInputPage(`${leftNum}-${rightNum}`);
      }
    } else {
      setInputPage((currentPage + 1).toString());
    }
  };

  const startDownload = () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadComplete(true);
          setTimeout(() => {
            setIsDownloading(false);
            setDownloadComplete(false);
          }, 2000);
          return 100;
        }
        return prev + 2; // Simulate speed
      });
    }, 50);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleShareWhatsapp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent("Check out this Flipbook: " + window.location.href)}`,
      "_blank",
    );
  };

  const handleShareEmail = () => {
    window.open(
      `mailto:?subject=Check out this Flipbook&body=${encodeURIComponent(window.location.href)}`,
      "_blank",
    );
  };

  // Close popups on click outside (simplified)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".toolbar-popup-trigger")) {
        setShowInfo(false);
        setShowShare(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Close popups on page change
  useEffect(() => {
    if (showInfo) setShowInfo(false);
    if (showShare) setShowShare(false);
  }, [currentPage]);

  // Calculate visual page numbering (1-indexed)
  const displayPage = currentPage + 1;

  return (
    <div
      className="fixed bottom-4 md:bottom-8 inset-x-0 z-[100] flex flex-col items-center select-none pointer-events-none"
      style={{ transform: "translateZ(5000px)" }}
    >
      {/* Popups Area */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{ willChange: "transform, opacity" }}
            className="absolute bottom-20 bg-neutral-900/90 backdrop-blur-md border border-white/10 p-4 rounded-xl text-white w-64 shadow-2xl mb-2 pointer-events-auto"
          >
            <h3 className="font-bold text-lg mb-1">Glidefolio</h3>
            <p className="text-sm text-neutral-400">
              Glidefolio is the all-in-one platform to create, present, and
              share digital brochures and portfolios with a seamless flipbook
              feel.
            </p>
            <div className="mt-3 text-xs text-neutral-500">
              <p>Author: Antigravity</p>
              <p>Version: 1.0.0</p>
              <div className="w-full h-px bg-white/10 my-3"></div>
              <Link
                href="https://www.polardot.in"
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2 text-neutral-400 hover:text-white transition-colors"
              >
                Designed by Polardot
              </Link>
              <Link
                href="https://www.polardot.in"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-fit cursor-pointer"
              >
                <div className="relative h-6 mt-1 opacity-80 hover:opacity-100 transition-opacity w-24">
                  <Image
                    src="/images/info-icon.svg"
                    alt="Glidefolio Logo"
                    fill
                    className="object-contain object-left"
                    draggable={false}
                    priority
                  />
                </div>
              </Link>
            </div>
          </motion.div>
        )}

        {showShare && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{ willChange: "transform, opacity" }}
            className="absolute bottom-20 bg-neutral-900/90 backdrop-blur-md border border-white/10 p-4 rounded-xl text-white w-64 shadow-2xl mb-2 flex flex-col gap-1 pointer-events-auto"
          >
            <button
              onClick={handleShareWhatsapp}
              className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors w-full text-left group"
            >
              <div className="relative w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity">
                <Image
                  src="/images/whatsapp.svg"
                  alt="WhatsApp"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">
                Share on WhatsApp
              </span>
            </button>
            <div className="w-full h-px bg-white/10 my-0.5"></div>
            <button
              onClick={handleShareEmail}
              className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors w-full text-left group"
            >
              <div className="relative w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity">
                <Image
                  src="/images/email.svg"
                  alt="Email"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">
                Share via Email
              </span>
            </button>
            <div className="w-full h-px bg-white/10 my-0.5"></div>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-lg transition-colors w-full text-left group"
            >
              <div className="relative w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity">
                {linkCopied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Image
                    src="/images/copy-link.svg"
                    alt="Copy Link"
                    fill
                    className="object-contain"
                    priority
                  />
                )}
              </div>
              <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">
                {linkCopied ? "Copied!" : "Copy Link"}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Picker */}
      <MobilePagePicker
        isOpen={showMobilePicker}
        onClose={() => setShowMobilePicker(false)}
        currentPage={currentPage}
        totalPages={totalPages}
        onSelectPage={(p) => setPage(p)}
      />

      {/* Main Bar */}
      <div className="w-[90vw] max-w-[600px] h-11 md:h-14 rounded-2xl glass flex items-center justify-between px-3 md:px-4 text-white relative toolbar-popup-trigger border-2 border-white/20 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.2),inset_0_2px_0_0_rgba(255,255,255,0.5),inset_0_0_0_1px_rgba(255,255,255,0.1)] backdrop-blur-xl pointer-events-auto">
        {/* Left Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInfo(!showInfo);
              setShowShare(false);
            }}
            className={`p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-all active:scale-90 ${showInfo ? "bg-white/20" : ""}`}
            title="Info"
          >
            <Info size={18} />
          </button>
          <button
            onClick={() => setPage(0)}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
            title="Go to Home"
          >
            <Home size={18} />
          </button>
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-2 mx-2">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-full disabled:opacity-50 transition-all active:scale-90"
          >
            <ChevronLeft size={20} />
          </button>

          {viewMode === "mobile" ? (
            <button
              onClick={() => setShowMobilePicker(true)}
              className="px-2 py-0.5 hover:bg-white/10 rounded-lg transition-all flex items-center gap-2 group active:scale-95 bg-white/5 border border-white/20"
            >
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium tabular-nums text-white group-hover:text-white transition-colors">
                  {currentPage + 1}
                </span>
                <span className="text-white/40 text-[10px]">
                  / {totalPages}
                </span>
              </div>
              <ChevronLeft
                size={12}
                className="text-white/40 -rotate-90 group-hover:text-white transition-colors"
              />
            </button>
          ) : (
            <form
              onSubmit={handlePageSubmit}
              className="flex items-center gap-2 px-2 py-1 relative group"
              suppressHydrationWarning
            >
              <div className="relative">
                <input
                  type="text"
                  value={inputPage}
                  onChange={handleInputChange}
                  onBlur={validateAndSetPage}
                  onFocus={(e) => e.target.select()}
                  className="w-12 md:w-14 bg-white/5 hover:bg-white/10 focus:bg-white/10 rounded-md text-center font-medium outline-none border border-white/20 focus:border-white/40 transition-all text-xs md:text-sm select-text py-0.5"
                  suppressHydrationWarning
                />
              </div>
              <span className="text-white/40 text-[10px] md:text-xs font-medium">
                / {totalPages}
              </span>
            </form>
          )}

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
            className="p-1.5 md:p-2 hover:bg-white/10 rounded-full disabled:opacity-50 transition-all active:scale-90"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Scrubber (Simple) */}
        {viewMode === "desktop" && (
          <div className="flex-1 mx-2 hidden md:block">
            <input
              type="range"
              min="0"
              max={viewMode === "desktop" ? totalPages : totalPages - 1}
              step={viewMode === "desktop" ? 2 : 1}
              value={currentPage}
              onChange={(e) => setPage(parseInt(e.target.value))}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
            />
          </div>
        )}

        {/* Right Tools */}
        <div className="flex items-center gap-1">
          {/* Download Button with Progress */}
          <div className="relative">
            {isDownloading ? (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full min-w-[100px]">
                {downloadComplete ? (
                  <span className="text-xs text-green-400 font-bold whitespace-nowrap">
                    Done
                  </span>
                ) : (
                  <>
                    <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-500"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] w-8 tabular-nums">
                      {Math.round((100 - downloadProgress) / 20)}s
                    </span>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={startDownload}
                className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
                title="Download PDF"
              >
                <Download size={18} />
              </button>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowShare(!showShare);
              setShowInfo(false);
            }}
            className={`p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-all active:scale-90 ${showShare ? "bg-white/20" : ""}`}
            title="Share"
          >
            <Share2 size={18} />
          </button>

          {isSupported && (
            <>
              <div className="w-px h-6 bg-white/20 mx-1"></div>
              <button
                onClick={handleFullscreen}
                className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
                title="Toggle Fullscreen"
                suppressHydrationWarning
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
