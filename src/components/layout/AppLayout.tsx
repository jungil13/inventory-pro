"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { useScanner } from "@/components/scanner/USBScannerListener";
import { QuickActionModal } from "@/components/scanner/QuickActionModal";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { supabase } from "@/lib/supabase/client";
import { soundFx } from "@/lib/audio/sound-fx";
import { User, UserRole } from "@/types/inventory";
import { PwaDownloadButton } from "@/components/pwa/PwaInstallPrompt";
import {
  LayoutDashboard,
  Package,
  ScanLine,
  ArrowDownToLine,
  ArrowUpFromLine,
  SlidersHorizontal,
  AlertTriangle,
  History,
  Truck,
  FolderTree,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  Search,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  ChevronDown,
  ShieldCheck,
  Zap,
  Sparkles,
  Barcode,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isScannerActive, toggleScannerActive, openScanModal } = useScanner();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const updateStats = () => {
      const metrics = inventoryStore.getDashboardMetrics();
      setLowStockCount(metrics.low_stock_items + metrics.out_of_stock_items);
      setCurrentUser(inventoryStore.getCurrentUser());
      setUsers(inventoryStore.getUsers());
    };

    // 1. Check existing session on mount
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsHydrated(true);
        if (pathname !== '/login') router.push('/login');
        return;
      }
      // Session exists — load data
      await inventoryStore.initFromSupabase();
      // Link Supabase auth user to the users table by email
      const allUsers = inventoryStore.getUsers();
      const profileUser = allUsers.find(u => u.email === session.user.email);
      if (profileUser) {
        inventoryStore.setCurrentUser(profileUser);
      } else {
        // Fallback: build a minimal user object from auth session
        const fallbackUser: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: 'admin' as UserRole,
          avatar_url: session.user.user_metadata?.avatar_url,
          created_at: session.user.created_at,
          updated_at: session.user.updated_at || session.user.created_at,
        };
        inventoryStore.setCurrentUser(fallbackUser);
      }
      setIsHydrated(true);
      updateStats();
      if (pathname === '/login') router.push('/dashboard');
    };

    initAuth();

    // 2. Reactively respond to login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        inventoryStore.setCurrentUser(null);
        setCurrentUser(null);
        if (pathname !== '/login') {
          window.location.href = '/login';
        }
      } else if (event === 'SIGNED_IN' && session) {
        await inventoryStore.initFromSupabase();
        const allUsers = inventoryStore.getUsers();
        const profileUser = allUsers.find(u => u.email === session.user.email);
        if (profileUser) {
          inventoryStore.setCurrentUser(profileUser);
        } else {
          const fallbackUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: 'admin' as UserRole,
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
          };
          inventoryStore.setCurrentUser(fallbackUser);
        }
        updateStats();
        if (pathname === '/login') router.push('/dashboard');
      }
    });

    const unsubscribe = inventoryStore.subscribe(updateStats);

    return () => {
      unsubscribe();
      subscription.unsubscribe();
    };
  }, []);

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.setEnabled(next);
    if (next) soundFx.playScanBeep();
  };

  const handleThemeToggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSwitchUser = (user: User) => {
    inventoryStore.setCurrentUser(user);
    setCurrentUser(user);
    setIsUserMenuOpen(false);
    soundFx.playSuccessChime();
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await supabase.auth.signOut();
    inventoryStore.setCurrentUser(null);
    setCurrentUser(null);
    window.location.href = '/login';
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickSearchQuery.trim();
    if (!query) return;

    // Check if it's a barcode
    const foundProduct = inventoryStore.findByBarcode(query);
    if (foundProduct) {
      openScanModal(foundProduct.barcode);
    } else {
      router.push(`/products?search=${encodeURIComponent(query)}`);
    }
    setQuickSearchQuery("");
  };

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
    badge?: number;
    badgeColor?: string;
  }

  interface NavSection {
    section: string;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      section: "Overview",
      items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
    },
    {
      section: "Inventory",
      items: [
        { label: "Products", href: "/products", icon: Package },
        { label: "Scan Item", href: "/scan", icon: ScanLine, highlight: true },
        { label: "Stock In", href: "/stock-in", icon: ArrowDownToLine },
        { label: "Stock Out", href: "/stock-out", icon: ArrowUpFromLine },
        { label: "Stock Adjustment", href: "/adjustments", icon: SlidersHorizontal },
        {
          label: "Low Stock",
          href: "/low-stock",
          icon: AlertTriangle,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          badgeColor: "bg-amber-500",
        },
      ],
    },
    {
      section: "Transactions",
      items: [{ label: "Stock Movements", href: "/movements", icon: History }],
    },
    {
      section: "Management",
      items: [
        { label: "Suppliers", href: "/suppliers", icon: Truck },
        { label: "Categories", href: "/categories", icon: FolderTree },
        { label: "Reports", href: "/reports", icon: BarChart3 },
        { label: "Users & Roles", href: "/users", icon: Users },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans pb-16 md:pb-0">
      <NextTopLoader color="#dc2626" showSpinner={false} />
      
      {!isHydrated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            <div className="text-sm font-semibold text-slate-500 animate-pulse">Connecting to Database...</div>
          </div>
        </div>
      )}

      {pathname === '/login' && (
        <main className="flex-1 flex flex-col w-full h-screen">
          {children}
        </main>
      )}

      {pathname !== '/login' && (
        <>
          <QuickActionModal />

      {/* MOBILE SIDEBAR BACKDROP */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-red-600 via-rose-600 to-red-400 bg-clip-text text-transparent">
                InventoryPro
              </span>
              <span className="text-[10px] block font-mono text-slate-400 -mt-1 font-semibold uppercase tracking-wider">
                Barcode System
              </span>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navSections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                {sec.section}
              </div>
              {sec.items.map((item, idx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                        ? "bg-red-600 text-white font-semibold shadow-xs shadow-red-500/20"
                        : item.highlight
                          ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${isActive
                            ? "text-white"
                            : item.highlight
                              ? "text-red-600 dark:text-red-400"
                              : "text-slate-400"
                          }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold rounded-full text-white ${item.badgeColor || "bg-red-600"
                          }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* USB Hardware status widget and PWA Download in sidebar footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <PwaDownloadButton className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold rounded-xl text-xs transition-colors shadow-xs" />

          <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                USB Scanner
              </span>
              <button
                onClick={toggleScannerActive}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors ${isScannerActive
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-800"
                  }`}
              >
                {isScannerActive ? "ACTIVE" : "PAUSED"}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Hardware scanner input is intercepted globally at high speed.
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Quick Search */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 md:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Barcode / SKU / Product Search */}
            <form onSubmit={handleQuickSearchSubmit} className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Scan or search barcode, SKU, name..."
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-red-50 dark:bg-slate-950 border border-transparent dark:border-red-900/30 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-800 dark:text-slate-200"
              />
            </form>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Install / Download App Quick Button */}
            <PwaDownloadButton className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all" />

            {/* Quick Scan Action Button */}
            <Link
              href="/scan"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs shadow-red-500/20 transition-all hover:scale-[1.02]"
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>Scan Barcode</span>
            </Link>

            {/* Sound Toggle */}
            <button
              onClick={handleSoundToggle}
              title={soundEnabled ? "Mute Scanner Beep" : "Unmute Scanner Beep"}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-red-600 dark:text-red-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              title="Toggle Theme"
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-colors"
              >
                <img
                  src={
                    currentUser?.avatar_url ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  }
                  alt={currentUser?.name || "User"}
                  className="w-7 h-7 rounded-lg object-cover"
                />

                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200">
                    {currentUser?.name || "Loading..."}
                  </div>

                  <div className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    {currentUser?.role || "USER"}
                  </div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  {/* Current User Info */}
                  <div className="px-3 py-2.5 mb-1">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={currentUser?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                        alt={currentUser?.name || "User"}
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {currentUser?.name || "User"}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {currentUser?.email || ""}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
                      {currentUser?.role || "admin"}
                    </div>
                  </div>
                  <div className="p-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full text-center px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40 font-bold rounded-lg text-xs transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-1 px-2 safe-area-pb">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${pathname === "/dashboard" ? "text-red-600 dark:text-red-400" : "text-slate-500"
            }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/products"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${pathname === "/products" ? "text-red-600 dark:text-red-400" : "text-slate-500"
            }`}
        >
          <Package className="w-5 h-5" />
          <span>Products</span>
        </Link>

        {/* Central Prominent Floating SCAN Button */}
        <Link
          href="/scan"
          className="relative -top-3 flex flex-col items-center justify-center w-13 h-13 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/40 hover:scale-105 transition-transform"
        >
          <ScanLine className="w-6 h-6" />
        </Link>

        <Link
          href="/stock-in"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${pathname === "/stock-in" ? "text-red-600 dark:text-red-400" : "text-slate-500"
            }`}
        >
          <ArrowDownToLine className="w-5 h-5" />
          <span>Stock In</span>
        </Link>
        <Link
          href="/stock-out"
          className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-semibold transition-colors ${pathname === "/stock-out" ? "text-red-600 dark:text-red-400" : "text-slate-500"
            }`}
        >
          <ArrowUpFromLine className="w-5 h-5" />
          <span>Stock Out</span>
        </Link>
      </nav>
        </>
      )}
    </div>
  );
};
