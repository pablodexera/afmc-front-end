import { supabase } from "@/lib/supabaseClient";

export type Flight = {
  id: string;
  flight_date: string;
  flight_no: string;
  aircraft: string;
  capacity: number;
  departure: string;
  arrival: string;
  std: string;
  atd: string;
  remark: string;
  delay_reason: string;
  schedule_status: string;
  premium: number;
  economy: number;
  infant: number;
  total_pax: number;
  route: string;
};

// Returns { start: YYYY-MM-DD, end: YYYY-MM-DD }
export function getDateRange(mode: "today" | "last30d") {
  const now = new Date();
  let start: Date, end: Date;
  if (mode === "today") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(start);
  } else {
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start = new Date(end);
    start.setDate(end.getDate() - 29);
  }
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export async function getFlightsByDate(mode: "today" | "last30d") {
  const { start, end } = getDateRange(mode);
  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .gte("flight_date", start)
    .lte("flight_date", end);

  if (error) throw new Error(error.message);
  return data as Flight[];
}

export async function getFlightStats(mode: "today" | "last30d" = "last30d") {
  const flights = await getFlightsByDate(mode);

  // Aggregates for cards
  const totalFlights = flights.length;
  const totalPax = flights.reduce(
    (sum, f) => sum + Number(f.premium || 0) + Number(f.economy || 0) + Number(f.infant || 0),
    0
  );
  const delays = flights.filter(f => !!f.remark || !!f.delay_reason);
  const totalDelays = delays.length;
  const onTime = flights.filter(f => f.atd && f.std && f.atd <= f.std);
  const onTimePercent = totalFlights ? Math.round((onTime.length / totalFlights) * 100) : 0;

  // Bar chart: Delays per route
  const delaysByRoute: Record<string, number> = {};
  delays.forEach(f => {
    const route = f.route || `${f.departure}-${f.arrival}`;
    delaysByRoute[route] = (delaysByRoute[route] || 0) + 1;
  });
  const delayBar = Object.entries(delaysByRoute)
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count);

  // Area chart: Pax per day
  const paxByDate: Record<string, number> = {};
  flights.forEach(f => {
    paxByDate[f.flight_date] =
      (paxByDate[f.flight_date] || 0) +
      Number(f.premium || 0) +
      Number(f.economy || 0) +
      Number(f.infant || 0);
  });
  const paxPerDay = Object.entries(paxByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Pie chart: Delay reasons
  const reasonCounts: Record<string, number> = {};
  delays.forEach(f => {
    const reason = f.delay_reason?.trim() || "Other";
    reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
  });
  const delayPie = Object.entries(reasonCounts).map(([reason, count]) => ({
    name: reason,
    value: count
  }));

  return {
    totalFlights,
    totalPax,
    totalDelays,
    onTimePercent,
    delayBar,
    paxPerDay,
    delayPie
  };
}
