"use client";
import PageContainer from "@/components/layout/page-container";
import { useState, useEffect, useRef } from "react";
import { getFlightStats } from "@/lib/flightStats";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Printer } from "lucide-react";
import React from "react";

const FILTERS = [
  { key: "last30d", label: "Last 30 days" },
  { key: "today", label: "Today" },
];

// PATCH FUNCTION: temporarily swap oklch vars to rgb/hex
function patchOklchVarsForPrint() {
  const root = document.documentElement;
  const oklchVars = [
    "--background", "--foreground", "--card", "--card-foreground",
    "--popover", "--popover-foreground", "--primary", "--primary-foreground",
    "--secondary", "--secondary-foreground", "--muted", "--muted-foreground",
    "--accent", "--accent-foreground", "--destructive", "--border", "--input",
    "--ring", "--sidebar", "--sidebar-foreground", "--sidebar-primary",
    "--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5",
  ];
const originalValues: { [key: string]: string } = {};
  oklchVars.forEach((v) => { originalValues[v] = root.style.getPropertyValue(v); });
  root.style.setProperty("--background", "#fff");
  root.style.setProperty("--foreground", "#222");
  root.style.setProperty("--card", "#fff");
  root.style.setProperty("--card-foreground", "#222");
  root.style.setProperty("--popover", "#f9fafb");
  root.style.setProperty("--popover-foreground", "#222");
  root.style.setProperty("--primary", "#0052cc");
  root.style.setProperty("--primary-foreground", "#fff");
  root.style.setProperty("--secondary", "#eaeaea");
  root.style.setProperty("--secondary-foreground", "#222");
  root.style.setProperty("--muted", "#f3f4f6");
  root.style.setProperty("--muted-foreground", "#6b7280");
  root.style.setProperty("--accent", "#e0e7ff");
  root.style.setProperty("--accent-foreground", "#3730a3");
  root.style.setProperty("--destructive", "#ef4444");
  root.style.setProperty("--border", "#e5e7eb");
  root.style.setProperty("--input", "#e5e7eb");
  root.style.setProperty("--ring", "#a5b4fc");
  root.style.setProperty("--sidebar", "#fff");
  root.style.setProperty("--sidebar-foreground", "#222");
  root.style.setProperty("--sidebar-primary", "#0052cc");
  root.style.setProperty("--chart-1", "#3b82f6");
  root.style.setProperty("--chart-2", "#10b981");
  root.style.setProperty("--chart-3", "#f59e42");
  root.style.setProperty("--chart-4", "#f472b6");
  root.style.setProperty("--chart-5", "#fbbf24");
  return () => {
    oklchVars.forEach((v) => {
      if (originalValues[v]) root.style.setProperty(v, originalValues[v]);
      else root.style.removeProperty(v);
    });
  };
}

// Injects/removes dashboard-print.css from the <head> for print
function injectPrintCss() {
  const id = "dashboard-print-style";
  if (document.getElementById(id)) return () => {};
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "/dashboard-print.css";
  document.head.appendChild(link);
  return () => { if (link.parentNode) link.parentNode.removeChild(link); };
}

export default function DashboardLayout({
  bar_stats,
  pie_stats,
  area_stats,
}: {
  bar_stats: React.ReactNode;
  pie_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  const [topFilter, setTopFilter] = useState<"last30d" | "today">("last30d");
  const [stats, setStats] = useState<any>(null);
  const printInProgress = useRef(false);

  // Print handler with patch/unpatch logic and print CSS injection
  const handlePrint = () => {
    if (printInProgress.current) return;
    printInProgress.current = true;
    const unpatch = patchOklchVarsForPrint();
    const removePrintCss = injectPrintCss();
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        unpatch();
        removePrintCss && removePrintCss();
        printInProgress.current = false;
      }, 1000);
    }, 80);
  };

  useEffect(() => {
    getFlightStats(topFilter).then(setStats);
  }, [topFilter]);

  // ---- Render ----
  return (
    <PageContainer>
      <div className="flex flex-1 flex-col space-y-4" id="dashboard-content">
        {/* Header and filter + Export PDF */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Flight Operations Dashboard
          </h2>
          <div className="flex gap-2 items-center">
            <select
              className="border rounded px-2 py-1 text-xs bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={topFilter}
              onChange={e => setTopFilter(e.target.value as any)}
            >
              {FILTERS.map(f => (
                <option key={f.key} value={f.key}>{f.label}</option>
              ))}
            </select>
            <button
              onClick={handlePrint}
              className="flex items-center border px-2 py-1 rounded text-xs bg-background shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Export dashboard to PDF"
              type="button"
            >
              <Printer size={14} className="mr-1" /> Print / Export PDF
            </button>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4
            *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card 
            dark:*:data-[slot=card]:bg-card 
            *:data-[slot=card]:bg-gradient-to-t 
            *:data-[slot=card]:shadow-xs">
          <Card className="@container/card" data-slot="card">
            <CardHeader>
              <CardDescription>Total Flights</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {stats ? stats.totalFlights.toLocaleString() : "-"}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp />
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="flex gap-2 font-medium">
                Period: {FILTERS.find(f => f.key === topFilter)?.label}
              </div>
              <div className="text-muted-foreground">
                Flights scheduled
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card" data-slot="card">
            <CardHeader>
              <CardDescription>Total Pax</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {stats ? stats.totalPax.toLocaleString() : "-"}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp />
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="flex gap-2 font-medium">
                Passengers carried
              </div>
              <div className="text-muted-foreground">
                Sum of premium, economy, infant
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card" data-slot="card">
            <CardHeader>
              <CardDescription>Delays</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {stats ? stats.totalDelays.toLocaleString() : "-"}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingDown />
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="flex gap-2 font-medium">
                Flights with recorded delay
              </div>
              <div className="text-muted-foreground">
                Incident/Delay reported
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card" data-slot="card">
            <CardHeader>
              <CardDescription>On-Time %</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {stats ? `${stats.onTimePercent}%` : "-"}
              </CardTitle>
              <CardAction>
                <Badge variant="outline">
                  <IconTrendingUp />
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="flex gap-2 font-medium">
                On-time departures
              </div>
              <div className="text-muted-foreground">
                Departed at or before STD
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Charts grid row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            {bar_stats}
          </div>
          <div className="col-span-3">
            {pie_stats}
          </div>
        </div>
        {/* Area chart row */}
        <div className="col-span-4">
          {area_stats}
        </div>
      </div>
    </PageContainer>
  );
}
