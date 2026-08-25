"use client";

import React, { useEffect, useRef, useState, createContext, useContext } from "react";
import { soundFx } from "@/lib/audio/sound-fx";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { Product } from "@/types/inventory";

interface ScannerContextType {
  lastScannedBarcode: string | null;
  activeProduct: Product | null;
  notFoundBarcode: string | null;
  isModalOpen: boolean;
  openScanModal: (barcode: string) => void;
  closeScanModal: () => void;
  isScannerActive: boolean;
  toggleScannerActive: () => void;
  scanCount: number;
}

const ScannerContext = createContext<ScannerContextType | undefined>(undefined);

export const useScanner = () => {
  const context = useContext(ScannerContext);
  if (!context) {
    throw new Error("useScanner must be used within a ScannerProvider");
  }
  return context;
};

export const ScannerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(true);
  const [scanCount, setScanCount] = useState(0);

  // Scanner key buffer
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);
  const lastScanTimeRef = useRef<number>(0);

  const processBarcode = (barcode: string) => {
    const cleanCode = barcode.trim();
    if (!cleanCode || cleanCode.length < 3) return;

    // Throttle duplicate scans within 800ms
    const now = Date.now();
    if (now - lastScanTimeRef.current < 600 && cleanCode === lastScannedBarcode) {
      soundFx.playErrorBuzz();
      return;
    }
    lastScanTimeRef.current = now;

    const product = inventoryStore.findByBarcode(cleanCode);
    setLastScannedBarcode(cleanCode);
    setScanCount((c) => c + 1);

    if (product) {
      soundFx.playScanBeep();
      setActiveProduct(product);
      setNotFoundBarcode(null);
      setIsModalOpen(true);
    } else {
      soundFx.playErrorBuzz();
      setActiveProduct(null);
      setNotFoundBarcode(cleanCode);
      setIsModalOpen(true);
    }
  };

  const openScanModal = (barcode: string) => {
    processBarcode(barcode);
  };

  const closeScanModal = () => {
    setIsModalOpen(false);
    setActiveProduct(null);
    setNotFoundBarcode(null);
  };

  const toggleScannerActive = () => {
    setIsScannerActive((prev) => !prev);
  };

  useEffect(() => {
    if (!isScannerActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is typing inside an input/textarea/select/contentEditable, ignore global scanner unless rapid
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable;

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;
      lastKeyTimeRef.current = currentTime;

      // Handle Enter key (Laser/CCD scanners emit Enter at the end of scan)
      if (e.key === "Enter") {
        if (bufferRef.current.length >= 3) {
          // If buffer was populated in high-speed sequence (<60ms average per key)
          const scannedString = bufferRef.current;
          bufferRef.current = "";
          
          if (!isInput || timeDiff < 60) {
            e.preventDefault();
            e.stopPropagation();
            processBarcode(scannedString);
          }
        }
        return;
      }

      // If key is printable single char
      if (e.key && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // If time difference since last key is large (>120ms) and we are not in rapid mode, reset buffer
        if (timeDiff > 120 && bufferRef.current.length > 0) {
          bufferRef.current = "";
        }
        bufferRef.current += e.key;

        // Auto-clear buffer after 300ms if no subsequent key arrives
        setTimeout(() => {
          if (Date.now() - lastKeyTimeRef.current > 200) {
            bufferRef.current = "";
          }
        }, 250);
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [isScannerActive, lastScannedBarcode]);

  return (
    <ScannerContext.Provider
      value={{
        lastScannedBarcode,
        activeProduct,
        notFoundBarcode,
        isModalOpen,
        openScanModal,
        closeScanModal,
        isScannerActive,
        toggleScannerActive,
        scanCount,
      }}
    >
      {children}
    </ScannerContext.Provider>
  );
};
