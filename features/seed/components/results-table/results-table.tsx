import type { ServiceResult } from "@/features/seed/types";

export type ResultsTableDict = {
  tableTitle: string;
  service: string;
  created: string;
  skipped: string;
  failed: string;
};

type Props = {
  results: ServiceResult[];
  dict: ResultsTableDict;
};

export function ResultsTable({ results, dict }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium">{dict.tableTitle}</h3>
      <div className="overflow-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium">{dict.service}</th>
              <th className="px-3 py-2 text-right font-medium">{dict.created}</th>
              <th className="px-3 py-2 text-right font-medium">{dict.skipped}</th>
              <th className="px-3 py-2 text-right font-medium text-destructive">
                {dict.failed}
              </th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr key={row.service} className="border-b last:border-0">
                <td className="px-3 py-2 font-mono uppercase text-xs">{row.service}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.created}</td>
                <td className="px-3 py-2 text-right tabular-nums">{row.skipped}</td>
                <td
                  className={`px-3 py-2 text-right tabular-nums ${
                    row.failed > 0 ? "text-destructive font-medium" : ""
                  }`}
                >
                  {row.failed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
