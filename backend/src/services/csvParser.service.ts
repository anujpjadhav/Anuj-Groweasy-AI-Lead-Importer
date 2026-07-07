import Papa from "papaparse";

/**
 * Parses a CSV file buffer into trimmed, layout-agnostic row records.
 */
export function parseCsvBuffer(buffer: Buffer): Record<string, string>[] {
  const csvString = buffer.toString("utf8");
  const results = Papa.parse<Record<string, string>>(csvString, {
    header: true,
    skipEmptyLines: "greedy",
  });

  if (results.errors.length > 0 && results.data.length === 0) {
    throw new Error(results.errors[0].message || "Failed to parse CSV string content.");
  }

  const rawFields = results.meta.fields || [];
  const cleanedFields = rawFields.map((field) => field.trim());

  return results.data.map((row) => {
    const cleanedRow: Record<string, string> = {};
    cleanedFields.forEach((field, index) => {
      const originalField = rawFields[index] || field;
      cleanedRow[field] = (row[originalField] || "").trim();
    });
    return cleanedRow;
  });
}
