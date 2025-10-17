// utils/responseHandler.ts
import { Response } from "express";

/**
 * Estructura de respuesta unificada y accesible.
 * Facilita la comprensión para usuarios, frontend y herramientas de asistencia.
 */

export const successResponse = (res: Response, message: string, data?: any, statusCode = 200) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data: data ?? null,
  });
};

export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  details?: any
) => {
  return res.status(statusCode).json({
    status: "error",
    message,
    details: process.env.NODE_ENV === "development" ? details : undefined, // solo en desarrollo
  });
};
