// utils/responseHandler.ts
import { Response } from "express";

/**
 * @file responseHandler.ts
 * @description Provides a unified and accessible structure for API responses.
 * Simplifies response handling for frontend applications and assists accessibility tools.
 * 
 * This module standardizes both success and error responses, ensuring consistency
 * across the entire backend.
 */

/**
 * Sends a standardized success response.
 *
 * @function successResponse
 * @param {Response} res - Express response object.
 * @param {string} message - Human-readable success message.
 * @param {any} [data] - Optional payload containing response data.
 * @param {number} [statusCode=200] - HTTP status code (default: 200).
 * @returns {Response} JSON response with a success structure.
 *
 * @example
 * successResponse(res, "User created successfully", newUser, 201);
 */
export const successResponse = (
  res: Response,
  message: string,
  data?: any,
  statusCode = 200
) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data: data ?? null,
  });
};

/**
 * Sends a standardized error response.
 *
 * @function errorResponse
 * @param {Response} res - Express response object.
 * @param {number} statusCode - HTTP status code to send (e.g., 400, 500).
 * @param {string} message - Human-readable error message.
 * @param {any} [details] - Optional additional information (only shown in development mode).
 * @returns {Response} JSON response with an error structure.
 *
 * @example
 * errorResponse(res, 400, "Invalid input data", validationErrors);
 */
export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  details?: any
) => {
  return res.status(statusCode).json({
    status: "error",
    message,
    details: process.env.NODE_ENV === "development" ? details : undefined, // shown only in development
  });
};
