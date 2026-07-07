"use client"

import React, { useState, useMemo } from "react"
import { ImportResultItem } from "@/lib/types"
import { Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

interface ResultsTableProps {
  results: ImportResultItem[]
}

type TabType = "all" | "imported" | "skipped"

export default function ResultsTable({ results }: ResultsTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("all")

  // Filter results based on search query and active tab
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      // Tab filter
      if (activeTab === "imported" && item.action !== "IMPORT") return false
      if (activeTab === "skipped" && item.action !== "SKIP") return false

      // Search query filter
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      
      const record = item.record
      const matchesName = record?.name?.toLowerCase().includes(query) || false
      const matchesEmail = record?.email?.toLowerCase().includes(query) || false
      const matchesPhone = record?.mobile_without_country_code?.includes(query) || false
      const matchesReason = item.reason?.toLowerCase().includes(query) || false

      return matchesName || matchesEmail || matchesPhone || matchesReason
    })
  }, [results, activeTab, searchQuery])

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300">
      {/* Filtering Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card p-3 rounded-xl border border-border">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-full sm:w-auto">
          {(["all", "imported", "skipped"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all uppercase tracking-wider w-full sm:w-auto
                ${activeTab === tab
                  ? "bg-background text-foreground shadow-xs border border-border/10"
                  : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              {tab === "all" ? "All Contacts" : tab === "imported" ? "Mapped" : "Skipped"}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads, emails, reasons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Results List View */}
      <div className="overflow-hidden border border-border rounded-xl bg-card">
        <div className="overflow-x-auto max-h-[400px] scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/80 sticky top-0 z-10 border-b border-border shadow-xs">
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">Row</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">CRM Target Mapping</th>
                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Audit / Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                filteredResults.map((item, index) => {
                  const isImport = item.action === "IMPORT"
                  const spreadsheetRow = item.row_index + 1 // 1-indexed based on data index
                  
                  return (
                    <tr 
                      key={item.row_index} 
                      className={`hover:bg-muted/15 transition-colors text-sm
                        ${index % 2 === 0 ? "bg-card" : "bg-muted/5"}
                      `}
                    >
                      {/* Spreadsheet Row */}
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                        #{spreadsheetRow}
                      </td>

                      {/* Status Action Badge */}
                      <td className="px-4 py-3.5">
                        {isImport ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>MAPPED</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>SKIPPED</span>
                          </div>
                        )}
                      </td>

                      {/* Contact Info (Details) */}
                      <td className="px-4 py-3.5 max-w-[240px]">
                        {isImport && item.record ? (
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground truncate">{item.record.name}</div>
                            {item.record.email ? (
                              item.record.email.split(/[;,]/).map((email, idx) => (
                                <div key={idx} className="text-xs text-muted-foreground truncate" title={email.trim()}>
                                  {email.trim()}
                                </div>
                              ))
                            ) : (
                              <span className="opacity-40 italic text-xs text-muted-foreground">no email</span>
                            )}
                            {item.record.mobile_without_country_code && (
                              <div className="text-xs font-mono text-muted-foreground">
                                {item.record.country_code} {item.record.mobile_without_country_code}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-xs italic">Raw row filtered</div>
                        )}
                      </td>

                      {/* Target Mapping Highlights */}
                      <td className="px-4 py-3.5">
                        {isImport && item.record ? (
                          <div className="flex flex-col gap-1 text-xs max-w-[280px]">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-muted-foreground shrink-0">Source:</span>
                              <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wide truncate max-w-[150px]" title={item.record.data_source}>
                                {item.record.data_source || "unknown"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-muted-foreground shrink-0">Status:</span>
                              <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wide truncate max-w-[185px]" title={item.record.crm_status}>
                                {item.record.crm_status || "unknown"}
                              </span>
                            </div>
                            <div className="flex gap-1.5 items-start mt-0.5">
                              <span className="text-muted-foreground shrink-0">Notes:</span>
                              <span className="text-muted-foreground font-light truncate max-w-[200px]" title={item.record.crm_note}>
                                {item.record.crm_note}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/35 font-mono text-xs">-</span>
                        )}
                      </td>

                      {/* Audit Details / Reason */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        {isImport ? (
                          <span className="text-emerald-500/90 text-xs font-medium">Mapped correctly to CRM schema.</span>
                        ) : (
                          <div className="flex items-start gap-1.5 text-amber-600 dark:text-amber-400 text-xs">
                            <AlertTriangle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                            <span>{item.reason}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
