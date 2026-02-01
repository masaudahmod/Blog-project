"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

export const description = "Posts, comments, and likes by period";

export type StatsPoint = {
  date: string;
  posts: number;
  comments: number;
  likes: number;
};

const chartConfig = {
  date: {
    label: "Date",
  },
  posts: {
    label: "Posts",
    color: "hsl(var(--chart-1))",
  },
  comments: {
    label: "Comments",
    color: "hsl(var(--chart-2))",
  },
  likes: {
    label: "Likes",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const emptyData: StatsPoint[] = [];

interface ChartAreaInteractiveProps {
  /** Last 10 days (daily granularity) */
  dataDaily?: StatsPoint[];
  /** Last 4 months (monthly granularity) */
  dataMonthly?: StatsPoint[];
}

export function ChartAreaInteractive({
  dataDaily = emptyData,
  dataMonthly = emptyData,
}: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("10d");

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("10d");
    }
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    if (timeRange === "10d") {
      return dataDaily.length ? dataDaily : [];
    }
    if (timeRange === "1m") {
      return dataMonthly.length ? dataMonthly.slice(-1) : [];
    }
    if (timeRange === "4m") {
      return dataMonthly.length ? dataMonthly.slice(-4) : [];
    }
    return [];
  }, [timeRange, dataDaily, dataMonthly]);

  const isDaily = timeRange === "10d";

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Posts, Comments, Likes</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {timeRange === "10d" && "Last 10 days (by day)"}
            {timeRange === "1m" && "Last 1 month"}
            {timeRange === "4m" && "Last 4 months (by month)"}
          </span>
          <span className="@[540px]/card:hidden">By period</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={(v) => v && setTimeRange(v)}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="10d">10 days</ToggleGroupItem>
            <ToggleGroupItem value="1m">1 month</ToggleGroupItem>
            <ToggleGroupItem value="4m">4 months</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select period"
            >
              <SelectValue placeholder="10 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="10d" className="rounded-lg">
                10 days
              </SelectItem>
              <SelectItem value="1m" className="rounded-lg">
                1 month
              </SelectItem>
              <SelectItem value="4m" className="rounded-lg">
                4 months
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <div className="flex aspect-auto h-[250px] w-full items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            No data for this period
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillPosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-posts)" stopOpacity={1} />
                  <stop offset="95%" stopColor="var(--color-posts)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillComments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-comments)" stopOpacity={1} />
                  <stop offset="95%" stopColor="var(--color-comments)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-likes)" stopOpacity={1} />
                  <stop offset="95%" stopColor="var(--color-likes)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const d = new Date(value);
                  return isDaily
                    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: isDaily ? undefined : "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="posts"
                type="natural"
                fill="url(#fillPosts)"
                stroke="var(--color-posts)"
                stackId="a"
              />
              <Area
                dataKey="comments"
                type="natural"
                fill="url(#fillComments)"
                stroke="var(--color-comments)"
                stackId="a"
              />
              <Area
                dataKey="likes"
                type="natural"
                fill="url(#fillLikes)"
                stroke="var(--color-likes)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
