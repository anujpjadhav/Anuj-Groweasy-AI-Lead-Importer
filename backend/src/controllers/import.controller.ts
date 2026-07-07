import { Request, Response, NextFunction } from "express";
import { parseCsvBuffer } from "../services/csvParser.service";
import { detectSchemaWithRetry, SchemaMapping } from "../services/groqExtraction.service";
import { validateCRMRecord } from "../services/validation.service";
import { ImportResultItem, CRMRecord } from "../constants/crmSchema";

/**
 * Maps a single raw CSV row programmatically based on the LLM-derived schema mapping.
 */
function mapRowProgrammatically(
  row: Record<string, string>,
  rowIndex: number,
  schema: SchemaMapping
): ImportResultItem {
  // Find mapped headers
  const getFieldVal = (field: keyof SchemaMapping["mappings"]) => {
    const csvCol = schema.mappings[field];
    return csvCol ? (row[csvCol] || "").trim() : "";
  };

  const rawName = getFieldVal("name");
  const rawEmail = getFieldVal("email");
  const rawPhone = getFieldVal("mobile_without_country_code");

  // Skip validation if email and phone are both missing
  if (!rawEmail && !rawPhone) {
    return {
      row_index: rowIndex,
      action: "SKIP",
      reason: "Row lacks both an email address and a phone number."
    };
  }

  // Country code phone splitting (Rule 3)
  let country_code = "";
  let mobile_without_country_code = rawPhone;
  if (rawPhone) {
    const plusMatch = rawPhone.match(/^\+(\d{1,3})\s*(.*)$/);
    if (plusMatch) {
      country_code = `+${plusMatch[1]}`;
      mobile_without_country_code = plusMatch[2].trim();
    } else {
      const doubleZeroMatch = rawPhone.match(/^00(\d{1,3})\s*(.*)$/);
      if (doubleZeroMatch) {
        country_code = `+${doubleZeroMatch[1]}`;
        mobile_without_country_code = doubleZeroMatch[2].trim();
      }
    }
  }

  // Handle multiple emails (Rule 4)
  let email = rawEmail;
  let additionalEmailNote = "";
  if (rawEmail) {
    const emailParts = rawEmail.split(/[;,]/).map(e => e.trim()).filter(Boolean);
    if (emailParts.length > 1) {
      email = emailParts[0];
      additionalEmailNote = `Additional email(s): ${emailParts.slice(1).join(", ")}`;
    }
  }

  // Value maps for status and source
  let crm_status = "";
  const rawStatusVal = getFieldVal("crm_status");
  if (rawStatusVal) {
    const statusValClean = rawStatusVal.toLowerCase();
    crm_status = schema.statusValueMap[statusValClean] || schema.statusValueMap[rawStatusVal] || "";
  }

  let data_source = "";
  const rawSourceVal = getFieldVal("data_source");
  if (rawSourceVal) {
    const sourceValClean = rawSourceVal.toLowerCase();
    data_source = schema.sourceValueMap[sourceValClean] || schema.sourceValueMap[rawSourceVal] || "";
  }

  // Note construction
  let crm_note = getFieldVal("crm_note");
  if (additionalEmailNote) {
    crm_note = crm_note ? `${crm_note}. ${additionalEmailNote}` : additionalEmailNote;
  }

  // Build target record
  const record: CRMRecord = {
    created_at: getFieldVal("created_at") || new Date().toISOString(),
    name: rawName || "Anonymous Lead",
    email,
    country_code,
    mobile_without_country_code,
    company: getFieldVal("company"),
    city: getFieldVal("city"),
    state: getFieldVal("state"),
    country: getFieldVal("country"),
    lead_owner: getFieldVal("lead_owner") || "AI Auto-Assigned",
    crm_status: crm_status as any,
    crm_note,
    data_source: data_source as any,
    possession_time: getFieldVal("possession_time"),
    description: getFieldVal("description")
  };

  return validateCRMRecord(rowIndex, "IMPORT", record);
}

/**
 * Handles CSV Import uploads, maps CRM fields via Groq AI schema detection, and streams progress using SSE.
 */
export async function importCsvController(req: Request, res: Response, next: NextFunction) {
  if (!req.file) {
    res.status(400).json({ error: "No file was uploaded. Please upload a valid CSV file." });
    return;
  }

  try {
    // 1. Parse raw CSV layout-agnostically from memory buffer
    const rows = parseCsvBuffer(req.file.buffer);

    if (rows.length === 0) {
      res.status(400).json({ error: "The uploaded CSV file contains no records." });
      return;
    }

    // 2. Set up SSE Headers to stream updates back to the client
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const emitProgress = (payload: any) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    emitProgress({ event: "connected", totalRows: rows.length });

    // 3. Resolve mapping schema with a single Groq completion call
    const headers = Object.keys(rows[0]);
    const sampleRows = rows.slice(0, 3);
    
    emitProgress({ 
      event: "progress", 
      batchIndex: 0, 
      completedBatches: 0, 
      totalBatches: 10, 
      percentage: 5,
      stage: "Analyzing CSV layout and headers via AI mapping..." 
    });

    const schemaMapping = await detectSchemaWithRetry(headers, sampleRows);
    
    emitProgress({ 
      event: "progress", 
      batchIndex: 0, 
      completedBatches: 1, 
      totalBatches: 10, 
      percentage: 15,
      stage: "Mapping detected. Parsing records programmatically..." 
    });

    // 4. Map the dataset programmatically
    const totalRows = rows.length;
    const finalResults: ImportResultItem[] = [];
    
    const progressSteps = 8; // Distribute mapping progress across chunks for visual feedback
    const chunkSize = Math.max(1, Math.ceil(totalRows / progressSteps));

    for (let i = 0; i < totalRows; i++) {
      const mapped = mapRowProgrammatically(rows[i], i, schemaMapping);
      finalResults.push(mapped);

      // Stream visual updates periodically during loop
      if ((i + 1) % chunkSize === 0 || i === totalRows - 1) {
        const completedCount = i + 1;
        const currentPercentage = 15 + Math.round((completedCount / totalRows) * 80);
        
        emitProgress({
          event: "progress",
          batchIndex: Math.floor(completedCount / chunkSize),
          completedBatches: Math.floor(completedCount / chunkSize),
          completedCount,
          totalBatches: progressSteps,
          percentage: currentPercentage,
          stage: `Mapping and sanitizing lead records: ${completedCount}/${totalRows} completed...`
        });

        // Small timeout to give smooth visual scrolling progress
        await new Promise(resolve => setTimeout(resolve, 60));
      }
    }

    // 5. Gather statistics
    const imported = finalResults.filter((r) => r.action === "IMPORT");
    const skipped = finalResults.filter((r) => r.action === "SKIP");

    // 6. Stream final results
    emitProgress({
      done: true,
      results: finalResults,
      imported,
      skipped,
      totalImported: imported.length,
      totalSkipped: skipped.length
    });

    res.end();
  } catch (err: any) {
    console.error("[Import Controller Error] Ingestion failed:", err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || "Failed to process import." });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message || "Internal Ingestion Error" })}\n\n`);
      res.end();
    }
  }
}
