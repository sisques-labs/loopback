import "server-only";

import {
  DescribeLogGroupsCommand,
  type DescribeLogGroupsCommandOutput,
} from "@aws-sdk/client-cloudwatch-logs";
import { getCloudWatchLogsClient } from "@/features/logs/lib/client/client";

export async function listLogGroups(): Promise<string[]> {
  const client = await getCloudWatchLogsClient();
  const names: string[] = [];
  let nextToken: string | undefined = undefined;

  do {
    const res: DescribeLogGroupsCommandOutput = await client.send(
      new DescribeLogGroupsCommand({ nextToken }),
    );

    for (const group of res.logGroups ?? []) {
      if (group.logGroupName) {
        names.push(group.logGroupName);
      }
    }

    nextToken = res.nextToken;
  } while (nextToken);

  return names;
}
