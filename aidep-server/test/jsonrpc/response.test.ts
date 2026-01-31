import {describe, expect, test} from "bun:test";
import {z} from "zod";
import {ErrorCode, ErrorObject, ErrorResponse, Response, SuccessResponse} from "@/jsonrpc";

describe("Success response", () => {
  const BaseSuccessResponse = SuccessResponse(z.unknown());

  describe("jsonrpc field", () => {
    test("Valid jsonrpc version", () => {
      const response = {jsonrpc: "2.0", result: 42, id: 1};
      const parsed = BaseSuccessResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Missing jsonrpc field is invalid", () => {
      const response = {result: 42, id: 1};
      const parsed = BaseSuccessResponse.safeParse(response);

      expect(parsed.error?.issues[0]).toMatchObject({
        path: ["jsonrpc"],
      });
    });

    test("Wrong jsonrpc version is invalid", () => {
      const response = {jsonrpc: "1.0", result: 42, id: 1};
      const parsed = BaseSuccessResponse.safeParse(response);

      expect(parsed.error?.issues[0]).toMatchObject({
        path: ["jsonrpc"],
      });
    });
  });

  describe("result field", () => {
    test("Result as number is valid", () => {
      const response = {jsonrpc: "2.0", result: 42, id: 1};
      const parsed = BaseSuccessResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Result as string is valid", () => {
      const response = {jsonrpc: "2.0", result: "hello", id: 1};
      const parsed = BaseSuccessResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Result as object is valid", () => {
      const response = {jsonrpc: "2.0", result: {foo: "bar"}, id: 1};
      const parsed = BaseSuccessResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Result as null is valid", () => {
      const response = {jsonrpc: "2.0", result: null, id: 1};
      const parsed = BaseSuccessResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Missing result field is invalid", () => {
      const response = {jsonrpc: "2.0", id: 1};
      const parsed = BaseSuccessResponse.safeParse(response);

      expect(parsed.error?.issues[0]).toMatchObject({
        path: ["result"],
      });
    });
  });

  describe("id field", () => {
    test("Id as string is valid", () => {
      const response = {jsonrpc: "2.0", result: 42, id: "abc-123"};
      const parsed = BaseSuccessResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Id as integer is valid", () => {
      const response = {jsonrpc: "2.0", result: 42, id: 1};
      const parsed = BaseSuccessResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Id as null is valid", () => {
      const response = {jsonrpc: "2.0", result: 42, id: null};
      const parsed = BaseSuccessResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Missing id field is invalid", () => {
      const response = {jsonrpc: "2.0", result: 42};
      const parsed = BaseSuccessResponse.safeParse(response);

      expect(parsed.error?.issues[0]).toMatchObject({
        path: ["id"],
      });
    });

    test("Id as fractional number is invalid", () => {
      const response = {jsonrpc: "2.0", result: 42, id: 3.14};
      const parsed = BaseSuccessResponse.safeParse(response);

      expect(parsed.error?.issues[0]).toMatchObject({
        path: ["id"],
      });
    });
  });
});

describe("Success response with typed result", () => {
  const NumberResponse = SuccessResponse(z.number());

  test("Result matching schema is valid", () => {
    const response = {jsonrpc: "2.0", result: 42, id: 1};
    const parsed = NumberResponse.safeParse(response);

    expect(parsed.success).toBeTrue();
  });

  test("Result not matching schema is invalid", () => {
    const response = {jsonrpc: "2.0", result: "not a number", id: 1};
    const parsed = NumberResponse.safeParse(response);

    expect(parsed.error?.issues[0]).toMatchObject({
      path: ["result"],
    });
  });
});

describe("Error response", () => {
  describe("jsonrpc field", () => {
    test("Valid jsonrpc version", () => {
      const response = {jsonrpc: "2.0", error: {code: -32600, message: "Invalid Request"}, id: null};
      const parsed = ErrorResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Missing jsonrpc field is invalid", () => {
      const response = {error: {code: -32600, message: "Invalid Request"}, id: null};
      const parsed = ErrorResponse.safeParse(response);

      expect(parsed.error?.issues[0]).toMatchObject({
        path: ["jsonrpc"],
      });
    });
  });

  describe("error field", () => {
    test("Valid error object", () => {
      const response = {jsonrpc: "2.0", error: {code: -32600, message: "Invalid Request"}, id: null};
      const parsed = ErrorResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Error with data field is valid", () => {
      const response = {jsonrpc: "2.0", error: {code: -32600, message: "Invalid Request", data: {details: "foo"}}, id: null};
      const parsed = ErrorResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Missing error field is invalid", () => {
      const response = {jsonrpc: "2.0", id: null};
      const parsed = ErrorResponse.safeParse(response);

      expect(parsed.error?.issues[0]).toMatchObject({
        path: ["error"],
      });
    });

    test("Error without code is invalid", () => {
      const response = {jsonrpc: "2.0", error: {message: "Invalid Request"}, id: null};
      const parsed = ErrorResponse.safeParse(response);

      expect(parsed.error?.issues[0]).toMatchObject({
        path: ["error", "code"],
      });
    });

    test("Error without message is invalid", () => {
      const response = {jsonrpc: "2.0", error: {code: -32600}, id: null};
      const parsed = ErrorResponse.safeParse(response);

      expect(parsed.error?.issues[0]).toMatchObject({
        path: ["error", "message"],
      });
    });

    test("Error code as fractional number is invalid", () => {
      const response = {jsonrpc: "2.0", error: {code: -32600.5, message: "Error"}, id: null};
      const parsed = ErrorResponse.safeParse(response);

      expect(parsed.error?.issues[0]).toMatchObject({
        path: ["error", "code"],
      });
    });
  });

  describe("id field", () => {
    test("Id as null is valid (for parse errors)", () => {
      const response = {jsonrpc: "2.0", error: {code: -32700, message: "Parse error"}, id: null};
      const parsed = ErrorResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Id as string is valid", () => {
      const response = {jsonrpc: "2.0", error: {code: -32600, message: "Invalid Request"}, id: "abc-123"};
      const parsed = ErrorResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Id as integer is valid", () => {
      const response = {jsonrpc: "2.0", error: {code: -32600, message: "Invalid Request"}, id: 1};
      const parsed = ErrorResponse.safeParse(response);

      expect(parsed.success).toBeTrue();
    });

    test("Missing id field is invalid", () => {
      const response = {jsonrpc: "2.0", error: {code: -32600, message: "Invalid Request"}};
      const parsed = ErrorResponse.safeParse(response);

      expect(parsed.error?.issues[0]).toMatchObject({
        path: ["id"],
      });
    });
  });
});

describe("Error object", () => {
  describe("code field", () => {
    test("Parse error code", () => {
      const error = {code: ErrorCode.ParseError, message: "Parse error"};
      const parsed = ErrorObject.safeParse(error);

      expect(parsed.success).toBeTrue();
      expect(parsed.data?.code).toBe(-32700);
    });

    test("Invalid request code", () => {
      const error = {code: ErrorCode.InvalidRequest, message: "Invalid Request"};
      const parsed = ErrorObject.safeParse(error);

      expect(parsed.success).toBeTrue();
      expect(parsed.data?.code).toBe(-32600);
    });

    test("Method not found code", () => {
      const error = {code: ErrorCode.MethodNotFound, message: "Method not found"};
      const parsed = ErrorObject.safeParse(error);

      expect(parsed.success).toBeTrue();
      expect(parsed.data?.code).toBe(-32601);
    });

    test("Invalid params code", () => {
      const error = {code: ErrorCode.InvalidParams, message: "Invalid params"};
      const parsed = ErrorObject.safeParse(error);

      expect(parsed.success).toBeTrue();
      expect(parsed.data?.code).toBe(-32602);
    });

    test("Internal error code", () => {
      const error = {code: ErrorCode.InternalError, message: "Internal error"};
      const parsed = ErrorObject.safeParse(error);

      expect(parsed.success).toBeTrue();
      expect(parsed.data?.code).toBe(-32603);
    });

    test("Server error code in reserved range", () => {
      const error = {code: -32050, message: "Server error"};
      const parsed = ErrorObject.safeParse(error);

      expect(parsed.success).toBeTrue();
    });

    test("Application error code", () => {
      const error = {code: 1001, message: "Application error"};
      const parsed = ErrorObject.safeParse(error);

      expect(parsed.success).toBeTrue();
    });
  });

  describe("data field", () => {
    test("Data as object is valid", () => {
      const error = {code: -32600, message: "Error", data: {details: "more info"}};
      const parsed = ErrorObject.safeParse(error);

      expect(parsed.success).toBeTrue();
    });

    test("Data as string is valid", () => {
      const error = {code: -32600, message: "Error", data: "more info"};
      const parsed = ErrorObject.safeParse(error);

      expect(parsed.success).toBeTrue();
    });

    test("Data as array is valid", () => {
      const error = {code: -32600, message: "Error", data: ["error1", "error2"]};
      const parsed = ErrorObject.safeParse(error);

      expect(parsed.success).toBeTrue();
    });

    test("Missing data is valid", () => {
      const error = {code: -32600, message: "Error"};
      const parsed = ErrorObject.safeParse(error);

      expect(parsed.success).toBeTrue();
    });
  });
});

describe("Response union", () => {
  const BaseResponse = Response(z.unknown());

  test("Success response is valid", () => {
    const response = {jsonrpc: "2.0", result: 42, id: 1};
    const parsed = BaseResponse.safeParse(response);

    expect(parsed.success).toBeTrue();
  });

  test("Error response is valid", () => {
    const response = {jsonrpc: "2.0", error: {code: -32600, message: "Invalid Request"}, id: null};
    const parsed = BaseResponse.safeParse(response);

    expect(parsed.success).toBeTrue();
  });

  test("Response with both result and error is invalid", () => {
    const response = {jsonrpc: "2.0", result: 42, error: {code: -32600, message: "Error"}, id: 1};
    const parsed = BaseResponse.safeParse(response);

    expect(parsed.error?.issues[0]).toMatchObject({
      code: "invalid_union",
    });
  });

  test("Response with neither result nor error is invalid", () => {
    const response = {jsonrpc: "2.0", id: 1};
    const parsed = BaseResponse.safeParse(response);

    expect(parsed.error?.issues[0]).toMatchObject({
      path: ["result"],
      message: "result is required",
    });
  });
});
