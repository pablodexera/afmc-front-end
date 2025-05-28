"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { getFlightStats } from "@/lib/flightStats";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = [
  "#38bdf8", "#fbbf24", "#f87171", "#a78bfa", "#34d399", "#e879f9", "#f87171"
];
const FILTERS = [
  { key: "last30d", label: "Last 30 days" },
  { key: "today", label: "Today" },
];

// Custom Tooltip renderer
function CustomTooltip({ active, payload, isDark }: any) {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  const { name, value, percent } = entry.payload;
  return (
    <div
      style={{
        background: isDark ? "#23272f" : "#fff",
        color: isDark ? "#fff" : "#000",
        borderRadius: 12,
        fontSize: 14,
        padding: "12px 18px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
        border: isDark ? "1px solid #2e323d" : "1px solid #eee",
        minWidth: 120
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{name}</div>
      <div>
        <span style={{ color: isDark ? "#94e2d5" : "#089981", fontWeight: 600 }}>{value}</span> delays
        <br />
        <span style={{ color: isDark ? "#fbbf24" : "#f59e42" }}>
          {percent !== undefined ? `(${Math.round(percent * 100)}%)` : ""}
        </span>
      </div>
    </div>
  );
}

export default function PieStats() {
  const [pieFilter, setPieFilter] = useState<"last30d" | "today">("last30d");
  const [pieData, setPieData] = useState<any[]>([]);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    getFlightStats(pieFilter).then(data => setPieData(data.delayPie));
  }, [pieFilter]);

  const bg = isDark ? "#18181b" : "#fff";
  const legendText = isDark ? "#e5e7eb" : "#000";

  return (
    <div className={`rounded-2xl shadow p-5 h-full ${isDark ? "bg-zinc-900" : "bg-white"}`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-lg">Delay Reasons</h2>
        <select
          value={pieFilter}
          onChange={e => setPieFilter(e.target.value as any)}
          className="border rounded px-2 py-1 text-xs"
        >
          {FILTERS.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart style={{ background: bg, borderRadius: 16 }}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {pieData.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={props => <CustomTooltip {...props} isDark={isDark} />}
          />
          <Legend
            wrapperStyle={{
              color: legendText,
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
