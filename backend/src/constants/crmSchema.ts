export const ALLOWED_CRM_STATUSES = [
  "GOOD_LEAD_FOLLOW_UP",
  "DID_NOT_CONNECT",
  "BAD_LEAD",
  "SALE_DONE"
] as const;

export type CRMStatus = typeof ALLOWED_CRM_STATUSES[number];

export const ALLOWED_DATA_SOURCES = [
  "leads_on_demand",
  "meridian_tower",
  "eden_park",
  "varah_swamy",
  "sarjapur_plots"
] as const;

export type CRMDataSource = typeof ALLOWED_DATA_SOURCES[number];

export interface CRMRecord {
  created_at?: string;
  name?: string;
  email?: string;
  country_code?: string;
  mobile_without_country_code?: string;
  company?: string;
  city?: string;
  state?: string;
  country?: string;
  lead_owner?: string;
  crm_status?: CRMStatus | "";
  crm_note?: string;
  data_source?: CRMDataSource | "";
  possession_time?: string;
  description?: string;
}

export interface ImportResultItem {
  row_index: number;
  action: "IMPORT" | "SKIP";
  reason?: string;
  record?: CRMRecord;
}
