"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { formatCurrency, getStockStatus } from "@/lib/utils";
import { Product } from "@/types/inventory";
import { BarcodeBadge } from "@/components/ui/BarcodeBadge";
import {
  AlertTriangle,
  PackagePlus,
  ArrowRight,
  Package,
  CheckCircle2,
  Building,
  MapPin,
  ExternalLink,
} from "lucide-react";

export default function LowStockPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const load = () => {
      setProducts(inventoryStore.getProducts());
    };
    load();
    const unsub = inventoryStore.subscribe(load);
    return () => unsub();
  }, []);

  const lowStockItems = products.filter(
    (p) => (p.quantity ?? 0) <= p.minimum_stock
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            Low Stock & Reorder Alerts
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Products at or below their safety threshold that require immediate reordering
          </p>
        </div>

        <span className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs font-bold self-start sm:self-auto">
          {lowStockItems.length} Products Requiring Restock
        </span>
      </div>

      {/* Grid of Low Stock Items */}
      {lowStockItems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">All Stock Levels Optimal</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            No items in your catalog are currently below their minimum safety thresholds.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            Browse Product Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.map((item) => {
            const qty = item.quantity ?? 0;
            const status = getStockStatus(qty, item.minimum_stock);
            const deficit = Math.max(0, item.minimum_stock - qty);
            const suggestedReorder = (item.maximum_stock || 100) - qty;

            return (
              <div
                key={item.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4 hover:border-amber-400/60 dark:hover:border-amber-600/60 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 flex-shrink-0">
                          {item.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/products/${item.id}`}
                          className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 block"
                        >
                          {item.name}
                        </Link>
                        <span className="font-mono text-[11px] text-slate-400">SKU: {item.sku}</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${status.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 text-xs">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Current
                      </span>
                      <span className="text-base font-black text-rose-600 dark:text-rose-400">
                        {qty} {item.unit}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        Min Safety
                      </span>
                      <span className="text-base font-bold text-slate-700 dark:text-slate-300">
                        {item.minimum_stock} {item.unit}
                      </span>
                    </div>
                    <div className="p-2.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block uppercase font-bold">
                        Suggested In
                      </span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                        +{suggestedReorder} {item.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span className="truncate max-w-[200px]">
                      Supplier: <strong>{item.supplier?.name || "Direct Vendor"}</strong>
                    </span>
                    <BarcodeBadge barcode={item.barcode} showVisualLines={false} />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={`/stock-in?productId=${item.id}`}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PackagePlus className="w-4 h-4" />
                    <span>Instant Restock</span>
                  </Link>
                  <Link
                    href={`/products/${item.id}`}
                    className="p-2.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="View details"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
