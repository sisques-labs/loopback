import { Clock } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────

type TimelineEmptyDict = {
  empty: {
    title: string;
    body: string;
  };
};

type TimelineEmptyProps = {
  dict: TimelineEmptyDict;
};

// ── Component ──────────────────────────────────────────────────────────────────

export function TimelineEmpty({ dict }: TimelineEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Clock className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold">{dict.empty.title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{dict.empty.body}</p>
      </div>
    </div>
  );
}
