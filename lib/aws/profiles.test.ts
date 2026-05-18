import { describe, expect, it } from "vitest";
import {
  MAX_PROFILES,
  parseActiveProfileCookie,
  parseProfilesCookie,
  type Profile,
} from "./profiles";

describe("MAX_PROFILES", () => {
  it("equals 10", () => {
    expect(MAX_PROFILES).toBe(10);
  });
});

describe("parseProfilesCookie", () => {
  it("returns [] when value is undefined", () => {
    expect(parseProfilesCookie(undefined)).toEqual([]);
  });

  it("returns [] when value is empty string", () => {
    expect(parseProfilesCookie("")).toEqual([]);
  });

  it("returns [] when value is not valid JSON", () => {
    expect(parseProfilesCookie("not-json")).toEqual([]);
  });

  it("returns [] when value is valid JSON but an empty array", () => {
    expect(parseProfilesCookie(JSON.stringify([]))).toEqual([]);
  });

  it("returns array with one Profile when value is a valid profile", () => {
    const profile: Profile = {
      id: "1",
      name: "dev",
      endpoint: "http://localhost:4566",
      region: "us-east-1",
    };
    const result = parseProfilesCookie(JSON.stringify([profile]));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(profile);
  });

  it("skips items missing required field id", () => {
    const items = [
      { name: "dev", endpoint: "http://localhost:4566", region: "us-east-1" },
    ];
    expect(parseProfilesCookie(JSON.stringify(items))).toEqual([]);
  });

  it("skips items missing required field name", () => {
    const items = [
      { id: "1", endpoint: "http://localhost:4566", region: "us-east-1" },
    ];
    expect(parseProfilesCookie(JSON.stringify(items))).toEqual([]);
  });

  it("skips items missing required field endpoint", () => {
    const items = [{ id: "1", name: "dev", region: "us-east-1" }];
    expect(parseProfilesCookie(JSON.stringify(items))).toEqual([]);
  });

  it("skips items missing required field region", () => {
    const items = [{ id: "1", name: "dev", endpoint: "http://localhost:4566" }];
    expect(parseProfilesCookie(JSON.stringify(items))).toEqual([]);
  });

  it("skips invalid items and keeps valid ones in a mixed array", () => {
    const valid: Profile = {
      id: "2",
      name: "staging",
      endpoint: "http://localhost:4567",
      region: "eu-west-1",
    };
    const invalid = { name: "broken" };
    const result = parseProfilesCookie(JSON.stringify([invalid, valid]));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(valid);
  });

  it("returns [] when value is a JSON object (not array)", () => {
    expect(parseProfilesCookie(JSON.stringify({ id: "1" }))).toEqual([]);
  });
});

describe("parseActiveProfileCookie", () => {
  const profiles: Profile[] = [
    {
      id: "id-1",
      name: "dev",
      endpoint: "http://localhost:4566",
      region: "us-east-1",
    },
    {
      id: "id-2",
      name: "staging",
      endpoint: "http://localhost:4567",
      region: "eu-west-1",
    },
  ];

  it("returns null when value is undefined", () => {
    expect(parseActiveProfileCookie(undefined, [])).toBeNull();
  });

  it("returns null when value is undefined and profiles exist", () => {
    expect(parseActiveProfileCookie(undefined, profiles)).toBeNull();
  });

  it("returns null when id is not found in profiles", () => {
    expect(parseActiveProfileCookie("id-not-found", profiles)).toBeNull();
  });

  it("returns null when profiles array is empty", () => {
    expect(parseActiveProfileCookie("id-1", [])).toBeNull();
  });

  it("returns the matching Profile when id is found", () => {
    const result = parseActiveProfileCookie("id-1", profiles);
    expect(result).toEqual(profiles[0]);
  });

  it("returns the second profile when its id matches", () => {
    const result = parseActiveProfileCookie("id-2", profiles);
    expect(result).toEqual(profiles[1]);
  });
});
