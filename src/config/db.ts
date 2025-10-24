/**
 * @fileoverview Database connection module.
 * This module establishes a connection to a MongoDB database 
 * using the Mongoose ODM library.
 * 
 * The connection URI must be provided via the `MONGODB_URI` 
 * environment variable in the `.env` file.
 * 
 * @requires mongoose
 */

import mongoose from "mongoose";

/**
 * Asynchronously connects to the MongoDB database.
 *
 * Uses the connection string defined in the `MONGODB_URI` environment variable.
 * If the connection is successful, logs the host of the connected database.
 * If the connection fails, logs the error and terminates the Node.js process.
 *
 * @async
 * @function connectDB
 * @throws Will exit the process with code 1 if the connection fails.
 *
 * @example
 * import { connectDB } from './config/db.js';
 * 
 * // Connect to MongoDB before starting the server
 * connectDB();
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};
