import { DEFAULT_LOCALE, isLocale, type Locale } from "@/features/shared/i18n/locale";
import { getDictionary } from "@/features/shared/i18n/get-dictionary";
import { filterLogEvents } from "@/features/logs/services/filter-log-events/filter-log-events";
import { mapLogEntryToTimelineEvent } from "@/features/timeline/lib/event-mapper/event-mapper";
import { mapTimeRangeToStartTime } from "@/features/timeline/lib/time-range/time-range";
import { TimelineClient } from "@/features/timeline/components/timeline-client/timeline-client";
import type { TimelineEvent } from "@/features/timeline/lib/types/types";

/** Timeline reads live LocalStack data — prerender would fire AWS calls during `next build`. */
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
};

export default async function TimelinePage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const dict = getDictionary(locale);

  // Initial server-side fetch for fast first paint
  let initialEvents: TimelineEvent[] = [];
  try {
    const startTime = mapTimeRangeToStartTime("1h");
    const result = await filterLogEvents({ startTime });
    initialEvents = result.entries
      .map(mapLogEntryToTimelineEvent)
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    // LocalStack may not be running — client polling will handle it
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl font-semibold">{dict.timeline.title}</h1>
          <p className="text-sm text-muted-foreground">{dict.timeline.description}</p>
        </div>
      </div>

      <TimelineClient initialEvents={initialEvents} dict={dict.timeline} />
    </div>
  );
}
