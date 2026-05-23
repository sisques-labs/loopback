import { describe, it, expectTypeOf } from "vitest";
import type { RequestEntry, RequestFilters, RequestStatus } from "./types";

describe("RequestStatus", () => {
  it("is a union of 'success' | 'error'", () => {
    expectTypeOf<RequestStatus>().toEqualTypeOf<"success" | "error">();
  });
});

describe("RequestEntry", () => {
  it("has required fields with correct types", () => {
    expectTypeOf<RequestEntry["id"]>().toEqualTypeOf<string>();
    expectTypeOf<RequestEntry["timestamp"]>().toEqualTypeOf<number>();
    expectTypeOf<RequestEntry["service"]>().toEqualTypeOf<string>();
    expectTypeOf<RequestEntry["operation"]>().toEqualTypeOf<string>();
    expectTypeOf<RequestEntry["input"]>().toEqualTypeOf<unknown>();
    expectTypeOf<RequestEntry["output"]>().toEqualTypeOf<unknown>();
    expectTypeOf<RequestEntry["durationMs"]>().toEqualTypeOf<number>();
    expectTypeOf<RequestEntry["status"]>().toEqualTypeOf<RequestStatus>();
    expectTypeOf<RequestEntry["attempts"]>().toEqualTypeOf<number>();
  });

  it("has optional error field", () => {
    expectTypeOf<RequestEntry["error"]>().toEqualTypeOf<
      | {
          name: string;
          message: string;
          code?: string;
          statusCode?: number;
        }
      | undefined
    >();
  });
});

describe("RequestFilters", () => {
  it("has service field as string", () => {
    expectTypeOf<RequestFilters["service"]>().toEqualTypeOf<string>();
  });

  it("has status field as 'all' | 'success' | 'error'", () => {
    expectTypeOf<RequestFilters["status"]>().toEqualTypeOf<
      "all" | "success" | "error"
    >();
  });

  it("has text field as string", () => {
    expectTypeOf<RequestFilters["text"]>().toEqualTypeOf<string>();
  });
});
