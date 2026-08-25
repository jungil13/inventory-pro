"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { formatCurrency, formatDate, formatRelativeTime, getStockStatus } from "@/lib/utils";
import { soundFx } from "@/lib/audio/sound-fx";
import { Product, StockMovement } from "@/types/inventory";
import { BarcodeBadge } from "@/components/ui/BarcodeBadge";
import { useScanner } from "@/components/scanner/USBScannerListener";
import {
  Package,
  ArrowLeft,
  ScanLine,
  PackagePlus,
  PackageMinus,
  SlidersHorizontal,
  Printer,
  Edit,
  Trash2,
  MapPin,
  Tag,
  Building,
  History,
  TrendingUp,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
} from "lucide-react";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const productId = resolvedParams.id;
  const { openScanModal } = useScanner();

  const [product, setProduct] = useState<Product | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState("");
  const [editCost, setEditCost] = useState("0");
  const [editPrice, setEditPrice] = useState("0");
  const [editMin, setEditMin] = useState("10");
  const [editMax, setEditMax] = useState("100");
  const [editLocation, setEditLocation] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const loadData = () => {
    const p = inventoryStore.getProductById(productId);
    if (p) {
      setProduct(p);
      setEditName(p.name);
      setEditCost(p.cost_price.toString());
      setEditPrice(p.selling_price.toString());
      setEditMin(p.minimum_stock.toString());
      setEditMax(p.maximum_stock.toString());
      setEditLocation(p.location || "");
      setEditDesc(p.description || "");
      setMovements(inventoryStore.getProductMovements(productId));
    }
  };

  useEffect(() => {
    loadData();
    const unsub = inventoryStore.subscribe(loadData);
    return () => unsub();
  }, [productId]);

  if (!product) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Product Not Found</h3>
        <p className="text-xs text-slate-400 mb-4">This product might have been deleted or the link is invalid.</p>
        <Link href="/products" className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const qty = product.quantity ?? 0;
  const status = getStockStatus(qty, product.minimum_stock);
  const stockPercentage = Math.min(100, Math.round((qty / (product.maximum_stock || 100)) * 100));

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = inventoryStore.updateProduct(product.id, {
      name: editName.trim(),
      cost_price: parseFloat(editCost) || 0,
      selling_price: parseFloat(editPrice) || 0,
      minimum_stock: parseInt(editMin) || 10,
      maximum_stock: parseInt(editMax) || 100,
      location: editLocation.trim(),
      description: editDesc.trim(),
    });

    if (res.success) {
      soundFx.playSuccessChime();
      setIsEditing(false);
    } else {
      soundFx.playErrorBuzz();
      alert(res.error || "Update failed");
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to permanently delete "${product.name}"?`)) {
      inventoryStore.deleteProduct(product.id);
      router.push("/products");
    }
  };

  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                {product.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                {status.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              SKU: {product.sku} • Barcode: {product.barcode}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openScanModal(product.barcode)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <ScanLine className="w-4 h-4" />
            <span>Quick Action</span>
          </button>
          <button
            onClick={handlePrintLabel}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Label</span>
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Edit className="w-4 h-4 text-blue-600" />
            <span>{isEditing ? "Cancel Edit" : "Edit Specs"}</span>
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* EDIT FORM ACCORDION */}
      {isEditing && (
        <form
          onSubmit={handleSaveEdit}
          className="p-5 bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl space-y-4 animate-in slide-in-from-top-3"
        >
          <h3 className="font-bold text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400">
            Edit Product Specifications
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Product Title
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cost Price (₱)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={editCost}
                onChange={(e) => setEditCost(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Selling Price (₱)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min Stock
              </label>
              <input
                type="number"
                required
                value={editMin}
                onChange={(e) => setEditMin(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* TOP GRID: DETAILS & STOCK GAUGE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Identity & Image (1 Col) */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center text-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-44 h-44 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shadow-md mb-4"
            />
          ) : (
            <div className="w-44 h-44 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-5xl text-slate-400 shadow-inner mb-4">
              {product.name.charAt(0)}
            </div>
          )}

          {/* Printable Barcode Badge Display */}
          <div className="w-full py-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 mb-3">
            <BarcodeBadge barcode={product.barcode} size="lg" />
          </div>

          <div className="w-full space-y-2 text-left text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Category</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {product.category?.name || "None"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Supplier</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                {product.supplier?.name || "Direct Vendor"}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Location</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                {product.location || "Unassigned"}
              </span>
            </div>
          </div>
        </div>

        {/* Stock Level Gauge & Financials (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Inventory Gauge */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
                  Current Stock Level
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">{qty}</span>
                  <span className="text-base font-bold text-slate-400">{product.unit}</span>
                </div>
              </div>

              {/* Quick transaction launch buttons */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/stock-in?productId=${product.id}`}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <PackagePlus className="w-4 h-4" /> Stock In
                </Link>
                <Link
                  href={`/stock-out?productId=${product.id}`}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <PackageMinus className="w-4 h-4" /> Stock Out
                </Link>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500 font-semibold">
                <span>0</span>
                <span>Low: {product.minimum_stock}</span>
                <span>Max Capacity: {product.maximum_stock}</span>
              </div>
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${stockPercentage}%` }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    qty <= 0
                      ? "bg-rose-500"
                      : qty <= product.minimum_stock
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />
              </div>
            </div>

            {/* Financial Stats */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Cost Price</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(product.cost_price)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Selling Price</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(product.selling_price)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-slate-400 block mb-0.5">Total Valuation</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {formatCurrency(qty * product.cost_price)}
                </span>
              </div>
            </div>
          </div>

          {/* Movement History Ledger for this Product */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Stock Movement History ({movements.length})
                </h3>
              </div>
            </div>

            {movements.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No movements recorded yet for this item.</p>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {movements.map((m) => {
                  const isStockIn = m.type === "stock_in";
                  const isAdj = m.type === "adjustment";
                  return (
                    <div
                      key={m.id}
                      className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            isStockIn
                              ? "bg-emerald-500/10 text-emerald-600"
                              : isAdj
                              ? "bg-indigo-500/10 text-indigo-600"
                              : "bg-rose-500/10 text-rose-600"
                          }`}
                        >
                          {isStockIn ? (
                            <ArrowDownToLine className="w-4 h-4" />
                          ) : isAdj ? (
                            <SlidersHorizontal className="w-4 h-4" />
                          ) : (
                            <ArrowUpFromLine className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {isStockIn ? "Stock In" : isAdj ? "Adjustment" : "Stock Out"}: {m.reason}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {formatDate(m.created_at)} by {m.user?.name || "Staff"}
                            {m.reference && ` • Ref: ${m.reference}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div
                          className={`font-black text-sm ${
                            isStockIn
                              ? "text-emerald-600"
                              : isAdj && m.quantity > 0
                              ? "text-indigo-600"
                              : "text-rose-600"
                          }`}
                        >
                          {isStockIn ? `+${m.quantity}` : isAdj && m.quantity > 0 ? `+${m.quantity}` : m.quantity}{" "}
                          {product.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {m.previous_quantity} → {m.new_quantity}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
