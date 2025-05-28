"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Card, CardContent
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, subDays } from "date-fns";
import { Pencil, Trash2, Check, X, Download } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const columns = [
  { header: "Date", accessor: "flight_date" },
  { header: "Flight No.", accessor: "flight_no" },
  { header: "Aircraft", accessor: "aircraft" },
  { header: "Capacity", accessor: "capacity" },
  { header: "Departure", accessor: "departure" },
  { header: "Arrival", accessor: "arrival" },
  { header: "STD", accessor: "std" },
  { header: "ATD", accessor: "atd" },
  { header: "Remark", accessor: "remark" },
  { header: "Delay Reason", accessor: "delay_reason" },
  { header: "Schedule Status", accessor: "schedule_status" },
  { header: "Premium", accessor: "premium" },
  { header: "Economy", accessor: "economy" },
  { header: "Infant", accessor: "infant" },
  { header: "Total Pax", accessor: "total_pax" },
];

function formatTime(val: string) {
  if (!val) return "";
  const [h, m] = val.split(":");
  return h && m ? `${h}:${m}` : val;
}

function EditableCell({
  value,
  onChange,
  rowId,
}: { value: string, onChange: (val: string) => void, rowId: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.innerText = value ?? "";
  }, [rowId]);
  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      className="block w-full outline-none bg-transparent"
      style={{
        minWidth: 0,
        width: "100%",
        font: "inherit",
        color: "inherit",
        background: "transparent",
        whiteSpace: "nowrap",
        overflowX: "auto",
        verticalAlign: "middle"
      }}
      onInput={e =>
        onChange((e.target as HTMLElement).innerText)
      }
      tabIndex={0}
    />
  );
}

export default function FlightsPage() {
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("today");
  const [customDate, setCustomDate] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<any>({});
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

  async function fetchFlights() {
    setLoading(true);
    let query = supabase
      .from("flights")
      .select("*")
      .order("flight_date", { ascending: false })
      .order("std", { ascending: true });
    if (dateFilter === "today") {
      query = query.eq("flight_date", today);
    } else if (dateFilter === "yesterday") {
      query = query.eq("flight_date", yesterday);
    } else if (dateFilter === "custom" && customDate) {
      query = query.eq("flight_date", customDate);
    }
    const { data } = await query;
    setFlights(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchFlights();
    // eslint-disable-next-line
  }, [dateFilter, customDate]);

  const handleExport = () => {
    const rows = flights.map(row => {
      const newRow: Record<string, any> = {};
      columns.forEach(col => {
        let val = row[col.accessor];
        if (col.accessor === "std" || col.accessor === "atd") val = formatTime(val);
        newRow[col.header?.toString().replace(/<br\s*\/?>/gi, " ")] = val ?? "";
      });
      return newRow;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Flights");
    XLSX.writeFile(wb, "flights.xlsx");
    toast.success("Exported to Excel!");
  };

  const handleEdit = (row: any, idx: number) => {
    setEditIdx(idx);
    setEditRow({ ...row });
  };
  const handleEditChange = (field: string, value: any) => {
    setEditRow((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleEditSave = async (uuid: string) => {
    const { departure, arrival, ...rest } = editRow;
    const rowToUpdate = {
      ...rest,
      departure,
      arrival,
      route: `${departure}-${arrival}`
    };
    const { error } = await supabase.from("flights").update(rowToUpdate).eq("uuid", uuid);
    if (!error) {
      toast.success("Flight updated successfully!");
      setFlights((prev: any[]) =>
        prev.map((row) =>
          row.uuid === uuid ? { ...row, ...rowToUpdate } : row
        )
      );
      setEditIdx(null);
      setEditRow({});
    } else {
      console.error(error);
      toast.error("Failed to update flight");
    }
  };
  const handleEditCancel = () => {
    setEditIdx(null);
    setEditRow({});
  };
  const handleDelete = async (uuid: string) => {
    if (!confirm("Are you sure you want to delete this flight?")) return;
    const { error } = await supabase.from("flights").delete().eq("uuid", uuid);
    if (!error) {
      toast.success("Flight deleted successfully!");
      setFlights((prev: any[]) => prev.filter((row) => row.uuid !== uuid));
    } else {
      toast.error("Failed to delete flight");
    }
  };

  return (
    <Card className="flex-1 min-h-0 flex flex-col h-full"> {/* Fills parent, no vh */}
      <CardContent className="flex-1 min-h-0 flex flex-col">
        <div className="flex justify-start mb-2 flex-wrap items-center">
          <div className="flex gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="custom">Custom Date</SelectItem>
                <SelectItem value="all">All Dates</SelectItem>
              </SelectContent>
            </Select>
            {dateFilter === "custom" && (
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-[160px]"
              />
            )}
            <button
              onClick={handleExport}
              className="ml-2 flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
              type="button"
              title="Export to Excel"
            >
              <Download size={16} className="mr-1" />
              Export
            </button>
          </div>
        </div>
        {/* === Table wrapper: always fills rest of Card, no gap at bottom === */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto rounded-lg">
        <Table className="w-full min-w-max">
            <TableHeader>
              <TableRow>
                {columns.map((col) => (
                  <TableHead
                    key={col.accessor}
                    className="font-bold sticky top-0 bg-gray-100 dark:bg-gray-800 z-10 whitespace-nowrap"
                  >
                    {col.header}
                  </TableHead>
                ))}
                <TableHead className="font-bold sticky top-0 bg-gray-100 dark:bg-gray-800 z-10 whitespace-nowrap">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flights.map((row, idx) => {
                const isEditing = editIdx === idx;
                return (
                  <TableRow
                    key={row.uuid}
                    className={
                      isEditing
                        ? "bg-orange-50 hover:bg-orange-100 transition-colors"
                        : "even:bg-muted/20 hover:bg-muted/40 transition-colors"
                    }
                  >
                    {columns.map((col) =>
                      isEditing ? (
                        <TableCell key={`${col.accessor}-${row.uuid}`} className="font-normal">
                          <EditableCell
                            value={
                              col.accessor === "std" || col.accessor === "atd"
                                ? formatTime(editRow[col.accessor])
                                : editRow[col.accessor] ?? ""
                            }
                            onChange={(val) =>
                              handleEditChange(col.accessor as string, val)
                            }
                            rowId={row.uuid}
                          />
                        </TableCell>
                      ) : (
                        <TableCell key={`${col.accessor}-${row.uuid}`} className="font-normal">
                          {col.accessor === "std" || col.accessor === "atd"
                            ? formatTime(row[col.accessor])
                            : row[col.accessor]}
                        </TableCell>
                      )
                    )}
                    {isEditing ? (
                      <TableCell key={`actions-edit-${row.uuid}`}>
                        <button
                          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          onClick={() => handleEditSave(row.uuid)}
                          title="Save"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          className="ml-2 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          onClick={handleEditCancel}
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </TableCell>
                    ) : (
                      <TableCell key={`actions-view-${row.uuid}`}>
                        <button
                          className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          onClick={() => handleEdit(row, idx)}
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          className="ml-2 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          onClick={() => handleDelete(row.uuid)}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
