import { NextFunction, Request, Response } from "express";
import { z, ZodSchema } from "zod";
import { AppError } from "../utils/appError";

export enum ValidationType {
  BODY = "body",
  PARAMS = "params",
  QUERY = "query",
}

export const validate = (
  schema: ZodSchema,
  type: ValidationType = ValidationType.BODY
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[type];

      const validatedData = schema.parse(dataToValidate);

      req[type] = validatedData;

      next();
    } catch (error: any) {
      return next(new AppError(error.message, 400));
    }
  };
};

export const validateBody = (schema: ZodSchema) =>
  validate(schema, ValidationType.BODY);

export const validateParams = (schema: ZodSchema) =>
  validate(schema, ValidationType.PARAMS);

export const validateQuery = (schema: ZodSchema) =>
  validate(schema, ValidationType.QUERY);

export const validateId = validate(
  z.object({
    id: z.string().cuid("Geçerli bir CUID formatı gerekli"),
  }),
  ValidationType.PARAMS
);
