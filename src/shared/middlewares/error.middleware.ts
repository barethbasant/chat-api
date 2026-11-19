import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import {
  UniqueConstraintError,
  ValidationError as SequelizeValidationError,
  ForeignKeyConstraintError,
} from "sequelize";

import { AppError } from "../errors/app-error.js";

export const errorMiddleware: ErrorRequestHandler = (error, req, res, next) => {
  console.error("API Error:", error);

  // Application errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Zod errors
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  // Duplicate database records
  if (error instanceof UniqueConstraintError) {
    res.status(409).json({
      success: false,
      message: "Resource already exists",
    });
    return;
  }

  // Sequelize validation errors
  if (error instanceof SequelizeValidationError) {
    res.status(400).json({
      success: false,
      message: "Database validation failed",
    });
    return;
  }

  // Foreign key constraint errors
  if (error instanceof ForeignKeyConstraintError) {
    res.status(409).json({
      success: false,
      message: "Related resource does not exist or cannot be changed",
    });
    return;
  }

  // Unexpected errors
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
