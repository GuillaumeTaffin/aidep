import {z, ZodTuple, ZodObject} from "zod";

export const Request = <T extends ZodTuple<any> | ZodObject<any> | undefined = undefined>(
  paramsSchema?: T
) => {
  const base = {
    jsonrpc: z.literal("2.0"),
    method: z.string(),
    id: z.union([z.string(), z.number().int(), z.null()]).optional(),
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