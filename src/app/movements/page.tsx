"use client";

import React, { useState, useEffect } from "react";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { StockMovement, StockMovementType } from "@/types/inventory";
import { BarcodeBadge } from "@/components/ui/BarcodeBadge";
import Link from "next/link";
import {
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  Search,
  Filter,
  Download,
  Calendar,
  Package,
} from "lucide-react";

export default function MovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    const load = () => {
      setMovements(inventoryStore.getMovements());
    };
    load();
    const unsub = inventoryStore.subscribe(load);
    return () => unsub();
  }, []);

  const filteredMovements = movements.filter((m) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      (m.product && m.product.name.toLowerCase().includes(query)) ||
      (m.product && m.product.sku.toLowerCase().includes(query)) ||
      (m.product && m.product.barcode.includes(query)) ||
      (m.reference && m.reference.toLowerCase().includes(query)) ||
      (m.reason && m.reason.toLowerCase().includes(query)) ||
      (m.user && m.user.name.toLowerCase().includes(query));

    const matchesType = selectedType === "all" || m.type === selectedType;

    return matchesQuery && matchesType;
  });

  const handleExportCSV = () => {
    const headers = [
      "Date & Time",
      "Product Name",
      "SKU",
      "Barcode",
      "Movement Type",
      "Quantity Changed",
      "Previous Stock",
      "New Stock",
      "Operator / User",
      "Reference",
      "Reason",
      "Notes",
    ];

    const rows = filteredMovements.map((m) => {
      return [
        `"${formatDate(m.created_at)}"`,
        `"${m.product?.name || "N/A"}"`,
        `"${m.product?.sku || "N/A"}"`,
        `"${m.product?.barcode || "N/A"}"`,
        m.type,
        m.type === "stock_in" ? `+${m.quantity}` : m.quantity,
        m.previous_quantity,
        m.new_quantity,
        `"${m.user?.name || "Staff"}"`,
        `"${m.reference || ""}"`,
        `"${m.reason || ""}"`,
        `"${m.notes || ""}"`,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stock_movements_${new Date().toISOString().split("T")[0]}.csv`);
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
              <History className="w-5 h-5" />
            </div>
            Stock Movement History & Audit Ledger
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Immutable audit record of all stock intake, sales dispatches, and cycle count adjustments
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* FILTERS */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product, barcode, SKU, PO reference, operator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Movement Types</option>
              <option value="stock_in">Stock In Only</option>
              <option value="stock_out">Stock Out Only</option>
              <option value="adjustment">Stock Adjustments Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* MOVEMENTS TABLE */}
      {filteredMovements.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-1">No transaction records found</h3>
          <p className="text-xs text-slate-400">Perform a stock in, stock out, or adjustment to populate the ledger.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Product Info</th>
                  <th className="py-3.5 px-4 text-center">Type</th>
                  <th className="py-3.5 px-4 text-center">Quantity Delta</th>
                  <th className="py-3.5 px-4 text-center">Previous → New</th>
                  <th className="py-3.5 px-4">Operator / Ref</th>
                  <th className="py-3.5 px-4">Reason & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMovements.map((m) => {
                  const isStockIn = m.type === "stock_in";
                  const isAdj = m.type === "adjustment";

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatDate(m.created_at)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {formatRelativeTime(m.created_at)}
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="min-w-[160px]">
                          {m.product ? (
                            <Link
                              href={`/products/${m.product.id}`}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 block truncate"
                            >
                              {m.product.name}
                            </Link>
                          ) : (
                            <span className="font-bold text-slate-400">Unknown Product</span>
                          )}
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                            <span>SKU: {m.product?.sku || "N/A"}</span>
                            <span>•</span>
                            <span>{m.product?.barcode}</span>
                          </div>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            isStockIn
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : isAdj
                              ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                              : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          }`}
                        >
                          {isStockIn ? (
                            <ArrowDownToLine className="w-3.5 h-3.5" />
                          ) : isAdj ? (
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpFromLine className="w-3.5 h-3.5" />
                          )}
                          {isStockIn ? "Stock In" : isAdj ? "Adjustment" : "Stock Out"}
                        </span>
                      </td>

                      {/* Delta */}
                      <td className="py-3.5 px-4 text-center font-mono font-black text-sm whitespace-nowrap">
                        <span
                          className={
                            isStockIn
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isAdj && m.quantity > 0
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-rose-600 dark:text-rose-400"
                          }
                        >
                          {isStockIn ? `+${m.quantity}` : isAdj && m.quantity > 0 ? `+${m.quantity}` : m.quantity}{" "}
                          <span className="text-[11px] font-normal text-slate-400">
                            {m.product?.unit || "units"}
                          </span>
                        </span>
                      </td>

                      {/* Prev -> New */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                          {m.previous_quantity} → <strong className="text-slate-900 dark:text-white">{m.new_quantity}</strong>
                        </span>
                      </td>

                      {/* Operator & Ref */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {m.user?.name || "Staff"}
                        </div>
                        {m.reference && (
                          <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400">
                            {m.reference}
                          </div>
                        )}
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">
                          {m.reason || "-"}
                        </div>
                        {m.notes && <div className="text-[11px] text-slate-400">{m.notes}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
