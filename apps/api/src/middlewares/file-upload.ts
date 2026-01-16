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
 * Maximum file size in bytes per chunk (100MB - allows for 50MB chunks with safety margin)
 * Note: The frontend sends chunks of 50MB, but we allow up to 100MB per chunk for flexibility.
 */
const MAX_FILE_SIZE = 100 * 1024 * 1024;

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
 *
 * Note: For chunked uploads, we're more lenient with MIME type validation
 * since chunks may not have proper MIME types. The extension check ensures
 * we only accept CSV files. Full validation happens in the controller.
 */
function fileFilter(
    _req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
): void {
    // Always check file extension first (most reliable check)
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

    // For MIME type, be more lenient:
    // - Allow empty MIME types (chunks might not have MIME type)
    // - Allow generic types like application/octet-stream (common for chunks)
    // - Allow the standard CSV MIME types
    if (
        file.mimetype &&
        !ALLOWED_MIME_TYPES.includes(file.mimetype) &&
        file.mimetype !== "application/octet-stream"
    ) {
        // Only reject if MIME type is explicitly set and not allowed
        // Empty or generic types are acceptable (will be validated in controller)
        callback(
            new BadRequestError(
                "Invalid file type. Only CSV files are allowed."
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
 * - Limits file size to 100MB per chunk (frontend sends 50MB chunks)
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
