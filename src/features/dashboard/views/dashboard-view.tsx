import { MeetingsPerDayChart } from "../components/charts/meetings-per-day-chart";
import { SentimentTrendChart } from "../components/charts/sentiment-trend-chart";
import { OpenItemsByPriority } from "../components/open-items/open-items-by-priority";
import { RecentMeetings } from "../components/recent/recent-meetings";
import { WeekStatistics } from "../components/statistics/week-statistics";

/** This week in numbers, the trends of the last four weeks, then what needs attention. */
export function DashboardView() {
  return (
    <div className="flex flex-col gap-4 pb-8 sm:gap-5">
      <WeekStatistics />
      <section aria-labelledby="trends-heading" className="grid gap-4 sm:gap-5 lg:grid-cols-5">
        <h2 id="trends-heading" className="sr-only">
          Trends
        </h2>
        <MeetingsPerDayChart className="lg:col-span-3" />
        <SentimentTrendChart className="lg:col-span-2" />
      </section>
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-5">
        <div className="min-w-0 lg:col-span-3">
          <RecentMeetings />
        </div>
        <div className="min-w-0 lg:col-span-2">
          <OpenItemsByPriority />
        </div>
      </div>
    </div>
  );
}
