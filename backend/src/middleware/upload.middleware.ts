import multer from "multer";
import { Request } from "express";

// Keep files in memory rather than writing to disk
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check mime type or extension
  const extension = file.originalname.split(".").pop()?.toLowerCase();
  
  if (file.mimetype === "text/csv" || extension === "csv") {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed!"));
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB limit
  }
}).single("file");
