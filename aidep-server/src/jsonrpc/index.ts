import {z, ZodObject, ZodTuple} from "zod";

export const Id = z.union([z.string(), z.number().int(), z.null()]);
export type Id = z.infer<typeof Id>;

export const Request = <T extends ZodTuple<any> | ZodObject<any> | undefined = undefined>(
  paramsSchema?: T
) => {
  const base = {
    jsonrpc: z.literal("2.0"),
    method: z.string(),
    id: Id.optional(),
  };

  if (paramsSchema === undefined) {
    return z.object(base);
  }

  return z.object({
    ...base,
    params: paramsSchema,
  });
};

export type Request<T extends ZodTuple<any> | ZodObject<any> | undefined = undefined> =
  z.infer<ReturnType<typeof Request<T>>>;

// Error codes
export const ErrorCode = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
} as const;

// Error object schema
export const ErrorObject = z.object({
  code: z.number().int(),
  message: z.string(),
  data: z.unknown().optional(),
});

export type ErrorObject = z.infer<typeof ErrorObject>;

// Success response
export const SuccessResponse = <T extends z.ZodTypeAny>(
  resultSchema: T
) => z.object({
  jsonrpc: z.literal("2.0"),
  result: resultSchema,
  id: Id,
}).strict().refine(
  (data) => "result" in data,
  { message: "result is required", path: ["result"] }
);

export type SuccessResponse<T extends z.ZodTypeAny> =
  z.infer<ReturnType<typeof SuccessResponse<T>>>;

// Error response
export const ErrorResponse = z.object({
  jsonrpc: z.literal("2.0"),
  error: ErrorObject,
  id: Id,
}).strict();

export type ErrorResponse = z.infer<typeof ErrorResponse>;

// Response is either success or error
export const Response = <T extends z.ZodTypeAny>(
  resultSchema: T
) => z.union([SuccessResponse(resultSchema), ErrorResponse]);

export type Response<T extends z.ZodTypeAny> =
  z.infer<ReturnType<typeof Response<T>>>;