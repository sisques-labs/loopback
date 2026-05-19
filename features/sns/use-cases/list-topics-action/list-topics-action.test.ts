import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/features/sns/services/list-topics/list-topics", () => ({
  listTopics: vi.fn(),
}));

import { listTopics } from "@/features/sns/services/list-topics/list-topics";
import { listTopicsAction } from "./list-topics-action";
import type { Topic } from "@/features/sns/types/sns";

const mockTopics: Topic[] = [
  {
    arn: "arn:aws:sns:us-east-1:000000000000:alpha-topic",
    name: "alpha-topic",
    displayName: "Alpha Topic",
    isFifo: false,
  },
  {
    arn: "arn:aws:sns:us-east-1:000000000000:beta-topic.fifo",
    name: "beta-topic.fifo",
    isFifo: true,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listTopicsAction — success branch", () => {
  it("calls listTopics() and returns the topic array", async () => {
    vi.mocked(listTopics).mockResolvedValue(mockTopics);

    const result = await listTopicsAction();

    expect(listTopics).toHaveBeenCalledOnce();
    expect(result).toEqual(mockTopics);
  });

  it("returns an empty array when there are no topics", async () => {
    vi.mocked(listTopics).mockResolvedValue([]);

    const result = await listTopicsAction();

    expect(result).toEqual([]);
  });
});

describe("listTopicsAction — error branch", () => {
  it("re-throws errors from the underlying service", async () => {
    const error = Object.assign(new Error("Connection refused"), { name: "EndpointError" });
    vi.mocked(listTopics).mockRejectedValue(error);

    await expect(listTopicsAction()).rejects.toThrow("Connection refused");
  });
});
