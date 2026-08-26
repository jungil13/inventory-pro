import Link from "next/link";
import { PackageX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mb-4">
        <PackageX className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">404 - Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm mb-6">
        The requested inventory page or product record does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
