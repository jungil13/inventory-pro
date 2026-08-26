"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { formatCurrency, formatRelativeTime, getStockStatus } from "@/lib/utils";
import { Product, StockMovement, DashboardMetrics } from "@/types/inventory";
import { BarcodeBadge } from "@/components/ui/BarcodeBadge";
import {
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  CircleDollarSign,
  ArrowDownToLine,
  ArrowUpFromLine,
  ScanLine,
  Plus,
  TrendingUp,
  History,
  ArrowRight,
  ShieldAlert,
  Boxes,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    total_products: 0,
    total_stock_items: 0,
    low_stock_items: 0,
    out_of_stock_items: 0,
    total_stock_value: 0,
    today_stock_in: 0,
    today_stock_out: 0,
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadData = () => {
      setMetrics(inventoryStore.getDashboardMetrics());
      setProducts(inventoryStore.getProducts());
      setMovements(inventoryStore.getMovements(8));
    };

    loadData();
    const unsubscribe = inventoryStore.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // Compute charts data
  const categoryData = React.useMemo(() => {
    const cats = inventoryStore.getCategories();
    return cats.map((c) => ({
      name: c.name,
      value: products.filter((p) => p.category_id === c.id).length,
      color: c.color || "#3b82f6",
    }));
  }, [products]);

  // Movement weekly trend data — computed from actual movements (last 7 days)
  const movementTrendData = React.useMemo(() => {
    const allMovements = inventoryStore.getMovements(500);
    const days: { day: string; stockIn: number; stockOut: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const stockIn = allMovements
        .filter(m => m.created_at?.startsWith(dateStr) && m.type === 'stock_in')
        .reduce((sum, m) => sum + m.quantity, 0);
      const stockOut = allMovements
        .filter(m => m.created_at?.startsWith(dateStr) && m.type === 'stock_out')
        .reduce((sum, m) => sum + m.quantity, 0);
      days.push({ day: label, stockIn, stockOut });
    }
    return days;
  }, [movements]);


  const lowStockItems = products.filter((p) => (p.quantity ?? 0) <= p.minimum_stock);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Welcome Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Inventory Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time barcode inventory management, stock levels & movement analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/scan"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <ScanLine className="w-4 h-4" />
            <span>Open Barcode Scanner</span>
          </Link>
          <Link
            href="/products/new"
            className="px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Products */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Products
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {metrics.total_products}
            </span>
            <span className="text-xs font-semibold text-slate-400">SKUs</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">Active</span> in catalog
          </div>
        </div>

        {/* Total Stock Items */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Units
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {metrics.total_stock_items.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-400">units</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Across warehouse racks</div>
        </div>

        {/* Low / Out of Stock Alert Card */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Low / Out of Stock
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {metrics.low_stock_items}
            </span>
            {metrics.out_of_stock_items > 0 && (
              <span className="text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full">
                {metrics.out_of_stock_items} zero
              </span>
            )}
          </div>
          <Link
            href="/low-stock"
            className="mt-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            Review & restock items <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Stock Value */}
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Stock Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white truncate">
              {formatCurrency(metrics.total_stock_value)}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Asset valuation at cost</div>
        </div>
      </div>

      {/* TODAY'S IN/OUT QUICK BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                Today's Stock In
              </span>
              <span className="text-xl font-black text-emerald-900 dark:text-emerald-100">
                +{metrics.today_stock_in} units
              </span>
            </div>
          </div>
          <Link
            href="/stock-in"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            + Add In
          </Link>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
              <ArrowUpFromLine className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 block">
                Today's Stock Out
              </span>
              <span className="text-xl font-black text-rose-900 dark:text-rose-100">
                -{metrics.today_stock_out} units
              </span>
            </div>
          </div>
          <Link
            href="/stock-out"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            - Remove
          </Link>
        </div>
      </div>

      {/* CHARTS SECTION */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Movement Chart */}
          <div className="lg:col-span-2 p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Stock Movements (In vs Out)
                </h3>
                <p className="text-xs text-slate-500">Weekly intake vs dispatches</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> Stock In
                </span>
                <span className="flex items-center gap-1.5 text-rose-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Stock Out
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movementTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="stockIn" fill="#10b981" radius={[6, 6, 0, 0]} name="Stock In" />
                  <Bar dataKey="stockOut" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Stock Out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">
                Products by Category
              </h3>
              <p className="text-xs text-slate-500 mb-4">Inventory category breakdown</p>

              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "10px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {categoryData.slice(0, 4).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{c.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{c.value} items</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LOWER SECTION: RECENT ACTIVITY & LOW STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed (2 Cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Recent Activity</h3>
            </div>
            <Link
              href="/movements"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              View Full History <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {movements.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent stock movements recorded.</p>
            ) : (
              movements.map((m) => {
                const isStockIn = m.type === "stock_in";
                const isAdjustment = m.type === "adjustment";
                return (
                  <div
                    key={m.id}
                    className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                          isStockIn
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : isAdjustment
                            ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                            : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        }`}
                      >
                        {isStockIn ? (
                          <ArrowDownToLine className="w-4 h-4" />
                        ) : isAdjustment ? (
                          <SlidersHorizontal className="w-4 h-4" />
                        ) : (
                          <ArrowUpFromLine className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {m.user?.name || "Warehouse Staff"}
                          </span>{" "}
                          {isStockIn ? "added" : isAdjustment ? "adjusted" : "removed"}{" "}
                          <span className="font-black">
                            {Math.abs(m.quantity)} {m.product?.unit || "units"}
                          </span>{" "}
                          of <span className="underline decoration-slate-300">{m.product?.name || "Product"}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{formatRelativeTime(m.created_at)}</span>
                          <span>•</span>
                          <span className="truncate">{m.reason}</span>
                          {m.reference && (
                            <>
                              <span>•</span>
                              <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded-xs">
                                {m.reference}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span
                        className={`font-black text-sm block ${
                          isStockIn
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isAdjustment
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {isStockIn ? `+${m.quantity}` : isAdjustment && m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        New: {m.new_quantity}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Low Stock Watchlist (1 Col) */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Low Stock Items</h3>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                {lowStockItems.length} items
              </span>
            </div>

            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">All inventory healthy</p>
                  <p className="text-[11px]">No items at or below minimum threshold</p>
                </div>
              ) : (
                lowStockItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-amber-500/5 dark:bg-amber-950/20 rounded-xl border border-amber-500/20 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">{item.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        Stock: <span className="font-bold text-amber-600">{item.quantity}</span> / Min:{" "}
                        {item.minimum_stock} {item.unit}
                      </p>
                    </div>

                    <Link
                      href={`/stock-in?productId=${item.id}`}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg shadow-xs whitespace-nowrap transition-colors"
                    >
                      Restock
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            href="/low-stock"
            className="w-full mt-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
          >
            View Low Stock Manager <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
