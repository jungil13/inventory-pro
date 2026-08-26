"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  X,
  Smartphone,
  CheckCircle2,
  Share,
  PlusSquare,
  Sparkles,
  Zap,
  WifiOff,
  ShieldCheck,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Service Worker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.warn("Service Worker registration failed:", err);
          });
      });
    }

    // 2. Check if already running in standalone mode (installed PWA)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMode);
      return isStandaloneMode;
    };

    const standalone = checkStandalone();

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isIosDevice);

    // 4. Capture standard beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user dismissed prompt recently in localStorage
      const dismissedAt = localStorage.getItem("pwa_install_dismissed_at");
      const oneDay = 24 * 60 * 60 * 1000;
      if (!dismissedAt || Date.now() - parseInt(dismissedAt, 10) > oneDay) {
        // Show after a brief 2-second delay for smooth page entrance
        setTimeout(() => {
          setIsOpen(true);
        }, 2000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Handle app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsOpen(false);
      setDeferredPrompt(null);
      console.log("InventoryPro PWA was installed successfully");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    // 6. Listen for custom manual open event from buttons/menus
    const handleOpenTrigger = () => {
      setIsOpen(true);
    };

    window.addEventListener("open-pwa-install", handleOpenTrigger);

    // If iOS and not standalone and not dismissed recently, show prompt
    if (isIosDevice && !standalone) {
      const dismissedAt = localStorage.getItem("pwa_install_dismissed_at");
      const oneDay = 24 * 60 * 60 * 1000;
      if (!dismissedAt || Date.now() - parseInt(dismissedAt, 10) > oneDay) {
        setTimeout(() => {
          setIsOpen(true);
        }, 3000);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("open-pwa-install", handleOpenTrigger);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback for browsers that don't support beforeinstallprompt
      setShowIOSGuide(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsOpen(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setShowIOSGuide(false);
    try {
      localStorage.setItem("pwa_install_dismissed_at", Date.now().toString());
    } catch {
      // safe
    }
  };

  // If already running in standalone mode, do not render popup
  if (isStandalone || isInstalled) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300">
        {/* Header Ribbon */}
        <div className="relative bg-gradient-to-r from-red-600 via-rose-600 to-red-500 p-6 text-white">
          <button
            onClick={handleDismiss}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-lg shadow-black/20 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="InventoryPro Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">
                  Official Web App
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight leading-tight mt-1">
                Install InventoryPro
              </h2>
              <p className="text-xs text-red-100 font-medium">
                High-speed Barcode & Stock Management
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Instant</div>
              <div className="text-[10px] text-slate-500">0s Load Time</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <Smartphone className="w-5 h-5 text-red-500 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Fullscreen</div>
              <div className="text-[10px] text-slate-500">Native Feel</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <WifiOff className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
              <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Offline</div>
              <div className="text-[10px] text-slate-500">Cache Active</div>
            </div>
          </div>

          {/* iOS Specific Instructions if triggered */}
          {showIOSGuide ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 animate-in fade-in">
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-red-500" />
                How to install on iOS / Safari:
              </div>
              <ol className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share button</strong>{" "}
                    <Share className="w-3.5 h-3.5 inline text-blue-500 mb-0.5" /> in your browser toolbar.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>{" "}
                    <PlusSquare className="w-3.5 h-3.5 inline text-slate-700 dark:text-slate-300 mb-0.5" />.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                    3
                  </span>
                  <span>
                    Tap <strong>&quot;Add&quot;</strong> in the top-right corner to launch anytime.
                  </span>
                </li>
              </ol>
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Install <strong>InventoryPro</strong> on your device for rapid hardware barcode scanning, standalone window experience, and offline database synchronization.
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleDismiss}
              className="flex-1 py-3 px-4 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors text-center"
            >
              Maybe Later
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>{showIOSGuide ? "Got It" : "Download / Install"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Helper button component that can be placed anywhere in UI to trigger the PWA download modal
 */
export function PwaDownloadButton({ className }: { className?: string }) {
  const triggerInstall = () => {
    window.dispatchEvent(new CustomEvent("open-pwa-install"));
  };

  return (
    <button
      onClick={triggerInstall}
      title="Download InventoryPro App (PWA)"
      className={
        className ||
        "flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/50 text-xs font-bold rounded-xl transition-all"
      }
    >
      <Download className="w-3.5 h-3.5" />
      <span>Install App</span>
    </button>
  );
}
