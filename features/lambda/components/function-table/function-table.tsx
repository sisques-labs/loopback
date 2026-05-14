import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { LambdaFunction } from "@/features/lambda/types/lambda";
import { FunctionRowActions } from "@/features/lambda/components/function-row-actions/function-row-actions";
import { encodeFunctionNameForRoute } from "@/features/lambda/lib/route-codec";
import { stateBadgeVariant, stateLabel } from "@/features/lambda/lib/state-badge";
import type { AppDict } from "@/features/shared/i18n/get-dictionary";
import type { Locale } from "@/features/shared/i18n/locale";

type Props = {
  functions: LambdaFunction[];
  dict: AppDict["lambda"]["table"];
  rowActionsDict: AppDict["lambda"]["rowActions"];
  invokeDialogDict: AppDict["lambda"]["invokeDialog"];
  localePrefix: string;
  locale: Locale;
};

export function FunctionTable({ functions, dict, rowActionsDict, invokeDialogDict, localePrefix, locale }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-0">{dict.functionName}</TableHead>
          <TableHead className="hidden sm:table-cell">{dict.runtime}</TableHead>
          <TableHead className="hidden sm:table-cell">{dict.handler}</TableHead>
          <TableHead className="hidden md:table-cell">{dict.description}</TableHead>
          <TableHead className="hidden md:table-cell">{dict.timeout}</TableHead>
          <TableHead className="hidden md:table-cell">{dict.memorySize}</TableHead>
          <TableHead className="hidden sm:table-cell">{dict.state}</TableHead>
          <TableHead className="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {functions.map((fn) => (
          <TableRow key={fn.functionArn}>
            <TableCell className="min-w-0 max-w-[min(100%,12rem)] sm:max-w-none">
              <Link
                href={`${localePrefix}/lambda/${encodeFunctionNameForRoute(fn.functionName)}`}
                className="block truncate font-mono font-medium hover:underline sm:overflow-visible sm:whitespace-normal"
              >
                {fn.functionName}
              </Link>
            </TableCell>
            <TableCell className="hidden font-mono text-sm text-muted-foreground sm:table-cell">
              {fn.runtime || "—"}
            </TableCell>
            <TableCell className="hidden font-mono text-sm text-muted-foreground sm:table-cell">
              {fn.handler || "—"}
            </TableCell>
            <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
              <span className="line-clamp-2 max-w-[16rem]">
                {fn.description
                  ? fn.description.length > 60
                    ? fn.description.slice(0, 60) + "…"
                    : fn.description
                  : "—"}
              </span>
            </TableCell>
            <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
              {fn.timeout > 0 ? fn.timeout : "—"}
            </TableCell>
            <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
              {fn.memorySize > 0 ? fn.memorySize : "—"}
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              {fn.state ? (
                <Badge variant={stateBadgeVariant(fn.state)}>
                  {stateLabel(fn.state, dict)}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              <FunctionRowActions
                functionName={fn.functionName}
                dict={rowActionsDict}
                invokeDialogDict={invokeDialogDict}
                localePrefix={localePrefix}
                locale={locale}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
