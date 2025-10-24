import multer from "multer";

/**
 * Multer configuration for handling file uploads.
 * 
 * This setup uses memory storage, meaning uploaded files
 * are kept in RAM as `Buffer` objects instead of being written
 * to the file system. This approach is suitable for applications
 * that process or upload files to external services (like cloud
 * storage) immediately after receiving them.
 */

// Configure Multer to store uploaded files in memory (not on disk)
const storage = multer.memoryStorage();

/**
 * Multer middleware instance for file uploading.
 * 
 * - Uses in-memory storage (`Buffer` instead of file path)
 * - Limits the maximum file size to 100 MB
 */
export const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max size
});
