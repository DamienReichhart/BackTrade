/**
 * File Upload Middleware
 *
 * Configures multer for handling file uploads with memory storage.
 * Used for dataset file uploads.
 */

import multer from "multer";
import type { Request } from "express";
import BadRequestError from "../errors/web/bad-request-error";

/**
 * Maximum file size in bytes (2GB - matching frontend validation)
 */
const MAX_FILE_SIZE = 1000 * 1024 * 1024 * 2;

/**
 * Allowed file extensions
 */
const ALLOWED_EXTENSIONS = [".csv"];

/**
 * Allowed MIME types for CSV files
 */
const ALLOWED_MIME_TYPES = ["text/csv", "application/csv", "text/plain"];

/**
 * File filter function to validate uploaded files
 */
function fileFilter(
    _req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
): void {
    // Check MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        callback(
            new BadRequestError(
                "Invalid file type. Only CSV files are allowed."
            )
        );
        return;
    }

    // Check file extension
    const extension = file.originalname
        .toLowerCase()
        .slice(file.originalname.lastIndexOf("."));
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        callback(
            new BadRequestError(
                "Invalid file extension. Only .csv files are allowed."
            )
        );
        return;
    }

    callback(null, true);
}

/**
 * Multer configuration for dataset file uploads
 *
 * - Uses memory storage (files stored in buffer)
 * - Limits file size to 1GB
 * - Only accepts CSV files
 */
const datasetUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
    },
    fileFilter,
});

/**
 * Middleware for single file upload with field name "file"
 */
export const uploadDatasetFile = datasetUpload.single("file");

/**
 * Export multer instance for custom configurations if needed
 */
export { datasetUpload };
