import Papa from "papaparse";
import { CSVRow, ParsedCSVData } from "./types";

/**
 * Parses a CSV file client-side using PapaParse inside a Web Worker.
 * Trims headers and values, and filters out empty rows.
 */
export function parseCsvClient(file: File): Promise<ParsedCSVData> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: "greedy",
      worker: true,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          reject(new Error(results.errors[0].message));
          return;
        }

        const rawHeaders = results.meta.fields || [];
        const headers = rawHeaders.map((h) => h.trim());

        // Process and trim rows on the main thread
        const rows = results.data.map((row) => {
          const trimmedRow: CSVRow = {};
          headers.forEach((header, index) => {
            const rawHeader = rawHeaders[index] || header;
            trimmedRow[header] = (row[rawHeader] || "").trim();
          });
          return trimmedRow;
        });

        resolve({
          headers,
          rows,
          totalRows: rows.length,
        });
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
