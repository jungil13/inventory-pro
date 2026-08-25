"use client";

import React, { useState, useEffect } from "react";
import { inventoryStore } from "@/lib/storage/inventory-store";
import { User, UserRole } from "@/types/inventory";
import { soundFx } from "@/lib/audio/sound-fx";
import {
  Users as UsersIcon,
  ShieldCheck,
  Plus,
  Check,
  X,
  Lock,
  UserCheck,
  ShieldAlert,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(inventoryStore.getCurrentUser());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("staff");

  const loadData = () => {
    setUsers(inventoryStore.getUsers());
    setCurrentUser(inventoryStore.getCurrentUser());
  };

  useEffect(() => {
    loadData();
    const unsub = inventoryStore.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    inventoryStore.createUser({
      name: name.trim(),
      email: email.trim(),
      role,
      avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
    });
    soundFx.playSuccessChime();
    setName("");
    setEmail("");
    setRole("staff");
    setIsModalOpen(false);
  };

  const permissionsMatrix = [
    { permission: "Scan & View Products", staff: true, manager: true, admin: true },
    { permission: "Stock In & Stock Out", staff: true, manager: true, admin: true },
    { permission: "Adjust Stock & Audit Discrepancies", staff: false, manager: true, admin: true },
    { permission: "Add & Edit Products / Catalog", staff: false, manager: true, admin: true },
    { permission: "Manage Suppliers & Categories", staff: false, manager: true, admin: true },
    { permission: "View Valuation & Movement Reports", staff: false, manager: true, admin: true },
    { permission: "Delete Products & Archive", staff: false, manager: false, admin: true },
    { permission: "Manage Users & Security Settings", staff: false, manager: false, admin: true },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UsersIcon className="w-5 h-5" />
            </div>
            Users & Role-Based Access Control
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage user accounts, roles (Admin, Manager, Staff), and system privilege boundaries
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 self-start sm:self-auto transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* USERS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {users.map((u) => {
          const isCurrent = u.id === currentUser.id;
          return (
            <div
              key={u.id}
              className={`p-5 rounded-2xl border transition-all ${
                isCurrent
                  ? "bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 shadow-md"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={u.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                  alt={u.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    {u.name}
                    {isCurrent && (
                      <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-md font-bold">
                        ACTIVE
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span
                  className={`font-black uppercase text-[10px] px-2.5 py-1 rounded-full ${
                    u.role === "admin"
                      ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                      : u.role === "manager"
                      ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                  }`}
                >
                  {u.role}
                </span>

                {!isCurrent && (
                  <button
                    onClick={() => {
                      inventoryStore.setCurrentUser(u);
                      soundFx.playSuccessChime();
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Switch to User →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PERMISSIONS MATRIX */}
      <div className="p-5 sm:p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Role Permission Matrix (Supabase RLS Enforced)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Feature / Action Permission</th>
                <th className="py-3 px-4 text-center">Staff</th>
                <th className="py-3 px-4 text-center">Manager</th>
                <th className="py-3 px-4 text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {row.permission}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.staff ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 dark:text-slate-700 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.manager ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 dark:text-slate-700 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.admin ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-slate-300 dark:text-slate-700 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add Team Member
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Roberto Gomez"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="roberto@inventorypro.com"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Role Assignment *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <option value="staff">Staff (Scanning & Stock In/Out)</option>
                  <option value="manager">Manager (Inventory, Reports & Adjustments)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
