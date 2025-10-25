/**
 * @fileoverview Cloudinary configuration module.
 * This file initializes and exports the Cloudinary client (v2) 
 * using environment variables defined in the .env file.
 * 
 * The configuration enables secure connections and sets up 
 * the credentials required for uploading and managing media 
 * assets in the Cloudinary cloud service.
 * 
 * @requires cloudinary
 * @requires dotenv
 */

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

/**
 * Configures the Cloudinary SDK with credentials and options.
 * The following environment variables must be defined in the `.env` file:
 * 
 * - `CLOUDINARY_CLOUD_NAME`: The name of your Cloudinary cloud.
 * - `CLOUDINARY_API_KEY`: The API key used for authentication.
 * - `CLOUDINARY_API_SECRET`: The API secret key used for authentication.
 * 
 * The `secure` option is set to `true` to ensure HTTPS communication.
 * 
 * @example
 * // Example usage:
 * import cloudinary from './config/cloudinary.js';
 * 
 * const result = await cloudinary.uploader.upload("image.jpg");
 * console.log(result.secure_url);
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

/**
 * Exports the configured Cloudinary instance for use in other modules.
 * @type {import('cloudinary').v2}
 */
export default cloudinary;
