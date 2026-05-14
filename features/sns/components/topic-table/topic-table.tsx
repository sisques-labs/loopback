import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Topic } from "@/features/sns/types/sns";
import { TopicRowActions } from "@/features/sns/components/topic-row-actions/topic-row-actions";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";

type Props = {
  topics: Topic[];
  dict: AppDict["sns"]["topicTable"];
  rowActionsDict: AppDict["sns"]["topicRowActions"];
  confirmDict: AppDict["shared"]["confirmDialog"];
};

export function TopicTable({ topics, dict, rowActionsDict, confirmDict }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-0">{dict.name}</TableHead>
          <TableHead className="hidden sm:table-cell">{dict.displayName}</TableHead>
          <TableHead className="hidden md:table-cell">{dict.arn}</TableHead>
          <TableHead className="hidden sm:table-cell">{dict.type}</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {topics.map((topic) => (
          <TableRow key={topic.arn}>
            <TableCell className="min-w-0 max-w-[min(100%,12rem)] sm:max-w-none">
              <span className="block truncate font-medium sm:overflow-visible sm:whitespace-normal">
                {topic.name}
              </span>
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">
              {topic.displayName ?? "—"}
            </TableCell>
            <TableCell className="hidden truncate max-w-[20rem] text-muted-foreground md:table-cell">
              {topic.arn}
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">
              {topic.isFifo ? dict.typeFifo : dict.typeStandard}
            </TableCell>
            <TableCell>
              <TopicRowActions
                topicArn={topic.arn}
                topicName={topic.name}
                dict={rowActionsDict}
                confirmDict={confirmDict}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
