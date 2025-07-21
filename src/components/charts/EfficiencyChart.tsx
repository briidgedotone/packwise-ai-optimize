"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  {
    month: "Jan",
    efficiency: 68,
    fillRate: 72,
  },
  {
    month: "Feb",
    efficiency: 70,
    fillRate: 75,
  },
  {
    month: "Mar",
    efficiency: 74,
    fillRate: 78,
  },
  {
    month: "Apr",
    efficiency: 72,
    fillRate: 76,
  },
  {
    month: "May",
    efficiency: 76,
    fillRate: 79,
  },
  {
    month: "Jun",
    efficiency: 79,
    fillRate: 81,
  },
  {
    month: "Jul",
    efficiency: 82,
    fillRate: 84,
  },
];

const chartConfig = {
  efficiency: {
    label: "Efficiency (%)",
    color: "#4F46E5",
  },
  fillRate: {
    label: "Fill Rate (%)",
    color: "#10B981",
  },
};

export function EfficiencyChart() {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
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
            domain={[60, 90]}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent />}
          />
          <Line
            type="monotone"
            dataKey="efficiency"
            stroke="#4F46E5"
            strokeWidth={3}
            dot={{ fill: "#4F46E5", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="fillRate"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}