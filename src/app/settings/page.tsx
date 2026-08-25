"use client";

import React, { useState, useEffect } from "react";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { soundFx } from "@/lib/audio/sound-fx";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { SystemSettings } from "@/types/inventory";
import {
  Settings as SettingsIcon,
  Save,
  Volume2,
  Zap,
  Building,
  DollarSign,
  ShieldAlert,
  Database,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(inventoryStore.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    setSettings(inventoryStore.getSettings());
    setSupabaseConnected(isSupabaseConfigured());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    inventoryStore.updateSettings(settings);
    soundFx.setEnabled(settings.beep_sound_enabled);
    soundFx.setVolume(settings.beep_volume);
    soundFx.playSuccessChime();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetData = () => {
    if (
      confirm(
        "Are you sure you want to reset all inventory to the initial factory seed data (Coca-Cola, Pepsi, Pancit Canton, USB Cable, Bond Paper)?"
      )
    ) {
      inventoryStore.resetToDefaults();
      soundFx.playSuccessChime();
      alert("Inventory restored to initial factory seed state.");
      window.location.reload();
    }
  };

  const testBeep = () => {
    soundFx.playScanBeep();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5" />
            </div>
            System & Hardware Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure barcode hardware listeners, negative stock policies, and database connections
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>System settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Info */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-500" />
            Company & Currency Configuration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company / Organization Name
              </label>
              <input
                type="text"
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Primary Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
              >
                <option value="PHP">₱ Philippine Peso (PHP)</option>
                <option value="USD">$ US Dollar (USD)</option>
                <option value="EUR">€ Euro (EUR)</option>
                <option value="SGD">S$ Singapore Dollar (SGD)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Barcode Scanner & Sound Effects */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-500" />
            Barcode Hardware & Audio Synthesizer
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                  Audible Scanner Beep
                </span>
                <span className="text-xs text-slate-500">
                  Synthesizes high-frequency laser scan confirmation beeps via Web Audio API
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.beep_sound_enabled}
                onChange={(e) => setSettings({ ...settings, beep_sound_enabled: e.target.checked })}
                className="w-5 h-5 rounded-md text-blue-600 focus:ring-blue-500"
              />
            </div>

            {settings.beep_sound_enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Beep Volume ({Math.round(settings.beep_volume * 100)}%)
                    </label>
                    <button
                      type="button"
                      onClick={testBeep}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      Test Beep 🔊
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.beep_volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setSettings({ ...settings, beep_volume: v });
                      soundFx.setVolume(v);
                    }}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Accidental Double-Scan Debounce (ms)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    step="50"
                    value={settings.scanner_debounce_ms}
                    onChange={(e) =>
                      setSettings({ ...settings, scanner_debounce_ms: parseInt(e.target.value) || 300 })
                    }
                    className="w-full px-3.5 py-1.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ignores identical barcodes scanned within this threshold to avoid duplicate entries.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Inventory Policies */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Inventory & Stock Policies
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                Allow Negative Inventory
              </span>
              <span className="text-xs text-slate-500">
                When disabled, the system strictly blocks any Stock Out transaction exceeding current on-hand units.
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.allow_negative_stock}
              onChange={(e) => setSettings({ ...settings, allow_negative_stock: e.target.checked })}
              className="w-5 h-5 rounded-md text-blue-600 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Database & Cloud Connection Status */}
        <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            Database & Cloud Infrastructure
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Supabase PostgreSQL Connection
              </div>
              <div className="text-[11px] text-slate-500">
                {supabaseConnected
                  ? "Connected to remote Supabase database instance"
                  : "Running in Offline / Browser IndexedDB persistence mode"}
              </div>
            </div>

            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                supabaseConnected
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
              }`}
            >
              {supabaseConnected ? "SUPABASE LIVE" : "LOCAL PERSISTENCE"}
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            To connect to Supabase, provide <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in your environment.
            SQL migrations are available at <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">supabase/migrations/20260824000000_init_schema.sql</code>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Seed Data</span>
          </button>

          <button
            type="submit"
            className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
