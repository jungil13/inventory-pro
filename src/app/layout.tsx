import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ScannerProvider } from "@/components/scanner/USBScannerListener";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "InventoryPro - Barcode Inventory Management System",
  description:
    "Enterprise-grade barcode inventory management system for scanning, products, stock in, stock out, suppliers, and movement tracking.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "InventoryPro",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
        <ScannerProvider>
          <AppLayout>{children}</AppLayout>
        </ScannerProvider>
      </body>
    </html>
  );
}
