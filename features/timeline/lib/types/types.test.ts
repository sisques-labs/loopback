import { describe, it, expectTypeOf } from "vitest";
import type {
  TimelineEvent,
  TimelineTimeRange,
  TimelineEventLevel,
  TimelineStoreStatus,
} from "./types";

describe("TimelineEvent", () => {
  it("has required fields with correct types", () => {
    expectTypeOf<TimelineEvent>().toHaveProperty("eventId").toBeString();
    expectTypeOf<TimelineEvent>().toHaveProperty("timestamp").toBeNumber();
    expectTypeOf<TimelineEvent>().toHaveProperty("message").toBeString();
    expectTypeOf<TimelineEvent>().toHaveProperty("service").toBeString();
    expectTypeOf<TimelineEvent>().toHaveProperty("logGroupName").toBeString();
  });

  it("has optional level field", () => {
    // level is optional — a TimelineEvent without level must be valid
    const event: TimelineEvent = {
      eventId: "evt-1",
      timestamp: 1000,
      message: "hello",
      service: "lambda",
      logGroupName: "/aws/lambda/fn",
    };
    expectTypeOf(event).toMatchTypeOf<TimelineEvent>();
  });

  it("level field accepts valid union values", () => {
    const withLevel: TimelineEvent = {
      eventId: "evt-2",
      timestamp: 1000,
      message: "warn msg",
      service: "lambda",
      logGroupName: "/aws/lambda/fn",
      level: "warn",
    };
    expectTypeOf(withLevel.level).toEqualTypeOf<
      "info" | "warn" | "error" | "unknown" | undefined
    >();
  });
});

describe("TimelineTimeRange", () => {
  it("is a union of 4 valid range strings", () => {
    const r1: TimelineTimeRange = "1h";
    const r2: TimelineTimeRange = "6h";
    const r3: TimelineTimeRange = "24h";
    const r4: TimelineTimeRange = "all";
    expectTypeOf(r1).toEqualTypeOf<TimelineTimeRange>();
    expectTypeOf(r2).toEqualTypeOf<TimelineTimeRange>();
    expectTypeOf(r3).toEqualTypeOf<TimelineTimeRange>();
    expectTypeOf(r4).toEqualTypeOf<TimelineTimeRange>();
  });
});

describe("TimelineEventLevel", () => {
  it("is a union of info | warn | error | unknown", () => {
    const l1: TimelineEventLevel = "info";
    const l2: TimelineEventLevel = "warn";
    const l3: TimelineEventLevel = "error";
    const l4: TimelineEventLevel = "unknown";
    expectTypeOf(l1).toEqualTypeOf<TimelineEventLevel>();
    expectTypeOf(l2).toEqualTypeOf<TimelineEventLevel>();
    expectTypeOf(l3).toEqualTypeOf<TimelineEventLevel>();
    expectTypeOf(l4).toEqualTypeOf<TimelineEventLevel>();
  });
});

describe("TimelineStoreStatus", () => {
  it("is a union of idle | polling | error", () => {
    const s1: TimelineStoreStatus = "idle";
    const s2: TimelineStoreStatus = "polling";
    const s3: TimelineStoreStatus = "error";
    expectTypeOf(s1).toEqualTypeOf<TimelineStoreStatus>();
    expectTypeOf(s2).toEqualTypeOf<TimelineStoreStatus>();
    expectTypeOf(s3).toEqualTypeOf<TimelineStoreStatus>();
  });
});
