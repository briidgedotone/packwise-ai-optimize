"use client";

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  {
    month: "Jan",
    beforeQuantiPack: 68,
    afterQuantiPack: 72,
  },
  {
    month: "Feb",
    beforeQuantiPack: 70,
    afterQuantiPack: 75,
  },
  {
    month: "Mar",
    beforeQuantiPack: 74,
    afterQuantiPack: 78,
  },
  {
    month: "Apr",
    beforeQuantiPack: 72,
    afterQuantiPack: 76,
  },
  {
    month: "May",
    beforeQuantiPack: 76,
    afterQuantiPack: 79,
  },
  {
    month: "Jun",
    beforeQuantiPack: 79,
    afterQuantiPack: 81,
  },
  {
    month: "Jul",
    beforeQuantiPack: 82,
    afterQuantiPack: 84,
  },
];

const chartConfig = {
  beforeQuantiPack: {
    label: "Before QuantiPackAI (%)",
    color: "#4F46E5",
  },
  afterQuantiPack: {
    label: "After QuantiPackAI (%)",
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
            dataKey="beforeQuantiPack"
            stroke="#4F46E5"
            strokeWidth={3}
            dot={{ fill: "#4F46E5", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="afterQuantiPack"
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