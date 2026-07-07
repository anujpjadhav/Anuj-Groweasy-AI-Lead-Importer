"use client"

import React from "react"
import { Users, UserCheck, UserX } from "lucide-react"

interface SummaryStatsProps {
  stats: {
    total: number;
    imported: number;
    skipped: number;
  }
}

export default function SummaryStats({ stats }: SummaryStatsProps) {
  const { total, imported, skipped } = stats

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full animate-in zoom-in-95 duration-400">
      {/* Total Card */}
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-300 relative group overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-muted/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Evaluated</p>
          <p className="text-3xl font-extrabold tracking-tight font-mono">{total}</p>
        </div>
        <div className="p-3 bg-muted text-muted-foreground rounded-xl">
          <Users className="w-6 h-6" />
        </div>
      </div>

      {/* Imported Card */}
      <div className="bg-card border border-emerald-500/10 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-emerald-500/20 transition-all duration-300 relative group overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Mapped & Imported</p>
          <p className="text-3xl font-extrabold tracking-tight font-mono text-emerald-600 dark:text-emerald-400">{imported}</p>
        </div>
        <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
          <UserCheck className="w-6 h-6" />
        </div>
      </div>

      {/* Skipped Card */}
      <div className="bg-card border border-amber-500/10 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-amber-500/20 transition-all duration-300 relative group overflow-hidden">
        <div className="absolute inset-0 bg-amber-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Filtered / Skipped</p>
          <p className="text-3xl font-extrabold tracking-tight font-mono text-amber-600 dark:text-amber-400">{skipped}</p>
        </div>
        <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
          <UserX className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
