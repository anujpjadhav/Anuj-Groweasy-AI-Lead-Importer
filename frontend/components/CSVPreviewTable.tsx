"use client"

import React, { useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { CSVRow, ParsedCSVData } from "@/lib/types"
import { Table, Layers } from "lucide-react"

interface CSVPreviewTableProps {
  data: ParsedCSVData
}

export default function CSVPreviewTable({ data }: CSVPreviewTableProps) {
  const { headers, rows } = data
  const parentRef = useRef<HTMLDivElement>(null)

  // Configure row virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Height in pixels for each row
    overscan: 8,
  })

  // Compute a template columns style to ensure headers and rows are perfectly aligned
  // Each column has a minimum width of 160px and stretches equally
  const gridTemplateColumns = `repeat(${headers.length}, minmax(160px, 1fr))`

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Table Metadata Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/40 p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Table className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">CSV Parsed Successfully</h4>
            <p className="text-xs text-muted-foreground">Previewing data client-side before mapping</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-background rounded-md border border-border">
            <span className="text-muted-foreground">Rows:</span>
            <span className="text-foreground font-semibold">{rows.length}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-background rounded-md border border-border">
            <Layers className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-muted-foreground">Columns:</span>
            <span className="text-foreground font-semibold">{headers.length}</span>
          </div>
        </div>
      </div>

      {/* Virtualized Table Box */}
      <div 
        ref={parentRef}
        className="w-full overflow-auto rounded-xl border border-border bg-card max-h-[420px] relative scrollbar-thin"
      >
        <div className="min-w-max w-full">
          {/* Header Row (Sticky) */}
          <div 
            className="grid gap-4 items-center px-6 py-3 bg-muted/80 backdrop-blur-md sticky top-0 z-20 border-b border-border shadow-xs"
            style={{ gridTemplateColumns }}
          >
            {headers.map((header) => (
              <span 
                key={header} 
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate"
                title={header}
              >
                {header}
              </span>
            ))}
          </div>

          {/* Virtualized Rows Body */}
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>No rows found in this CSV.</p>
            </div>
          ) : (
            <div
              className="relative w-full"
              style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = rows[virtualRow.index]
                const isEven = virtualRow.index % 2 === 0

                return (
                  <div
                    key={virtualRow.key}
                    className={`grid gap-4 items-center px-6 py-2 border-b border-border/40 hover:bg-primary/5 transition-colors absolute top-0 left-0 w-full
                      ${isEven ? "bg-card" : "bg-muted/15"}
                    `}
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      gridTemplateColumns,
                    }}
                  >
                    {headers.map((header) => {
                      const value = row[header] || ""
                      return (
                        <span 
                          key={header} 
                          className="text-sm text-foreground/85 truncate"
                          title={value}
                        >
                          {value || <span className="text-muted-foreground/30 font-mono text-xs">-</span>}
                        </span>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
