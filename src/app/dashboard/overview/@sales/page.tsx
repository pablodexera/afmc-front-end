"use client";
import { useEffect, useState } from "react";
import { getFlightStats } from "@/lib/flightStats";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function SalesStats() {
  const [paxPerDay, setPaxPerDay] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFlightStats()
      .then(stats => setPaxPerDay(stats.paxPerDay || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!paxPerDay.length) return <div>No PAX data.</div>;

  return (
    <div style={{ height: 250, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={paxPerDay}>
          <defs>
            <linearGradient id="colorPax" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" angle={-40} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke="#38bdf8" fill="url(#colorPax)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
