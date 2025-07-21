"use client";

import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const data = [
  {
    name: "Small Boxes",
    value: 35,
    fill: "#4F46E5",
  },
  {
    name: "Medium Boxes", 
    value: 30,
    fill: "#10B981",
  },
  {
    name: "Large Boxes",
    value: 20,
    fill: "#F59E0B",
  },
  {
    name: "Envelopes",
    value: 15,
    fill: "#EF4444",
  },
];

const chartConfig = {
  smallBoxes: {
    label: "Small Boxes",
    color: "#4F46E5",
  },
  mediumBoxes: {
    label: "Medium Boxes", 
    color: "#10B981",
  },
  largeBoxes: {
    label: "Large Boxes",
    color: "#F59E0B",
  },
  envelopes: {
    label: "Envelopes",
    color: "#EF4444",
  },
};

export function PackagingChart() {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart
          margin={{
            top: 5,
            right: 5,
            left: 5,
            bottom: 5,
          }}
        >
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="45%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{
              paddingTop: "10px",
              fontSize: "12px"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}