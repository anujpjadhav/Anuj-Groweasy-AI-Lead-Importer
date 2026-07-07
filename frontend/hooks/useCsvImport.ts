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
      stage: "Initializing connection...",
    });

    const totalRows = parsedData.rows.length;
    // Simulate batch processing (batches of 15 rows)
    const batchSize = 15;
    const totalBatches = Math.ceil(totalRows / batchSize);
    const mockResults: ImportResultItem[] = [];

    // Helper helper to match case-insensitive fields
    const getVal = (row: Record<string, string>, keys: string[]) => {
      const foundKey = Object.keys(row).find((k) =>
        keys.includes(k.toLowerCase().trim().replace(/[\s_-]+/g, ""))
      );
      return foundKey ? row[foundKey] : "";
    };

    // Process batches with intervals to show the loading states
    for (let b = 0; b < totalBatches; b++) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const start = b * batchSize;
      const end = Math.min(start + batchSize, totalRows);
      const batchRows = parsedData.rows.slice(start, end);

      batchRows.forEach((row, index) => {
        const globalIndex = start + index;

        // Extract key fields (case-insensitive fuzzy match)
        const nameVal = getVal(row, ["name", "fullname", "username", "leadname", "contactname", "customername"]);
        const emailVal = getVal(row, ["email", "emailaddress", "mail", "primaryemail"]);
        const phoneVal = getVal(row, ["phone", "phonenumber", "mobile", "mobilenumber", "contactno", "tel"]);
        const companyVal = getVal(row, ["company", "companyname", "organization", "org"]);
        const cityVal = getVal(row, ["city", "town"]);
        const stateVal = getVal(row, ["state", "province", "region"]);
        const countryVal = getVal(row, ["country", "nation"]);
        const crmStatusVal = getVal(row, ["crmstatus", "status", "leadstatus"]);
        const crmNoteVal = getVal(row, ["crmnote", "notes", "note", "comment"]);
        const sourceVal = getVal(row, ["datasource", "source", "leadsource"]);
        const descriptionVal = getVal(row, ["description", "about", "info"]);

        const hasEmail = !!emailVal;
        const hasPhone = !!phoneVal;

        if (!hasEmail && !hasPhone) {
          mockResults.push({
            row_index: globalIndex,
            action: "SKIP",
            reason: "Row lacks both an email and a phone number.",
          });
        } else {
          // Parse phone number split (mock logic)
          let countryCode = "";
          let mobileNum = phoneVal;
          if (phoneVal) {
            const cleanPhone = phoneVal.replace(/[\s-()]/g, "");
            if (cleanPhone.startsWith("+")) {
              // Extract +XX or +XXX
              const match = cleanPhone.match(/^(\+\d{1,3})(\d{10})$/);
              if (match) {
                countryCode = match[1];
                mobileNum = match[2];
              } else {
                countryCode = cleanPhone.slice(0, 3);
                mobileNum = cleanPhone.slice(3);
              }
            } else if (cleanPhone.length > 10) {
              // assume first few digits are country code
              countryCode = "+" + cleanPhone.slice(0, cleanPhone.length - 10);
              mobileNum = cleanPhone.slice(cleanPhone.length - 10);
            } else if (cleanPhone.length === 10) {
              countryCode = "+91"; // Default to India context per spec
              mobileNum = cleanPhone;
            }
          }

          // Map into CRMRecord
          const record: CRMRecord = {
            created_at: new Date().toISOString(),
            name: nameVal || "Anonymous Lead",
            email: emailVal,
            country_code: countryCode,
            mobile_without_country_code: mobileNum,
            company: companyVal,
            city: cityVal,
            state: stateVal,
            country: countryVal || (countryCode === "+91" ? "India" : ""),
            lead_owner: "AI Auto-Assigned",
            crm_status: crmStatusVal ? crmStatusVal.toUpperCase() : "GOOD_LEAD_FOLLOW_UP",
            crm_note: crmNoteVal || "Imported via CSV file.",
            data_source: sourceVal || "leads_on_demand",
            possession_time: "",
            description: descriptionVal,
          };

          mockResults.push({
            row_index: globalIndex,
            action: "IMPORT",
            record,
          });
        }
      });

      const currentProcessed = end;
      const percentage = Math.round((currentProcessed / totalRows) * 100);
      setProgress({
        current: currentProcessed,
        total: totalRows,
        percentage,
        stage: `Analyzing & Mapping records (Processed ${currentProcessed}/${totalRows})...`,
      });
    }

    // Final wrapping step
    setProgress((prev) => ({ ...prev, stage: "Finalizing import summary..." }));
    await new Promise((resolve) => setTimeout(resolve, 600));

    const total = mockResults.length;
    const imported = mockResults.filter((r) => r.action === "IMPORT").length;
    const skipped = mockResults.filter((r) => r.action === "SKIP").length;

    setImportResult({
      results: mockResults,
      stats: { total, imported, skipped },
    });
    setStatus("done");
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
