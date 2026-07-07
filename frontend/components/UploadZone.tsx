"use client"

import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, FileSpreadsheet, AlertTriangle } from "lucide-react"

interface UploadZoneProps {
  onFileSelect: (file: File) => void
  disabled?: boolean
}

export default function UploadZone({ onFileSelect, disabled = false }: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null)

      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0]
        const fileError = rejection.errors[0]

        if (fileError.code === "file-too-large") {
          setError("File is too large. Maximum allowed size is 5MB.")
        } else if (fileError.code === "file-invalid-type") {
          setError("Invalid file type. Only standard CSV files (.csv) are accepted.")
        } else {
          setError(fileError.message || "Failed to upload file.")
        }
        return
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0])
      }
    },
    [onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/csv": [".csv"],
      "application/vnd.ms-excel": [".csv"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled,
  })

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative group overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer p-10 flex flex-col items-center justify-center text-center
          ${isDragActive 
            ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--color-primary),0.1)] scale-[1.01]" 
            : "border-muted-foreground/35 bg-card hover:border-primary/50 hover:bg-muted/30"
          }
          ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
        `}
      >
        {/* Decorative backdrop gradients */}
        <div className="absolute inset-0 bg-radial-gradient from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <input {...getInputProps()} />

        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className={`p-4 rounded-full mb-4 transition-all duration-300 
            ${isDragActive 
              ? "bg-primary/20 text-primary scale-110" 
              : "bg-muted text-muted-foreground group-hover:scale-105 group-hover:bg-primary/10 group-hover:text-primary"
            }`}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-semibold tracking-tight mb-2">
            {isDragActive ? "Drop your CSV here" : "Upload your CSV file"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">
            Drag and drop your contact spreadsheet here, or click to browse files
          </p>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/65 text-xs text-muted-foreground font-medium border border-border">
            <FileSpreadsheet className="w-3.5 h-3.5 text-primary/70" />
            <span>CSV files up to 5MB</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm flex items-start gap-3 animate-in fade-in duration-300">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-0.5">Upload Error</h4>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
