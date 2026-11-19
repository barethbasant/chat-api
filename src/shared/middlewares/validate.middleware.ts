import type { RequestHandler } from "express";
import { ZodError, type ZodType } from "zod";

export const validate = (schema: ZodType): RequestHandler => {
  return async (req, res, next) => {
    try {
      const result = await schema.safeParseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
      }

      req.validated = result.data as {
        body: unknown;
        params: unknown;
        query: unknown;
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};
