import {z, ZodObject, ZodTuple} from "zod";

export const Version = z.literal("2.0");

export const Id = z.union([z.string(), z.number().int(), z.null()]);

export const Request = <T extends ZodTuple<any> | ZodObject<any> | undefined = undefined>(
  paramsSchema?: T
) => {
  const base = {
    jsonrpc: Version,
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

export const ErrorCode = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
} as const;

export const ErrorObject = z.object({
  code: z.number().int(),
  message: z.string(),
  data: z.unknown().optional(),
});

export type ErrorObject = z.infer<typeof ErrorObject>;

export const SuccessResponse = <T extends z.ZodTypeAny>(
  resultSchema: T
) => z.object({
  jsonrpc: Version,
  result: resultSchema,
  id: Id,
}).strict().refine(
  (data) => "result" in data,
  { message: "result is required", path: ["result"] }
);

export type SuccessResponse<T extends z.ZodTypeAny> =
  z.infer<ReturnType<typeof SuccessResponse<T>>>;

export const ErrorResponse = z.object({
  jsonrpc: Version,
  error: ErrorObject,
  id: Id,
}).strict();

export type ErrorResponse = z.infer<typeof ErrorResponse>;

export const Response = <T extends z.ZodTypeAny>(
  resultSchema: T
) => z.union([SuccessResponse(resultSchema), ErrorResponse]);

export type Response<T extends z.ZodTypeAny> =
  z.infer<ReturnType<typeof Response<T>>>;