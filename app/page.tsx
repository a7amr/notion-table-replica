"use client";

import { useEffect, useState } from "react";
import Toolbar from "@/components/Toolbar";
import DatabaseTable from "@/components/DatabaseTable";

type Row = { id: string; name: string; favorite?: boolean; icon?: string; comments?: { text: string; ts: number }[]; fields?: Record<string, string | number | boolean | string[]> };

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Home() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"asc" | "desc" | null>(null);
  const [rows, setRows] = useState<Row[]>([
    { id: "r1", name: "First item" },
    { id: "r2", name: "Second item" },
    { id: "r3", name: "Third item" },
  ]);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("notion-table-rows");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRows(parsed);
      }
    } catch {
      // Ignore invalid storage payloads.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("notion-table-rows", JSON.stringify(rows));
  }, [rows]);

  return (
    <main className="min-h-screen min-w-full w-max bg-[#191919] text-[#e6e6e6]">
      <div className="w-full px-35 py-40">
        <h1 className="text-2xl font-semibold mb-6">/table</h1>

        <div className="rounded-md overflow-visible min-w-full w-max">
          <Toolbar
              onSearchChange={setQ}
              onNew={() => setRows((r) => [{ id: uid(), name: "Untitled" }, ...r])}
              sort={sort}
              setSort={setSort}
              filterText={filterText}
              setFilterText={setFilterText}
            />

          <DatabaseTable rows={rows} setRows={setRows} query={q} sort={sort} filterText={filterText} />

        </div>
      </div>
    </main>
  );
}
