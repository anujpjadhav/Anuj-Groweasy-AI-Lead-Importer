export interface CRMRecord {
  created_at: string;
  name: string;
  email: string;
  country_code: string;
  mobile_without_country_code: string;
  company: string;
  city: string;
  state: string;
  country: string;
  lead_owner: string;
  crm_status: string;
  crm_note: string;
  data_source: string;
  possession_time: string;
  description: string;
}

export type CSVRow = Record<string, string>;

export interface ParsedCSVData {
  headers: string[];
  rows: CSVRow[];
  totalRows: number;
}

export interface ImportResultItem {
  row_index: number;
  action: "IMPORT" | "SKIP";
  record?: CRMRecord;
  reason?: string;
}

export interface ImportResponse {
  results: ImportResultItem[];
  stats: {
    total: number;
    imported: number;
    skipped: number;
  };
}
