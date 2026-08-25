"use client";

import React, { useState } from "react";
import { useScanner } from "@/components/scanner/USBScannerListener";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { formatCurrency, getStockStatus } from "@/lib/utils";
import { soundFx } from "@/lib/audio/sound-fx";
import { BarcodeBadge } from "@/components/ui/BarcodeBadge";
import Link from "next/link";
import {
  X,
  PackagePlus,
  PackageMinus,
  SlidersHorizontal,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Building,
  Tag,
} from "lucide-react";

export const QuickActionModal: React.FC = () => {
  const { isModalOpen, activeProduct, notFoundBarcode, closeScanModal, openScanModal } = useScanner();

  const [activeTab, setActiveTab] = useState<"overview" | "stock_in" | "stock_out" | "adjust">("overview");
  const [quantity, setQuantity] = useState<number>(1);
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [reason, setReason] = useState<string>("Sale");
  const [reference, setReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fast inline registration state for not-found barcode
  const [isRegistering, setIsRegistering] = useState(false);
  const [regName, setRegName] = useState("");
  const [regSku, setRegSku] = useState("");
  const [regPrice, setRegPrice] = useState("0");
  const [regCost, setRegCost] = useState("0");
  const [regMinStock, setRegMinStock] = useState("10");
  const [regInitialQty, setRegInitialQty] = useState("0");

  if (!isModalOpen) return null;

  const handleStockIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    setErrorMessage(null);

    const res = inventoryStore.stockIn({
      product_id: activeProduct.id,
      type: "stock_in",
      quantity,
      reason: reason || "Standard Stock In",
      reference: reference || `IN-${Date.now().toString().slice(-6)}`,
      notes,
    });

    if (res.success) {
      soundFx.playSuccessChime();
      setActionSuccess(`Successfully added +${quantity} ${activeProduct.unit}. New Stock: ${res.newQuantity}`);
      setTimeout(() => {
        setActionSuccess(null);
        setActiveTab("overview");
        setQuantity(1);
        setReference("");
        setNotes("");
        // Re-read product
        const updated = inventoryStore.getProductById(activeProduct.id);
        if (updated) openScanModal(updated.barcode);
      }, 1400);
    } else {
      soundFx.playErrorBuzz();
      setErrorMessage(res.error || "Stock In failed");
    }
  };

  const handleStockOut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    setErrorMessage(null);

    const res = inventoryStore.stockOut({
      product_id: activeProduct.id,
      type: "stock_out",
      quantity,
      reason: reason || "Customer Sale",
      reference: reference || `OUT-${Date.now().toString().slice(-6)}`,
      notes,
    });

    if (res.success) {
      soundFx.playSuccessChime();
      setActionSuccess(`Successfully deducted -${quantity} ${activeProduct.unit}. New Stock: ${res.newQuantity}`);
      setTimeout(() => {
        setActionSuccess(null);
        setActiveTab("overview");
        setQuantity(1);
        setReference("");
        setNotes("");
        const updated = inventoryStore.getProductById(activeProduct.id);
        if (updated) openScanModal(updated.barcode);
      }, 1400);
    } else {
      soundFx.playErrorBuzz();
      setErrorMessage(res.error || "Stock Out failed");
    }
  };

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct) return;
    setErrorMessage(null);

    const res = inventoryStore.adjustStock({
      product_id: activeProduct.id,
      physical_count: physicalCount,
      reason: reason || "Physical Cycle Count Discrepancy",
      notes,
    });

    if (res.success) {
      soundFx.playSuccessChime();
      setActionSuccess(`Stock adjusted to ${physicalCount}. Diff: ${res.difference > 0 ? "+" : ""}${res.difference}`);
      setTimeout(() => {
        setActionSuccess(null);
        setActiveTab("overview");
        const updated = inventoryStore.getProductById(activeProduct.id);
        if (updated) openScanModal(updated.barcode);
      }, 1400);
    } else {
      soundFx.playErrorBuzz();
      setErrorMessage(res.error || "Adjustment failed");
    }
  };

  const handleRegisterNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notFoundBarcode) return;

    const res = inventoryStore.createProduct(
      {
        name: regName.trim(),
        sku: regSku.trim() || `SKU-${notFoundBarcode.slice(-5)}`,
        barcode: notFoundBarcode.trim(),
        cost_price: parseFloat(regCost) || 0,
        selling_price: parseFloat(regPrice) || 0,
        minimum_stock: parseInt(regMinStock) || 10,
        maximum_stock: 200,
        unit: "pcs",
        location: "Main Floor",
        status: "active",
      },
      parseInt(regInitialQty) || 0
    );

    if (res.success && res.product) {
      soundFx.playSuccessChime();
      setIsRegistering(false);
      openScanModal(res.product.barcode);
    } else {
      soundFx.playErrorBuzz();
      setErrorMessage(res.error || "Registration failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">
              {activeProduct ? "Product Identified" : "Scan Result"}
            </h3>
          </div>
          <button
            onClick={closeScanModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NOT FOUND VIEW */}
        {!activeProduct && notFoundBarcode && (
          <div className="p-6">
            {!isRegistering ? (
              <div className="text-center py-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 dark:bg-amber-950/40 flex items-center justify-center text-amber-500 mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Product Not Found</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  No registered product matches the scanned barcode:
                </p>

                <div className="inline-block mb-6">
                  <BarcodeBadge barcode={notFoundBarcode} size="lg" />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setRegName("");
                      setRegSku(`SKU-${notFoundBarcode.slice(-5)}`);
                      setIsRegistering(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-xs shadow-blue-500/25 flex items-center justify-center gap-2 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Register This Product Now
                  </button>
                  <button
                    onClick={closeScanModal}
                    className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
                  >
                    Dismiss & Continue Scanning
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterNew} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    Quick Register Barcode
                  </h4>
                  <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md">
                    {notFoundBarcode}
                  </span>
                </div>

                {errorMessage && (
                  <div className="p-3 text-xs text-red-600 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Mineral Water 500ml"
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">SKU</label>
                    <input
                      type="text"
                      required
                      value={regSku}
                      onChange={(e) => setRegSku(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Initial Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={regInitialQty}
                      onChange={(e) => setRegInitialQty(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Cost Price (₱)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={regCost}
                      onChange={(e) => setRegCost(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Selling Price (₱) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={regPrice}
                      onChange={(e) => setRegPrice(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs shadow-blue-500/25"
                  >
                    Save & Open
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* FOUND PRODUCT VIEW */}
        {activeProduct && (
          <div className="p-6">
            {/* Notification alert banner */}
            {actionSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Product Card Top */}
            <div className="flex gap-4 items-start pb-4 border-b border-slate-100 dark:border-slate-800">
              {activeProduct.image_url ? (
                <img
                  src={activeProduct.image_url}
                  alt={activeProduct.name}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xl flex-shrink-0">
                  {activeProduct.name.charAt(0)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-bold text-lg text-slate-900 dark:text-slate-50 truncate">
                    {activeProduct.name}
                  </h4>
                  {(() => {
                    const status = getStockStatus(activeProduct.quantity ?? 0, activeProduct.minimum_stock);
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                        {status.label}
                      </span>
                    );
                  })()}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm">
                    SKU: {activeProduct.sku}
                  </span>
                  {activeProduct.category && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3 text-blue-500" />
                      {activeProduct.category.name}
                    </span>
                  )}
                  {activeProduct.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      {activeProduct.location}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Current Stock
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {activeProduct.quantity ?? 0}{" "}
                      <span className="text-xs font-normal text-slate-500">{activeProduct.unit}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Selling Price
                    </span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(activeProduct.selling_price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 my-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "overview"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("stock_in");
                  setQuantity(10);
                  setReason("Supplier Delivery / Batch In");
                }}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  activeTab === "stock_in"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-emerald-600"
                }`}
              >
                <PackagePlus className="w-3.5 h-3.5" />
                Stock In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("stock_out");
                  setQuantity(1);
                  setReason("Customer Sale");
                }}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  activeTab === "stock_out"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-rose-600"
                }`}
              >
                <PackageMinus className="w-3.5 h-3.5" />
                Stock Out
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("adjust");
                  setPhysicalCount(activeProduct.quantity ?? 0);
                  setReason("Physical Cycle Count");
                }}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                  activeTab === "adjust"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-indigo-600"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Adjust
              </button>
            </div>

            {/* TAB CONTENTS */}
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5 font-medium">Cost Price</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(activeProduct.cost_price)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5 font-medium">Profit Margin</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(activeProduct.selling_price - activeProduct.cost_price)} (
                      {(
                        ((activeProduct.selling_price - activeProduct.cost_price) /
                          (activeProduct.cost_price || 1)) *
                        100
                      ).toFixed(0)}
                      %)
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5 font-medium">Min / Max Stock</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {activeProduct.minimum_stock} / {activeProduct.maximum_stock} {activeProduct.unit}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block mb-0.5 font-medium">Supplier</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                      {activeProduct.supplier?.name || "Direct / Local"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <BarcodeBadge barcode={activeProduct.barcode} showVisualLines={false} />
                  <Link
                    href={`/products/${activeProduct.id}`}
                    onClick={closeScanModal}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View Full Product Details
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* STOCK IN FORM */}
            {activeTab === "stock_in" && (
              <form onSubmit={handleStockIn} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Add Quantity ({activeProduct.unit}) *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 5))}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-lg hover:bg-slate-200"
                    >
                      -5
                    </button>
                    <input
                      type="number"
                      min="1"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-3 py-2 text-center text-lg font-black bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 5)}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-lg hover:bg-slate-200"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 20)}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-lg hover:bg-slate-200"
                    >
                      +20
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Reason / Source
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    >
                      <option value="Supplier Delivery">Supplier Delivery</option>
                      <option value="Restock Batch">Restock Batch</option>
                      <option value="Customer Return">Customer Return</option>
                      <option value="Warehouse Transfer In">Warehouse Transfer In</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      PO Reference
                    </label>
                    <input
                      type="text"
                      placeholder="PO-2026-..."
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-xs flex items-center justify-between text-emerald-800 dark:text-emerald-300">
                  <span>
                    New Calculation: <strong>{activeProduct.quantity ?? 0}</strong> + <strong>{quantity}</strong> =
                  </span>
                  <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                    {(activeProduct.quantity ?? 0) + quantity} {activeProduct.unit}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs shadow-emerald-500/25 flex items-center justify-center gap-2 transition-colors"
                >
                  <PackagePlus className="w-4 h-4" />
                  Confirm Stock In
                </button>
              </form>
            )}

            {/* STOCK OUT FORM */}
            {activeTab === "stock_out" && (
              <form onSubmit={handleStockOut} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Remove Quantity ({activeProduct.unit}) *
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-lg hover:bg-slate-200"
                    >
                      -1
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={activeProduct.quantity ?? 0}
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-3 py-2 text-center text-lg font-black bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-lg hover:bg-slate-200"
                    >
                      +1
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 5)}
                      className="px-3 py-2 bg-slate-100 dark:bg-slate-800 font-bold rounded-lg hover:bg-slate-200"
                    >
                      +5
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Stock Out Reason
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    >
                      <option value="Customer Sale">Customer Retail Sale</option>
                      <option value="Damaged / Broken">Damaged / Broken Item</option>
                      <option value="Expired Product">Expired Product</option>
                      <option value="Transfer to Branch">Transfer to Branch</option>
                      <option value="Store Floor Use">Internal Store Consumption</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Receipt / SO Ref
                    </label>
                    <input
                      type="text"
                      placeholder="SALES-..."
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 rounded-xl text-xs flex items-center justify-between text-rose-800 dark:text-rose-300">
                  <span>
                    New Calculation: <strong>{activeProduct.quantity ?? 0}</strong> - <strong>{quantity}</strong> =
                  </span>
                  <span className="font-black text-sm text-rose-600 dark:text-rose-400">
                    {(activeProduct.quantity ?? 0) - quantity} {activeProduct.unit}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-xs shadow-rose-500/25 flex items-center justify-center gap-2 transition-colors"
                >
                  <PackageMinus className="w-4 h-4" />
                  Confirm Stock Out
                </button>
              </form>
            )}

            {/* ADJUST FORM */}
            {activeTab === "adjust" && (
              <form onSubmit={handleAdjust} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      Current System Stock
                    </span>
                    <span className="text-xl font-black text-slate-700 dark:text-slate-300">
                      {activeProduct.quantity ?? 0} {activeProduct.unit}
                    </span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Physical Count *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={physicalCount}
                      onChange={(e) => setPhysicalCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 text-center text-lg font-black bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Discrepancy Reason *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Damaged Items">Damaged Items</option>
                    <option value="Cycle Count Variance">Cycle Count Variance</option>
                    <option value="Theft / Unaccounted Loss">Theft / Unaccounted Loss</option>
                    <option value="Found Unrecorded Stock">Found Unrecorded Stock</option>
                  </select>
                </div>

                {(() => {
                  const diff = physicalCount - (activeProduct.quantity ?? 0);
                  return (
                    <div
                      className={`p-2.5 rounded-xl text-xs flex items-center justify-between font-semibold ${
                        diff < 0
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                          : diff > 0
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      <span>Adjustment Difference:</span>
                      <span className="font-bold text-sm">
                        {diff > 0 ? `+${diff}` : diff} {activeProduct.unit}
                      </span>
                    </div>
                  );
                })()}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs shadow-indigo-500/25 flex items-center justify-center gap-2 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Confirm Stock Adjustment
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
