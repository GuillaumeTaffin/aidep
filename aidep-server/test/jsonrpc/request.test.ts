import {describe, expect, test} from "bun:test";
import {z} from "zod";
import {Request} from "@/jsonrpc";

describe("Verify type constraints of JSON-RPC requests", () => {
  const baseRequest = Request();

  test("Valid request without params", () => {
    const request = {jsonrpc: "2.0", method: "subtract"};
    const parsed = baseRequest.safeParse(request);

    expect(parsed.success).toBeTrue();
  });

  test("Missing jsonrpc version field", () => {
    const request = {};
    const parsed = baseRequest.safeParse(request);

    expect(parsed.error?.issues[0]).toMatchObject({
      path: ["jsonrpc"],
      message: "Invalid input: expected \"2.0\"",
    });
  });

  test("Missing method field", () => {
    const request = {jsonrpc: "2.0"};
    const parsed = baseRequest.safeParse(request);

    expect(parsed.error?.issues[0]).toMatchObject({
      path: ["method"],
      message: "Invalid input: expected string, received undefined",
    });
  });

  test("Reserved method name starting with 'rpc.' is valid", () => {
    const request = {jsonrpc: "2.0", method: "rpc.listMethods"};
    const parsed = baseRequest.safeParse(request);

    expect(parsed.success).toBeTrue();
  });
});

describe("Request with tuple params", () => {
  const SubtractRequest = Request(z.tuple([z.number(), z.number()]));

  test("Valid tuple params", () => {
    const request = {jsonrpc: "2.0", method: "subtract", params: [42, 23]};
    const parsed = SubtractRequest.safeParse(request);

    expect(parsed.success).toBeTrue();
  });

  test("Missing params is invalid", () => {
    const request = {jsonrpc: "2.0", method: "subtract"};
    const parsed = SubtractRequest.safeParse(request);

    expect(parsed.error?.issues[0]).toMatchObject({
      path: ["params"],
      message: "Invalid input: expected tuple, received undefined",
    });
  });

  test("Wrong tuple length is invalid", () => {
    const request = {jsonrpc: "2.0", method: "subtract", params: [42]};
    const parsed = SubtractRequest.safeParse(request);

    expect(parsed.error?.issues[0]).toMatchObject({
      path: ["params", 1],
      message: "Invalid input: expected number, received undefined",
    });
  });

  test("Wrong tuple types is invalid", () => {
    const request = {jsonrpc: "2.0", method: "subtract", params: ["a", "b"]};
    const parsed = SubtractRequest.safeParse(request);

    expect(parsed.error?.issues[0]).toMatchObject({
      path: ["params", 0],
      message: "Invalid input: expected number, received string",
    });
  });
});

describe("Request with object params", () => {
  const SubtractRequest = Request(z.object({left: z.number(), right: z.number()}));

  test("Valid object params", () => {
    const request = {jsonrpc: "2.0", method: "subtract", params: {left: 42, right: 23}};
    const parsed = SubtractRequest.safeParse(request);

    expect(parsed.success).toBeTrue();
  });

  test("Missing params is invalid", () => {
    const request = {jsonrpc: "2.0", method: "subtract"};
    const parsed = SubtractRequest.safeParse(request);

    expect(parsed.error?.issues[0]).toMatchObject({
      path: ["params"],
      message: "Invalid input: expected object, received undefined",
    });
  });

  test("Missing object property is invalid", () => {
    const request = {jsonrpc: "2.0", method: "subtract", params: {left: 42}};
    const parsed = SubtractRequest.safeParse(request);

    expect(parsed.error?.issues[0]).toMatchObject({
      path: ["params", "right"],
      message: "Invalid input: expected number, received undefined",
    });
  });

  test("Wrong object property type is invalid", () => {
    const request = {jsonrpc: "2.0", method: "subtract", params: {left: "42", right: 23}};
    const parsed = SubtractRequest.safeParse(request);

    expect(parsed.error?.issues[0]).toMatchObject({
      path: ["params", "left"],
      message: "Invalid input: expected number, received string",
    });
  });
});

describe("Request id field", () => {
  const baseRequest = Request();

  test("Request without id is valid (notification)", () => {
    const request = {jsonrpc: "2.0", method: "notify"};
    const parsed = baseRequest.safeParse(request);

    expect(parsed.success).toBeTrue();
  });

  test("Id as string is valid", () => {
    const request = {jsonrpc: "2.0", method: "subtract", id: "abc-123"};
    const parsed = baseRequest.safeParse(request);

    expect(parsed.success).toBeTrue();
  });

  test("Id as integer is valid", () => {
    const request = {jsonrpc: "2.0", method: "subtract", id: 42};
    const parsed = baseRequest.safeParse(request);

    expect(parsed.success).toBeTrue();
  });

  test("Id as null is valid", () => {
    const request = {jsonrpc: "2.0", method: "subtract", id: null};
    const parsed = baseRequest.safeParse(request);

    expect(parsed.success).toBeTrue();
  });

  test("Id as fractional number is invalid", () => {
    const request = {jsonrpc: "2.0", method: "subtract", id: 3.14};
    const parsed = baseRequest.safeParse(request);

    expect(parsed.error?.issues[0]).toMatchObject({
      path: ["id"],
    });
  });

  test("Id as object is invalid", () => {
    const request = {jsonrpc: "2.0", method: "subtract", id: {value: 1}};
    const parsed = baseRequest.safeParse(request);

    expect(parsed.error?.issues[0]).toMatchObject({
      path: ["id"],
    });
  });

  test("Id as array is invalid", () => {
    const request = {jsonrpc: "2.0", method: "subtract", id: [1, 2]};
    const parsed = baseRequest.safeParse(request);

    expect(parsed.error?.issues[0]).toMatchObject({
      path: ["id"],
    });
  });
});