"use client";

import React, { useState } from "react";
import { CameraScanner } from "@/components/scanner/CameraScanner";
import { useScanner } from "@/components/scanner/USBScannerListener";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { formatCurrency, getStockStatus } from "@/lib/utils";
import { BarcodeBadge } from "@/components/ui/BarcodeBadge";
import Link from "next/link";
import {
  ScanLine,
  Keyboard,
  Zap,
  Package,
  PackagePlus,
  PackageMinus,
  SlidersHorizontal,
  ExternalLink,
  PlusCircle,
  Sparkles,
  Search,
  CheckCircle,
  AlertCircle,
  Layers,
} from "lucide-react";

export default function ScanPage() {
  const { openScanModal, isScannerActive, lastScannedBarcode, scanCount } = useScanner();

  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(true);
  const [continuousMode, setContinuousMode] = useState(false);

  const sampleBarcodes = [
    { label: "Coca-Cola 1.5L", code: "4801234567890", stock: 25 },
    { label: "Pepsi 1.5L", code: "4801234567891", stock: 12 },
    { label: "Pancit Canton", code: "4801234567892", stock: 140 },
    { label: "USB-C Cable", code: "4801234567893", stock: 4 },
    { label: "A4 Bond Paper", code: "4801234567894", stock: 45 },
    { label: "Unregistered Item", code: "4809999000123", stock: 0 },
  ];

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    openScanModal(manualCode.trim());
    setManualCode("");
  };

  const handleCameraScan = (detectedCode: string) => {
    openScanModal(detectedCode);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ScanLine className="w-7 h-7 text-blue-600" />
            Barcode Scanner Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Scan via camera or USB handheld scanner to instantly perform stock operations
          </p>
        </div>

        {/* Hardware scanner status pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>USB Scanner Ready (Total Scans: {scanCount})</span>
        </div>
      </div>

      {/* MAIN SCANNING VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Camera Viewfinder (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-blue-500" />
                Live Camera Scanner
              </span>
              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {cameraActive ? "Pause Camera" : "Resume Camera"}
              </button>
            </div>

            <CameraScanner onScan={handleCameraScan} active={cameraActive} />

            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Supports EAN-13, EAN-8, UPC-A, UPC-E, Code 128, Code 39, ITF</span>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                Auto-Focus: ON
              </span>
            </div>
          </div>

          {/* Manual Input Search Fallback */}
          <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-slate-400" />
              Enter Barcode Manually
            </h3>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Type or paste barcode digits (e.g. 4801234567890)"
                className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs shadow-blue-500/20 flex items-center gap-1.5 transition-colors"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Right Info & Quick Demo Presets (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Quick Hardware Instructions */}
          <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl shadow-md space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-300" />
              </div>
              <h3 className="font-black text-sm">USB & Bluetooth Wedge Scanner</h3>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed">
              Your physical laser scanner operates as a global input device. Simply point and shoot at any barcode
              without needing to click on any text fields.
            </p>
            <div className="p-2.5 bg-blue-950/40 rounded-xl text-[11px] font-mono border border-blue-400/20 flex items-center justify-between">
              <span>SCAN → IDENTIFY → ACTION</span>
              <span className="font-bold text-amber-300">INSTANT</span>
            </div>
          </div>

          {/* Test Barcode Presets */}
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1-Click Test Barcodes
              </h3>
              <span className="text-[10px] text-slate-400">Click to simulate scan</span>
            </div>

            <div className="space-y-2">
              {sampleBarcodes.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => openScanModal(item.code)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl text-left flex items-center justify-between transition-all group"
                >
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate group-hover:text-blue-600">
                      {item.label}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{item.code}</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    Scan →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
