import { useState, useCallback } from "react";
import { parseCsvClient } from "@/lib/parseCsvClient";
import { ParsedCSVData, ImportResponse, ImportResultItem, CRMRecord } from "@/lib/types";

export type ImportStatus = "idle" | "parsing" | "previewing" | "importing" | "done" | "error";

export interface ProgressState {
  current: number;
  total: number;
  percentage: number;
  stage: string;
}

export function useCsvImport() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedCSVData | null>(null);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressState>({
    current: 0,
    total: 0,
    percentage: 0,
    stage: "",
  });
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);

  const onFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setStatus("parsing");
    setError(null);
    setImportResult(null);

    try {
      const data = await parseCsvClient(selectedFile);
      setParsedData(data);
      setStatus("previewing");
    } catch (err: any) {
      setError(err?.message || "Failed to parse CSV file.");
      setStatus("error");
    }
  }, []);

  const onReset = useCallback(() => {
    setFile(null);
    setParsedData(null);
    setStatus("idle");
    setError(null);
    setProgress({ current: 0, total: 0, percentage: 0, stage: "" });
    setImportResult(null);
  }, []);

  const onConfirmImport = useCallback(async () => {
    if (!parsedData || !file) return;

    setStatus("importing");
    setProgress({
      current: 0,
      total: parsedData.rows.length,
      percentage: 0,
      stage: "Connecting to mapping engine...",
    });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${backendUrl}/api/import`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to parse import on backend.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        throw new Error("Unable to read streaming response from backend.");
      }

      let buffer = "";
      const totalRows = parsedData.rows.length;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.substring(6).trim();
          try {
            const data = JSON.parse(jsonStr);

            if (data.event === "connected") {
              setProgress((prev) => ({
                ...prev,
                stage: "CSV parser uploaded. Initializing AI batches...",
              }));
            }

            if (data.event === "progress") {
              const BATCH_SIZE = 5;
              const currentProcessed = typeof data.completedCount === "number"
                ? data.completedCount
                : Math.min(data.completedBatches * BATCH_SIZE, totalRows);
              setProgress({
                current: currentProcessed,
                total: totalRows,
                percentage: data.percentage,
                stage: data.stage || `Extracting & Mapping records (Batch ${data.completedBatches}/${data.totalBatches} completed)...`,
              });
            }

            if (data.done) {
              setProgress({
                current: totalRows,
                total: totalRows,
                percentage: 100,
                stage: "Import completed successfully! Rendering report...",
              });

              setTimeout(() => {
                setImportResult({
                  results: data.results,
                  stats: {
                    total: data.results.length,
                    imported: data.totalImported,
                    skipped: data.totalSkipped,
                  },
                });
                setStatus("done");
              }, 750);
            }

            if (data.error) {
              throw new Error(data.error);
            }
          } catch (jsonErr) {
            console.error("Failed to parse SSE JSON chunk:", jsonErr);
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || "Import failed during execution.");
      setStatus("error");
    }
  }, [parsedData, file]);

  return {
    file,
    parsedData,
    status,
    error,
    progress,
    importResult,
    onFileSelect,
    onReset,
    onConfirmImport,
  };
}
