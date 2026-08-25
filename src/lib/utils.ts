import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "PHP"): string {
  try {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: currency === "PHP" ? "PHP" : currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount).replace("PHP", "₱");
  } catch {
    return `₱${amount.toFixed(2)}`;
  }
}

export function formatDate(dateString: string | Date): string {
  if (!dateString) return "-";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatRelativeTime(dateString: string | Date): string {
  if (!dateString) return "";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(dateString);
}

export type StockStatusType = "in_stock" | "low_stock" | "out_of_stock";

export function getStockStatus(quantity: number, minStock: number): {
  type: StockStatusType;
  label: string;
  badgeClass: string;
  dotClass: string;
} {
  if (quantity <= 0) {
    return {
      type: "out_of_stock",
      label: "Out of Stock",
      badgeClass: "bg-red-500/10 text-red-500 border-red-500/20 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/40",
      dotClass: "bg-red-500 animate-pulse",
    };
  }
  if (quantity <= minStock) {
    return {
      type: "low_stock",
      label: "Low Stock",
      badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
      dotClass: "bg-amber-500",
    };
  }
  return {
    type: "in_stock",
    label: "In Stock",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
    dotClass: "bg-emerald-500",
  };
}

export function generateRandomBarcode(): string {
  // Generate valid 13-digit EAN-13 style numeric string
  const prefix = "480"; // Philippines prefix standard or internal
  const random = Math.floor(100000000 + Math.random() * 900000000).toString();
  return `${prefix}${random.slice(0, 10)}`;
}

export function generateSKU(categoryName?: string, productName?: string): string {
  const catCode = categoryName
    ? categoryName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "")
    : "PRD";
  const nameCode = productName
    ? productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "")
    : "ITM";
  const random = Math.floor(100 + Math.random() * 900);
  return `${catCode}-${nameCode}-${random}`;
}
