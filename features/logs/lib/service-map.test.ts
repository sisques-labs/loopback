import { describe, expect, it } from "vitest";
import { mapLogGroupToService } from "./service-map";

describe("mapLogGroupToService", () => {
  it("maps /aws/lambda/<fn> to 'lambda'", () => {
    expect(mapLogGroupToService("/aws/lambda/my-function")).toBe("lambda");
  });

  it("maps /aws/s3/<bucket> to 's3'", () => {
    expect(mapLogGroupToService("/aws/s3/my-bucket")).toBe("s3");
  });

  it("maps /aws/<service>/... to the service segment", () => {
    expect(mapLogGroupToService("/aws/dynamodb/table-name")).toBe("dynamodb");
    expect(mapLogGroupToService("/aws/sqs/my-queue")).toBe("sqs");
    expect(mapLogGroupToService("/aws/sns/my-topic")).toBe("sns");
  });

  it("maps flat token 'sqs-queue' containing 'sqs' to 'sqs'", () => {
    expect(mapLogGroupToService("sqs-queue")).toBe("sqs");
  });

  it("maps flat token 's3-access-logs' containing 's3' to 's3'", () => {
    expect(mapLogGroupToService("s3-access-logs")).toBe("s3");
  });

  it("maps flat token 'lambda-errors' containing 'lambda' to 'lambda'", () => {
    expect(mapLogGroupToService("lambda-errors")).toBe("lambda");
  });

  it("returns 'unknown' when no match is found", () => {
    expect(mapLogGroupToService("application-logs")).toBe("unknown");
    expect(mapLogGroupToService("")).toBe("unknown");
    expect(mapLogGroupToService("/custom/prefix")).toBe("unknown");
  });

  it("is case-insensitive for flat token matching", () => {
    expect(mapLogGroupToService("SQS-queue")).toBe("sqs");
    expect(mapLogGroupToService("LAMBDA-errors")).toBe("lambda");
  });
});
