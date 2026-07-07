import { ALLOWED_CRM_STATUSES, ALLOWED_DATA_SOURCES, CRMRecord, ImportResultItem } from "../constants/crmSchema";

/**
 * Validates and sanitizes a single CRM record mapped by AI.
 * Ensures enums are respected and filters out rows without contact info.
 */
export function validateCRMRecord(row_index: number, rawAction: string, rawRecord: any): ImportResultItem {
  // Check if we are already dealing with a skip from AI
  if (rawAction === "SKIP") {
    return {
      row_index,
      action: "SKIP",
      reason: rawRecord?.reason || "Row skipped during extraction."
    };
  }

  if (!rawRecord) {
    return {
      row_index,
      action: "SKIP",
      reason: "No record mapping returned from AI."
    };
  }

  // Validate contact info existence
  const email = (rawRecord.email || "").trim();
  const mobile = (rawRecord.mobile_without_country_code || "").trim();

  if (!email && !mobile) {
    return {
      row_index,
      action: "SKIP",
      reason: "Row lacks both an email address and a phone number."
    };
  }

  // Sanitize crm_status
  let crm_status: CRMRecord["crm_status"] = "";
  const rawStatus = (rawRecord.crm_status || "").trim().toUpperCase();
  if (ALLOWED_CRM_STATUSES.includes(rawStatus as any)) {
    crm_status = rawStatus as any;
  }

  // Sanitize data_source
  let data_source: CRMRecord["data_source"] = "";
  const rawSource = (rawRecord.data_source || "").trim();
  if (ALLOWED_DATA_SOURCES.includes(rawSource as any)) {
    data_source = rawSource as any;
  }

  // Standardize record attributes
  const record: CRMRecord = {
    created_at: rawRecord.created_at || new Date().toISOString(),
    name: rawRecord.name || "Anonymous Lead",
    email,
    country_code: rawRecord.country_code || "",
    mobile_without_country_code: mobile,
    company: rawRecord.company || "",
    city: rawRecord.city || "",
    state: rawRecord.state || "",
    country: rawRecord.country || "",
    lead_owner: rawRecord.lead_owner || "AI Auto-Assigned",
    crm_status,
    crm_note: rawRecord.crm_note || "",
    data_source,
    possession_time: rawRecord.possession_time || "",
    description: rawRecord.description || ""
  };

  return {
    row_index,
    action: "IMPORT",
    record
  };
}
