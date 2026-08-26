"use client";

import React, { useState, useEffect } from "react";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { formatCurrency } from "@/lib/utils";
import { soundFx } from "@/lib/audio/sound-fx";
import { Product } from "@/types/inventory";
import { BarcodeBadge } from "@/components/ui/BarcodeBadge";
import {
  SlidersHorizontal,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  Package,
  History,
  ShieldCheck,
} from "lucide-react";

export default function AdjustmentsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [barcodeInput, setBarcodeInput] = useState("");
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [reason, setReason] = useState<string>("Physical Cycle Count Discrepancy");
  const [notes, setNotes] = useState<string>("");

  const [successResult, setSuccessResult] = useState<{
    prev: number;
    newQty: number;
    diff: number;
    productName: string;
    unit: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = () => {
    const prods = inventoryStore.getProducts();
    setProducts(prods);
  };

  useEffect(() => {
    loadData();
    const unsub = inventoryStore.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessResult(null);

    const clean = barcodeInput.trim();
    if (!clean) return;

    const found = inventoryStore.findByBarcode(clean) || inventoryStore.findBySku(clean);
    if (found) {
      soundFx.playScanBeep();
      setSelectedProduct(found);
      setPhysicalCount(found.quantity ?? 0);
      setBarcodeInput("");
    } else {
      soundFx.playErrorBuzz();
      setErrorMessage(`No product found matching barcode or SKU "${clean}".`);
    }
  };

  const handleProductSelect = (id: string) => {
    const found = products.find((p) => p.id === id);
    if (found) {
      setSelectedProduct(found);
      setPhysicalCount(found.quantity ?? 0);
      setErrorMessage(null);
      setSuccessResult(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setErrorMessage(null);

    const res = inventoryStore.adjustStock({
      product_id: selectedProduct.id,
      physical_count: physicalCount,
      reason,
      notes,
    });

    if (res.success) {
      soundFx.playSuccessChime();
      setSuccessResult({
        prev: res.previousQuantity,
        newQty: res.newQuantity,
        diff: res.difference,
        productName: selectedProduct.name,
        unit: selectedProduct.unit,
      });

      const updated = inventoryStore.getProductById(selectedProduct.id);
      setSelectedProduct(updated);
      setNotes("");
    } else {
      soundFx.playErrorBuzz();
      setErrorMessage(res.error || "Adjustment failed");
    }
  };

  const currentStock = selectedProduct?.quantity ?? 0;
  const difference = physicalCount - currentStock;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          Inventory Stock Adjustment
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Reconcile system quantities with physical warehouse cycle counts and log audit explanations
        </p>
      </div>

      {/* Success Notification */}
      {successResult && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-between gap-3 animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm">
                Stock for {successResult.productName} adjusted to {successResult.newQty} {successResult.unit} (Variance:{" "}
                {successResult.diff > 0 ? `+${successResult.diff}` : successResult.diff})
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">
                Audit log and adjustment movement created under active user session.
              </div>
            </div>
          </div>
          <button
            onClick={() => setSuccessResult(null)}
            className="text-xs font-semibold px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: SCAN OR SELECT */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-indigo-500" />
          Step 1: Locate Product to Adjust
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <form onSubmit={handleBarcodeSearch} className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Scan Barcode / SKU
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan or enter barcode..."
                className="flex-1 px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Find
              </button>
            </div>
          </form>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Or Choose from Catalog
            </label>
            <select
              value={selectedProduct?.id || ""}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current: {p.quantity ?? 0} {p.unit})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* STEP 2: RECONCILIATION */}
      {selectedProduct && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-3">
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              {selectedProduct.image_url ? (
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-lg flex-shrink-0">
                  {selectedProduct.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                  {selectedProduct.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
                    SKU: {selectedProduct.sku}
                  </span>
                  <span>•</span>
                  <span>Location: {selectedProduct.location || "Warehouse"}</span>
                </div>
              </div>
            </div>

            {/* Reconciliation Comparison Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  System Stock (Recorded)
                </span>
                <span className="text-3xl font-black text-slate-700 dark:text-slate-300">
                  {currentStock}{" "}
                  <span className="text-xs font-normal text-slate-400">{selectedProduct.unit}</span>
                </span>
              </div>

              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-900">
                <label className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                  Actual Physical Count *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={physicalCount === 0 ? "0" : physicalCount || ""}
                  onFocus={(e) => {
                    if (e.target.value === "0") e.target.select();
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setPhysicalCount(0);
                    } else {
                      const parsed = parseInt(val, 10);
                      setPhysicalCount(isNaN(parsed) ? 0 : Math.max(0, parsed));
                    }
                  }}
                  className="w-full px-3 py-1.5 text-2xl font-black bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-800 rounded-xl text-indigo-950 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div
                className={`p-4 rounded-2xl border flex flex-col justify-between ${
                  difference < 0
                    ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300"
                    : difference > 0
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300"
                    : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider block">
                  Variance / Difference
                </span>
                <span className="text-3xl font-black">
                  {difference > 0 ? `+${difference}` : difference}{" "}
                  <span className="text-xs font-normal">{selectedProduct.unit}</span>
                </span>
              </div>
            </div>

            {/* Reason & Audit Notes */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Discrepancy Explanation / Audit Reason *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="Damaged Items (Unsalable / Discarded)">Damaged Items (Unsalable / Discarded)</option>
                  <option value="Cycle Count Variance (Counting Discrepancy)">Cycle Count Variance (Counting Discrepancy)</option>
                  <option value="Theft / Unaccounted Warehouse Loss">Theft / Unaccounted Warehouse Loss</option>
                  <option value="Found Unrecorded Extra Stock">Found Unrecorded Extra Stock</option>
                  <option value="Supplier Mispick Discovered">Supplier Mispick Discovered</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Inspector Notes & Verification Details
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Details of the physical count verification, batch inspection, supervisor approval..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Confirm Stock Adjustment</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
