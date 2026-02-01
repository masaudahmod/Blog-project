import Link from "next/link";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import { getDailyStatsHistory, getMonthlyStatsHistory } from "@/lib/action";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default async function Page() {
  const [dailyHistory, monthlyHistory] = await Promise.all([
    getDailyStatsHistory(10),
    getMonthlyStatsHistory(4),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive dataDaily={dailyHistory} dataMonthly={monthlyHistory} />
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Comments</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/console/comments" className="gap-2">
                <MessageSquare className="size-4" />
                Manage comments
              </Link>
            </Button>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            View, approve, edit, or delete comments from your blog posts.
          </p>
        </div>
      </div>
    </div>
  );
}
