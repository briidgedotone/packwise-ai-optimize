"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  {
    month: "Jan",
    savings: 2400,
    orders: 1200,
  },
  {
    month: "Feb",
    savings: 2800,
    orders: 1350,
  },
  {
    month: "Mar",
    savings: 3100,
    orders: 1500,
  },
  {
    month: "Apr",
    savings: 2950,
    orders: 1400,
  },
  {
    month: "May",
    savings: 3300,
    orders: 1550,
  },
  {
    month: "Jun",
    savings: 3700,
    orders: 1750,
  },
  {
    month: "Jul",
    savings: 4200,
    orders: 1950,
  },
];

const chartConfig = {
  savings: {
    label: "Cost Reduction",
    color: "hsl(var(--chart-1))",
  },
  orders: {
    label: "Order Volume",
    color: "hsl(var(--chart-2))",
  },
};

export function MonthlyChart() {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar dataKey="savings" fill="#4F46E5" />
          <Bar dataKey="orders" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}