import Groq from "groq-sdk";
import { GROQ_API_KEY } from "../config/env";

const MODEL_NAME = "llama-3.3-70b-versatile";

const groq = new Groq({
  apiKey: GROQ_API_KEY
});

export interface SchemaMapping {
  mappings: {
    created_at?: string;
    name?: string;
    email?: string;
    mobile_without_country_code?: string;
    company?: string;
    city?: string;
    state?: string;
    country?: string;
    lead_owner?: string;
    crm_status?: string;
    crm_note?: string;
    data_source?: string;
    possession_time?: string;
    description?: string;
  };
  statusValueMap: Record<string, string>;
  sourceValueMap: Record<string, string>;
}

const SCHEMA_DETECTION_PROMPT = `You are a data-mapping analyzer for GrowEasy CRM.
Your job is to analyze the columns (headers) of an uploaded CSV file and a small sample of its rows, and map them to our target CRM schema:

Target Schema Fields:
- created_at: Date/time when the lead was created
- name: Full name of the lead
- email: Email address
- mobile_without_country_code: Mobile number without country code
- company: Company name
- city: City location
- state: State
- country: Country
- lead_owner: Lead owner/assigned person
- crm_status: Allowed values: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE
- crm_note: General notes, additional contacts, or miscellaneous info
- data_source: Allowed values: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots
- possession_time: Preferred possession time
- description: Additional details or descriptions

Analyze the provided CSV headers and sample data, and return a JSON object mapping each target field to the matching CSV header name. Also provide mappings for status and source values if present in the sample.

Return ONLY a valid JSON object matching this schema, without markdown formatting or code blocks:
{
  "mappings": {
    "name": "CSV_HEADER_NAME",
    "email": "CSV_HEADER_NAME",
    "mobile_without_country_code": "CSV_HEADER_NAME",
    "company": "CSV_HEADER_NAME",
    "city": "CSV_HEADER_NAME",
    "crm_status": "CSV_HEADER_NAME",
    "crm_note": "CSV_HEADER_NAME",
    "data_source": "CSV_HEADER_NAME"
  },
  "statusValueMap": {
    "interested": "GOOD_LEAD_FOLLOW_UP",
    "no response": "DID_NOT_CONNECT",
    "junk": "BAD_LEAD"
  },
  "sourceValueMap": {
    "google": "leads_on_demand",
    "facebook": "leads_on_demand"
  }
}`;

function cleanJsonResponse(content: string): string {
  let cleaned = content.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * Invokes Groq completions to detect layout mapping schema.
 */
async function callSchemaDetection(headers: string[], sampleRows: Record<string, string>[], useFallbackModel = false): Promise<SchemaMapping> {
  const model = useFallbackModel ? "llama-3.1-8b-instant" : MODEL_NAME;
  try {
    const completion = await groq.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: SCHEMA_DETECTION_PROMPT },
        { role: "user", content: JSON.stringify({ headers, sampleRows }) }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });

    const rawContent = completion.choices[0]?.message?.content || "";
    const cleanedContent = cleanJsonResponse(rawContent);

    const data = JSON.parse(cleanedContent);
    return {
      mappings: data.mappings || {},
      statusValueMap: data.statusValueMap || {},
      sourceValueMap: data.sourceValueMap || {}
    };
  } catch (err: any) {
    if (!useFallbackModel) {
      console.warn(`[Schema Analyzer] Primary model ${MODEL_NAME} failed. Retrying with fallback model llama-3.1-8b-instant...`);
      return callSchemaDetection(headers, sampleRows, true);
    }
    throw err;
  }
}

/**
 * Calls schema detection with rate-limit aware backoff retries.
 */
export function detectSchemaWithRetry(headers: string[], sampleRows: Record<string, string>[]): Promise<SchemaMapping> {
  const executeCall = () => callSchemaDetection(headers, sampleRows);
  return retryWithBackoff(executeCall, 3, 1000);
}

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) throw error;

    const errorMsg: string = error?.message || "";
    const isRateLimit = errorMsg.includes("429") || errorMsg.toLowerCase().includes("rate_limit");
    if (isRateLimit) {
      const match = errorMsg.match(/try again in\s+(?:(\d+)m\s*)?(\d+(?:\.\d+)?)s/i);
      if (match) {
        const minutes = parseInt(match[1] || "0", 10);
        const seconds = parseFloat(match[2] || "5");
        const waitMs = (minutes * 60 + seconds) * 1000 + 500;
        
        // If wait time is too long (e.g. daily limit reset wait of minutes), fail fast
        if (waitMs > 15000) {
          console.error(`[Schema Analyzer] Rate limit wait time is too long (${(waitMs / 1000).toFixed(1)}s). Aborting retry.`);
          throw error;
        }
        
        console.warn(`[Schema Analyzer Retry] Rate limit hit. Waiting ${(waitMs / 1000).toFixed(1)}s before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        return retryWithBackoff(fn, retries - 1, delay);
      }
    }

    console.warn(`[Schema Analyzer Retry] Call failed. Retrying in ${delay}ms... Error:`, errorMsg);
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 3);
  }
}

// Retain export placeholder for backward compatibility
export async function extractBatchWithRetry(rows: Record<string, string>[]): Promise<any> {
  return { results: [] };
}

export { groq };
