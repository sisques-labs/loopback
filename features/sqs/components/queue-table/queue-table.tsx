import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { QueueListItem } from "@/features/sqs/types/sqs";
import { encodeQueueUrlForRoute } from "@/features/sqs/lib/encode-queue-url-param";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  queues: QueueListItem[];
  dict: AppDict["sqs"]["queueTable"];
  localePrefix: string;
};

export function QueueTable({ queues, dict, localePrefix }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-0">{dict.name}</TableHead>
          <TableHead className="hidden md:table-cell">{dict.url}</TableHead>
          <TableHead className="hidden sm:table-cell">{dict.type}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {queues.map((q) => (
          <TableRow key={q.queueUrl}>
            <TableCell className="min-w-0 max-w-[min(100%,12rem)] sm:max-w-none">
              <Link
                href={`${localePrefix}/sqs/${encodeQueueUrlForRoute(q.queueUrl)}`}
                className="block truncate font-medium hover:underline sm:overflow-visible sm:whitespace-normal"
              >
                {q.name}
              </Link>
            </TableCell>
            <TableCell className="hidden truncate max-w-[24rem] text-muted-foreground md:table-cell">
              {q.queueUrl}
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">
              {q.isFifo ? dict.typeFifo : dict.typeStandard}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
