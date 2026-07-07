"use client"

import React from "react"
import { Loader2 } from "lucide-react"

interface ProgressPanelProps {
  current: number;
  total: number;
  percentage: number;
  stage: string;
}

export default function ProgressPanel({ current, total, percentage, stage }: ProgressPanelProps) {
  return (
    <div className="w-full max-w-xl mx-auto bg-card border border-border rounded-2xl p-6 shadow-lg space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <h4 className="text-sm font-semibold tracking-tight">Importing Spreadsheet</h4>
        </div>
        <span className="text-sm font-mono font-bold text-primary">{percentage}%</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
        <span className="truncate max-w-[70%]">{stage || "Processing records..."}</span>
        <span className="shrink-0 font-mono">
          {current} / {total} records
        </span>
      </div>
    </div>
  )
}
