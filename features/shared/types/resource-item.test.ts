import { describe, expectTypeOf, it, expect } from "vitest";
// Runtime import to ensure the module exists (will error if the file does not exist)
import * as ResourceItemModule from "./resource-item";
import type { ResourceItem } from "./resource-item";

describe("ResourceItem type", () => {
  it("exports ResourceItem (module must exist)", () => {
    // This confirms the module is importable at runtime
    expect(ResourceItemModule).toBeDefined();
  });

  it("has an id field of type string", () => {
    expectTypeOf<ResourceItem["id"]>().toEqualTypeOf<string>();
  });

  it("has a label field of type string", () => {
    expectTypeOf<ResourceItem["label"]>().toEqualTypeOf<string>();
  });

  it("has a kind field restricted to the five service literals", () => {
    expectTypeOf<ResourceItem["kind"]>().toEqualTypeOf<
      "s3" | "sqs" | "lambda" | "sns" | "dynamodb"
    >();
  });

  it("has an href field of type string", () => {
    expectTypeOf<ResourceItem["href"]>().toEqualTypeOf<string>();
  });

  it("accepts a fully-typed ResourceItem object", () => {
    const item: ResourceItem = {
      id: "my-bucket",
      label: "my-bucket",
      kind: "s3",
      href: "/en/s3/my-bucket",
    };
    expectTypeOf(item).toEqualTypeOf<ResourceItem>();
  });
});
