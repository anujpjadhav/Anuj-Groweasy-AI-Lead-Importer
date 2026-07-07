import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config();

export const PORT = process.env.PORT || 4000;
export const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

if (!GROQ_API_KEY) {
  console.warn("WARNING: GROQ_API_KEY is not defined in the environment variables!");
}
