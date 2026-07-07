"use client"

import React from "react"
import { useCsvImport } from "@/hooks/useCsvImport"
import UploadZone from "@/components/UploadZone"
import CSVPreviewTable from "@/components/CSVPreviewTable"
import ProgressPanel from "@/components/ProgressPanel"
import SummaryStats from "@/components/SummaryStats"
import ResultsTable from "@/components/ResultsTable"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { 
  FileSpreadsheet, 
  ArrowLeft, 
  Play, 
  RotateCcw, 
  HelpCircle,
  AlertCircle
} from "lucide-react"

export default function Home() {
  const {
    file,
    parsedData,
    status,
    error,
    progress,
    importResult,
    onFileSelect,
    onReset,
    onConfirmImport,
  } = useCsvImport()

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20 pb-16 flex flex-col font-sans">
      {/* Top Navigation / Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/20">
              <FileSpreadsheet className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                GrowEasy
              </h1>
              <p className="text-xs text-muted-foreground font-medium">AI CSV Importer & Map Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href="mailto:support@groweasy.ai" 
              className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help Desk</span>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Core View Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 mt-8 flex flex-col gap-6">
        
        {/* State Banner / Intro */}
        {status === "idle" && (
          <div className="text-center max-w-xl mx-auto py-8 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Import Contacts Effortlessly</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Our intelligent mapping engine converts arbitrary spreadsheets (Facebook Leads, Real Estate, Custom CRM exports) into structured contact records automatically.
            </p>
          </div>
        )}

        {/* STEP 1: Upload (Idle State) */}
        {status === "idle" && (
          <div className="w-full flex justify-center py-4">
            <UploadZone onFileSelect={onFileSelect} />
          </div>
        )}

        {/* STEP 2: Previewing CSV File */}
        {status === "previewing" && parsedData && (
          <div className="space-y-6 w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <button 
                onClick={onReset}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Upload a different file</span>
              </button>

              <Button 
                onClick={onConfirmImport} 
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold flex items-center gap-1.5 shadow-sm rounded-lg"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Confirm Import</span>
              </Button>
            </div>

            <CSVPreviewTable data={parsedData} />
          </div>
        )}

        {/* STEP 3: Processing Import (SSE Progress Bar) */}
        {status === "importing" && (
          <div className="w-full py-16 flex justify-center">
            <ProgressPanel {...progress} />
          </div>
        )}

        {/* STEP 4: Import Complete (Summary Cards & Audit Results) */}
        {status === "done" && importResult && (
          <div className="space-y-6 w-full max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Import Report</h3>
                <p className="text-xs text-muted-foreground">Audit action logs and CRM schema mapping summaries</p>
              </div>
              
              <Button 
                onClick={onReset} 
                variant="outline"
                className="font-semibold flex items-center gap-1.5 rounded-lg border border-border"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Import Another File</span>
              </Button>
            </div>

            {/* Summary metrics cards */}
            <SummaryStats stats={importResult.stats} />

            {/* Details mapping audit list */}
            <ResultsTable results={importResult.results} />
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div className="w-full max-w-md mx-auto py-12 text-center space-y-6 animate-in fade-in duration-300">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold tracking-tight">CSV Parsing Failed</h3>
              <p className="text-sm text-muted-foreground">{error || "An unexpected error occurred while parsing the CSV spreadsheet."}</p>
            </div>
            <Button onClick={onReset} variant="outline" className="rounded-lg">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-border pt-6 text-center text-xs text-muted-foreground/60 font-medium">
        <p>© 2026 GrowEasy AI. All rights reserved. Deployed for pair programming assessment.</p>
      </footer>
    </div>
  )
}
