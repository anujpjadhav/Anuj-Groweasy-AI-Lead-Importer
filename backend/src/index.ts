/**
 * NOTE FOR DEPLOYMENT:
 * This Node.js / Express server is designed to run long-running batch ingestion processes
 * and stream Server-Sent Events (SSE) progress updates back to the client. Since Vercel
 * serverless functions impose strict execution duration limits (typically 10-15s) and 
 * frequently buffer SSE streams, this backend MUST be deployed on a dedicated server hosting 
 * platform like Render, Railway, Render web services, or a similar platform that supports 
 * continuous processes, WebSockets/SSE streams, and persistent event loops.
 */

import express from "express";
import cors from "cors";
import { PORT, FRONTEND_URL } from "./config/env";
import importRoutes from "./routes/import.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// Configure CORS to allow the Next.js frontend to send requests
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:3000"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Health check endpoint for Render/Railway monitoring probes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Import API routes
app.use("/api", importRoutes);

// Register global error fallback middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[GrowEasy Importer Server] Listening at http://localhost:${PORT}`);
  console.log(`[GrowEasy Importer Server] Configured frontend origin: ${FRONTEND_URL}`);
});
