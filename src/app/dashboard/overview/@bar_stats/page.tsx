"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { getFlightStats } from "@/lib/flightStats";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Label } from "recharts";

const FILTERS = [
  { key: "last30d", label: "Last 30 days" },
  { key: "today", label: "Today" },
];

export default function BarStats() {
  const [barFilter, setBarFilter] = useState<"last30d" | "today">("last30d");
  const [barData, setBarData] = useState<any[]>([]);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // DEBUG: See the theme actually detected in the client
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("BarStats: detected theme:", resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    getFlightStats(barFilter).then(data => setBarData(data.delayBar));
  }, [barFilter]);

  const bg = isDark ? "#18181b" : "#fff";
  const tickColor = isDark ? "#e5e7eb" : "#555";
  const tooltipBg = isDark ? "#23272f" : "#fff";
  const tooltipFg = isDark ? "#fff" : "#000";

  return (
    <div className={`rounded-2xl shadow p-5 h-full ${isDark ? "bg-zinc-900" : "bg-white"}`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg">Delays by Route</h2>
        <select
          value={barFilter}
          onChange={e => setBarFilter(e.target.value as any)}
          className="border rounded px-2 py-1 text-xs"
        >
          {FILTERS.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={barData}
          margin={{ left: 32, right: 20, top: 20, bottom: 40 }}
          style={{ background: bg, borderRadius: 16 }}
        >
          <XAxis
            dataKey="route"
            angle={-24}
            textAnchor="end"
            interval={0}
            height={56}
            tick={{ fontSize: 12, fill: tickColor }}
          >
            <Label value="Route" position="insideBottom" offset={-32} fontSize={14} fill={tickColor} />
          </XAxis>
          <YAxis tick={{ fontSize: 12, fill: tickColor }}>
            <Label value="Delays" angle={-90} position="insideLeft" offset={0} fontSize={14} fill={tickColor} />
          </YAxis>
          <Tooltip
            contentStyle={{
              background: tooltipBg,
              color: tooltipFg,
              borderRadius: 12,
              fontSize: 13,
            }}
          />
          <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
