import { Router } from "express";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { importCsvController } from "../controllers/import.controller";

const router = Router();

// Endpoint to handle the raw CSV upload and trigger the AI mapping pipeline
router.post("/import", uploadMiddleware, importCsvController);

export default router;
