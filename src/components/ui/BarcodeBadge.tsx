"use client";

import React, { useState } from "react";
import { Copy, Check, Barcode as BarcodeIcon } from "lucide-react";

interface BarcodeBadgeProps {
  barcode: string;
  showVisualLines?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const BarcodeBadge: React.FC<BarcodeBadgeProps> = ({
  barcode,
  showVisualLines = true,
  className = "",
  size = "md",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(barcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate deterministic bar widths based on barcode chars
  const generateBars = (code: string) => {
    const bars: { width: number; isSpace: boolean }[] = [];
    for (let i = 0; i < code.length; i++) {
      const charCode = code.charCodeAt(i);
      const w1 = (charCode % 3) + 1;
      const w2 = ((charCode >> 1) % 3) + 1;
      bars.push({ width: w1, isSpace: false });
      bars.push({ width: w2, isSpace: true });
    }
    // Add guard bars
    bars.unshift({ width: 2, isSpace: false }, { width: 1, isSpace: true }, { width: 2, isSpace: false });
    bars.push({ width: 2, isSpace: false }, { width: 1, isSpace: true }, { width: 2, isSpace: false });
    return bars;
  };

  const bars = generateBars(barcode);

  return (
    <div
      className={`inline-flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 shadow-xs group transition-all hover:border-blue-400 dark:hover:border-blue-500 ${className}`}
    >
      {showVisualLines && (
        <div className="flex items-end justify-center h-8 px-1 mb-1 bg-white rounded-xs">
          {bars.map((bar, idx) => (
            <div
              key={idx}
              style={{ width: `${bar.width * 1.5}px` }}
              className={`h-full ${bar.isSpace ? "bg-transparent" : "bg-black"}`}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-1.5 font-mono text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-300">
        <BarcodeIcon className="w-3.5 h-3.5 text-slate-400" />
        <span>{barcode}</span>
        <button
          type="button"
          onClick={handleCopy}
          title="Copy barcode"
          className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
};
