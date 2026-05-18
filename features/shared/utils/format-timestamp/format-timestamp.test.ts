import { afterEach, describe, expect, it, vi } from "vitest";
import { formatTimestamp } from "./format-timestamp";

describe("formatTimestamp", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls toLocaleTimeString with 24-hour time options", () => {
    const spy = vi.spyOn(Date.prototype, "toLocaleTimeString");
    formatTimestamp(1700000000000);

    expect(spy).toHaveBeenCalledWith(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  });

  it("returns the formatted string from toLocaleTimeString", () => {
    vi.spyOn(Date.prototype, "toLocaleTimeString").mockReturnValue("14:30:45");

    expect(formatTimestamp(0)).toBe("14:30:45");
  });

  it("does not return the raw epoch milliseconds", () => {
    const epoch = 1700000000000;
    vi.spyOn(Date.prototype, "toLocaleTimeString").mockReturnValue("22:13:20");

    expect(formatTimestamp(epoch)).not.toBe(String(epoch));
  });
});
