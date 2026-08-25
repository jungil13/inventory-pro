"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { formatCurrency, getStockStatus } from "@/lib/utils";
import { Product, Category, Supplier } from "@/types/inventory";
import { BarcodeBadge } from "@/components/ui/BarcodeBadge";
import { useScanner } from "@/components/scanner/USBScannerListener";
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ScanLine,
  SlidersHorizontal,
  ExternalLink,
  Tag,
  MapPin,
  Building,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Trash2,
  Edit,
} from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const { openScanModal } = useScanner();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  useEffect(() => {
    const load = () => {
      setProducts(inventoryStore.getProducts());
      setCategories(inventoryStore.getCategories());
      setSuppliers(inventoryStore.getSuppliers());
    };
    load();
    const unsub = inventoryStore.subscribe(load);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  // Filter & Sort logic
  const filteredProducts = React.useMemo(() => {
    return products
      .filter((p) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.barcode.toLowerCase().includes(query) ||
          (p.brand && p.brand.toLowerCase().includes(query)) ||
          (p.category && p.category.name.toLowerCase().includes(query)) ||
          (p.supplier && p.supplier.name.toLowerCase().includes(query));

        const matchesCategory =
          selectedCategory === "all" || p.category_id === selectedCategory;

        const matchesSupplier =
          selectedSupplier === "all" || p.supplier_id === selectedSupplier;

        const qty = p.quantity ?? 0;
        let matchesStatus = true;
        if (statusFilter === "in_stock") {
          matchesStatus = qty > p.minimum_stock;
        } else if (statusFilter === "low_stock") {
          matchesStatus = qty <= p.minimum_stock && qty > 0;
        } else if (statusFilter === "out_of_stock") {
          matchesStatus = qty === 0;
        }

        return matchesQuery && matchesCategory && matchesSupplier && matchesStatus;
      })
      .sort((a, b) => {
        let valA: string | number = a.name.toLowerCase();
        let valB: string | number = b.name.toLowerCase();

        if (sortBy === "stock") {
          valA = a.quantity ?? 0;
          valB = b.quantity ?? 0;
        } else if (sortBy === "price") {
          valA = a.selling_price;
          valB = b.selling_price;
        } else if (sortBy === "created") {
          valA = new Date(a.created_at).getTime();
          valB = new Date(b.created_at).getTime();
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [products, searchQuery, selectedCategory, selectedSupplier, statusFilter, sortBy, sortOrder]);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete product "${name}"?`)) {
      inventoryStore.deleteProduct(id);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Product Name",
      "SKU",
      "Barcode",
      "Category",
      "Supplier",
      "Current Stock",
      "Cost Price",
      "Selling Price",
      "Inventory Value",
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
        `"${p.supplier?.name || "N/A"}"`,
        qty,
        p.cost_price,
        p.selling_price,
        qty * p.cost_price,
        status,
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Product Inventory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage product catalog, SKUs, barcodes, and stock levels ({filteredProducts.length} items found)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/products/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Live Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, SKU, barcode, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier Filter */}
          <div>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Suppliers</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock Qty</option>
              <option value="price">Sort by Price</option>
              <option value="created">Sort by Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-400 mr-1">Status:</span>
          {[
            { id: "all", label: "All Items" },
            { id: "in_stock", label: "🟢 In Stock" },
            { id: "low_stock", label: "🟡 Low Stock" },
            { id: "out_of_stock", label: "🔴 Out of Stock" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                statusFilter === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <Package className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-1">No products found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Try adjusting your search criteria or register a new product.
          </p>
          <Link
            href="/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Product Info</th>
                  <th className="py-3.5 px-4">SKU / Barcode</th>
                  <th className="py-3.5 px-4">Category & Supplier</th>
                  <th className="py-3.5 px-4 text-right">Cost / Selling</th>
                  <th className="py-3.5 px-4 text-center">Stock Level</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredProducts.map((p) => {
                  const qty = p.quantity ?? 0;
                  const status = getStockStatus(qty, p.minimum_stock);

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Product Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-400 flex-shrink-0">
                              {p.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/products/${p.id}`}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 block truncate"
                            >
                              {p.name}
                            </Link>
                            {p.location && (
                              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {p.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU / Barcode */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {p.sku}
                          </div>
                          <BarcodeBadge barcode={p.barcode} showVisualLines={false} />
                        </div>
                      </td>

                      {/* Category & Supplier */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {p.category && (
                            <div className="text-xs font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: p.category.color || "#3b82f6" }}
                              />
                              {p.category.name}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {p.supplier?.name || "Direct Vendor"}
                          </div>
                        </div>
                      </td>

                      {/* Cost / Selling */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(p.selling_price)}
                        </div>
                        <div className="text-[11px] text-slate-400">Cost: {formatCurrency(p.cost_price)}</div>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-block text-center">
                          <span className="font-black text-sm text-slate-900 dark:text-white">
                            {qty} <span className="text-[11px] font-normal text-slate-400">{p.unit}</span>
                          </span>
                          <div className="text-[10px] text-slate-400">
                            Min: {p.minimum_stock} | Max: {p.maximum_stock}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                          {status.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openScanModal(p.barcode)}
                            title="Simulate Barcode Scan"
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                          >
                            <ScanLine className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/products/${p.id}`}
                            title="View Details"
                            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            title="Delete Product"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold">Loading product catalog...</p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
