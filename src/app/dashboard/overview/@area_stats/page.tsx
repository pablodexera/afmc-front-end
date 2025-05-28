"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { getFlightStats } from "@/lib/flightStats";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

export default function AreaStats() {
  const [paxPerDay, setPaxPerDay] = useState<{ date: string; count: number }[]>([]);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("AreaStats: detected theme:", resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    getFlightStats("last30d").then(stats => setPaxPerDay(stats.paxPerDay || []));
  }, []);

  if (!paxPerDay.length)
    return <div className="p-4 text-muted-foreground">No passenger data for this period.</div>;

  const bg = isDark ? "#18181b" : "#fff";
  const tickColor = isDark ? "#e5e7eb" : "#555";
  const gridColor = isDark ? "#374151" : "#e5e7eb";
  const tooltipBg = isDark ? "#23272f" : "#fff";
  const tooltipFg = isDark ? "#fff" : "#000";

  return (
    <div className={`h-[340px] w-full rounded-2xl shadow-sm p-6 ${isDark ? "bg-zinc-900" : "bg-white"}`}>
      <h2 className="font-bold text-xl mb-3">Passengers per Day</h2>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart
          data={paxPerDay}
          margin={{ top: 10, right: 20, left: 16, bottom: 44 }}
          style={{ background: bg, borderRadius: "16px" }}
        >
          <defs>
            <linearGradient id="colorPax" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.7}/>
              <stop offset="90%" stopColor="#38bdf8" stopOpacity={0.08}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
          <XAxis
            dataKey="date"
            angle={-28}
            textAnchor="end"
            height={56}
            tick={{ fontSize: 13, fill: tickColor }}
            interval={0}
          >
            <Label value="Date" position="insideBottom" offset={-24} fontSize={15} fill={tickColor} />
          </XAxis>
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 13, fill: tickColor }}
            width={60}
            label={{
              value: "Passengers",
              angle: -90,
              position: "insideLeft",
              offset: 8,
              fontSize: 15,
              fill: tickColor,
            }}
          />
          <Tooltip
            contentStyle={{
              background: tooltipBg,
              color: tooltipFg,
              borderRadius: 12,
              fontSize: 13,
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#38bdf8"
            fill="url(#colorPax)"
            strokeWidth={3}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
