"use client";

import React, { useState, useEffect } from "react";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { formatCurrency, formatDate, getStockStatus } from "@/lib/utils";
import { Product, StockMovement, Category, Supplier } from "@/types/inventory";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  Layers,
  History,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Package,
} from "lucide-react";

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<"inventory" | "movements">("inventory");
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Filter states
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedSup, setSelectedSup] = useState("all");
  const [movementType, setMovementType] = useState("all");

  useEffect(() => {
    setProducts(inventoryStore.getProducts());
    setMovements(inventoryStore.getMovements());
    setCategories(inventoryStore.getCategories());
    setSuppliers(inventoryStore.getSuppliers());
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCat === "all" || p.category_id === selectedCat;
    const matchSup = selectedSup === "all" || p.supplier_id === selectedSup;
    return matchCat && matchSup;
  });

  const filteredMovements = movements.filter((m) => {
    return movementType === "all" || m.type === movementType;
  });

  const totalValuation = filteredProducts.reduce(
    (acc, p) => acc + (p.quantity ?? 0) * p.cost_price,
    0
  );
  const totalRetailValuation = filteredProducts.reduce(
    (acc, p) => acc + (p.quantity ?? 0) * p.selling_price,
    0
  );

  const exportInventoryCSV = () => {
    const headers = [
      "Product Name",
      "SKU",
      "Barcode",
      "Category",
      "Supplier",
      "Current Stock",
      "Unit",
      "Cost Price (PHP)",
      "Selling Price (PHP)",
      "Total Cost Value (PHP)",
      "Total Retail Value (PHP)",
      "Safety Minimum",
      "Status",
    ];

    const rows = filteredProducts.map((p) => {
      const qty = p.quantity ?? 0;
      const status = qty === 0 ? "Out of Stock" : qty <= p.minimum_stock ? "Low Stock" : "In Stock";
      return [
        `"${p.name.replace(/"/g, '""')}"`,
        `"${p.sku}"`,
        `"${p.barcode}"`,
        `"${p.category?.name || "Uncategorized"}"`,
        `"${p.supplier?.name || "Direct"}"`,
        qty,
        `"${p.unit}"`,
        p.cost_price,
        p.selling_price,
        qty * p.cost_price,
        qty * p.selling_price,
        p.minimum_stock,
        status,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `inventory_valuation_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMovementsCSV = () => {
    const headers = [
      "Date & Time",
      "Product",
      "Barcode",
      "Movement Type",
      "Quantity",
      "Previous Stock",
      "New Stock",
      "Operator",
      "PO / Reference",
      "Reason",
    ];

    const rows = filteredMovements.map((m) => {
      return [
        `"${formatDate(m.created_at)}"`,
        `"${m.product?.name || "N/A"}"`,
        `"${m.product?.barcode || "N/A"}"`,
        m.type,
        m.type === "stock_in" ? `+${m.quantity}` : m.quantity,
        m.previous_quantity,
        m.new_quantity,
        `"${m.user?.name || "Staff"}"`,
        `"${m.reference || ""}"`,
        `"${m.reason || ""}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `stock_movement_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Generate inventory valuation reports, stock turnouts, and downloadable spreadsheets
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeReport === "inventory" ? (
            <button
              onClick={exportInventoryCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Inventory CSV</span>
            </button>
          ) : (
            <button
              onClick={exportMovementsCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Movements CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* REPORT TYPE TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveReport("inventory")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeReport === "inventory"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          Inventory Valuation Report
        </button>
        <button
          onClick={() => setActiveReport("movements")}
          className={`px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeReport === "movements"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <History className="w-4 h-4" />
          Stock Movement Ledger Report
        </button>
      </div>

      {/* SUMMARY BANNER */}
      {activeReport === "inventory" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Products in Scope
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {filteredProducts.length} Items
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Cost Asset Value
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalValuation)}
            </span>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Projected Retail Value
            </span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {formatCurrency(totalRetailValuation)}
            </span>
          </div>
        </div>
      )}

      {/* INVENTORY REPORT TABLE */}
      {activeReport === "inventory" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">SKU / Barcode</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-right">Cost Price</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Asset Valuation</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => {
                  const qty = p.quantity ?? 0;
                  const status = getStockStatus(qty, p.minimum_stock);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {p.sku} / {p.barcode}
                      </td>
                      <td className="py-3 px-4">{p.category?.name || "-"}</td>
                      <td className="py-3 px-4 text-center font-bold">
                        {qty} {p.unit}
                      </td>
                      <td className="py-3 px-4 text-right">{formatCurrency(p.cost_price)}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(p.selling_price)}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(qty * p.cost_price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.badgeClass}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MOVEMENTS REPORT TABLE */}
      {activeReport === "movements" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Barcode</th>
                  <th className="py-3 px-4 text-center">Type</th>
                  <th className="py-3 px-4 text-center">Qty Delta</th>
                  <th className="py-3 px-4 text-center">Prev → New</th>
                  <th className="py-3 px-4">Operator</th>
                  <th className="py-3 px-4">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 whitespace-nowrap">{formatDate(m.created_at)}</td>
                    <td className="py-3 px-4 font-bold">{m.product?.name || "Product"}</td>
                    <td className="py-3 px-4 font-mono">{m.product?.barcode}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold uppercase text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                        {m.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      {m.type === "stock_in" ? `+${m.quantity}` : m.quantity}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {m.previous_quantity} → {m.new_quantity}
                    </td>
                    <td className="py-3 px-4">{m.user?.name || "Staff"}</td>
                    <td className="py-3 px-4 text-slate-500">{m.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
