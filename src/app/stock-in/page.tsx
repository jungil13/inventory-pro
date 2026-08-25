"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { formatCurrency, getStockStatus } from "@/lib/utils";
import { soundFx } from "@/lib/audio/sound-fx";
import { Product, Supplier } from "@/types/inventory";
import { BarcodeBadge } from "@/components/ui/BarcodeBadge";
import { useScanner } from "@/components/scanner/USBScannerListener";
import {
  ArrowDownToLine,
  ScanLine,
  Search,
  Package,
  CheckCircle2,
  AlertCircle,
  Building,
  FileText,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function StockInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get("productId");
  const { openScanModal } = useScanner();

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [barcodeInput, setBarcodeInput] = useState("");
  const [quantity, setQuantity] = useState<number>(10);
  const [supplierId, setSupplierId] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [reason, setReason] = useState<string>("Supplier Batch Delivery");
  const [notes, setNotes] = useState<string>("");

  const [successResult, setSuccessResult] = useState<{
    prev: number;
    newQty: number;
    added: number;
    productName: string;
    unit: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = () => {
    const prods = inventoryStore.getProducts();
    const sups = inventoryStore.getSuppliers();
    setProducts(prods);
    setSuppliers(sups);

    if (initialProductId) {
      const found = prods.find((p) => p.id === initialProductId);
      if (found) {
        setSelectedProduct(found);
        setSupplierId(found.supplier_id || "");
        setReference(`PO-2026-${Date.now().toString().slice(-4)}`);
      }
    }
  };

  useEffect(() => {
    loadData();
    const unsub = inventoryStore.subscribe(loadData);
    return () => unsub();
  }, [initialProductId]);

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
      setSupplierId(found.supplier_id || "");
      setReference(`PO-2026-${Date.now().toString().slice(-4)}`);
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
      setSupplierId(found.supplier_id || "");
      setReference(`PO-2026-${Date.now().toString().slice(-4)}`);
      setErrorMessage(null);
      setSuccessResult(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setErrorMessage(null);

    const res = inventoryStore.stockIn({
      product_id: selectedProduct.id,
      type: "stock_in",
      quantity,
      reason,
      reference,
      supplier_id: supplierId || undefined,
      notes,
    });

    if (res.success) {
      soundFx.playSuccessChime();
      setSuccessResult({
        prev: res.previousQuantity,
        newQty: res.newQuantity,
        added: quantity,
        productName: selectedProduct.name,
        unit: selectedProduct.unit,
      });

      // Update active view
      const updated = inventoryStore.getProductById(selectedProduct.id);
      setSelectedProduct(updated);

      // Reset form fields
      setQuantity(10);
      setNotes("");
      setReference(`PO-2026-${Date.now().toString().slice(-4)}`);
    } else {
      soundFx.playErrorBuzz();
      setErrorMessage(res.error || "Stock in failed");
    }
  };

  const currentStock = selectedProduct?.quantity ?? 0;
  const newProjectedStock = currentStock + (quantity || 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowDownToLine className="w-5 h-5" />
          </div>
          Stock In (Receive Inventory)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Receive purchase orders, supplier shipments, and log additions into the inventory ledger
        </p>
      </div>

      {/* Success Notification Banner */}
      {successResult && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center justify-between gap-3 animate-in zoom-in-95">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm">
                Successfully added +{successResult.added} {successResult.unit} to {successResult.productName}!
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400">
                Stock updated from {successResult.prev} to{" "}
                <strong className="text-emerald-800 dark:text-emerald-100">{successResult.newQty} {successResult.unit}</strong>.
                Stock movement recorded.
              </div>
            </div>
          </div>
          <button
            onClick={() => setSuccessResult(null)}
            className="text-xs font-semibold px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Ready for Next
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

      {/* STEP 1: SCAN OR SELECT PRODUCT */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-blue-500" />
          Step 1: Identify Product
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Barcode Fast Scan */}
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
                className="flex-1 px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Find
              </button>
            </div>
          </form>

          {/* Catalog Dropdown Select */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Or Choose from Catalog
            </label>
            <select
              value={selectedProduct?.id || ""}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.quantity ?? 0} {p.unit} in stock)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* STEP 2: STOCK IN DETAILS FORM */}
      {selectedProduct && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-3">
          {/* Selected Product Card */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                {selectedProduct.image_url ? (
                  <img
                    src={selectedProduct.image_url}
                    alt={selectedProduct.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-xl flex-shrink-0">
                    {selectedProduct.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {selectedProduct.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
                      SKU: {selectedProduct.sku}
                    </span>
                    <BarcodeBadge barcode={selectedProduct.barcode} showVisualLines={false} />
                  </div>
                </div>
              </div>

              {/* Current Stock Display */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-right sm:min-w-[140px]">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Current Stock
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {currentStock}{" "}
                  <span className="text-xs font-normal text-slate-400">{selectedProduct.unit}</span>
                </span>
              </div>
            </div>

            {/* Input fields */}
            <div className="space-y-4 pt-2">
              {/* Quantity Selector with Stepper Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Receive Quantity ({selectedProduct.unit}) *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 10))}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold rounded-xl text-xs"
                  >
                    -10
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold rounded-xl text-xs"
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-4 py-2 text-center text-xl font-black bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold rounded-xl text-xs"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 10)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold rounded-xl text-xs"
                  >
                    +10
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 50)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold rounded-xl text-xs"
                  >
                    +50
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supplier / Source
                  </label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value="">Direct / Unspecified</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PO Reference Number
                  </label>
                  <input
                    type="text"
                    required
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="PO-2026-001"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Intake Reason
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <option value="Supplier Batch Delivery">Supplier Batch Delivery</option>
                    <option value="Restock Order">Restock Order</option>
                    <option value="Customer Return">Customer Return</option>
                    <option value="Warehouse Transfer In">Warehouse Transfer In</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes / Inspector Comments
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Inspected by quality team, all cartons sealed."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              {/* Real-time Calculation Ledger Preview */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block tracking-wider">
                    Atomic Inventory Ledger Calculation
                  </span>
                  <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 mt-0.5">
                    Current: <strong>{currentStock}</strong> + Stock In: <strong>{quantity}</strong> =
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {newProjectedStock}{" "}
                    <span className="text-xs font-normal text-emerald-700 dark:text-emerald-300">
                      {selectedProduct.unit}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Clear Selection
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Confirm Stock In & Record Movement</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
