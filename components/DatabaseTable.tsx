"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import type { Dispatch, SetStateAction } from "react";

type Row = {
  id: string;
  name: string;
  favorite?: boolean;
  icon?: string;
  comments?: { text: string; ts: number }[];
  fields?: Record<string, string | number | boolean | string[]>;
};

type Props = {
  rows: Row[];
  setRows: Dispatch<SetStateAction<Row[]>>;
  query: string;
  sort: "asc" | "desc" | null;
  filterText: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatRelativeTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function formatDateDisplay(value?: string) {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

const EMOJIS = [
  "\u{1F600}",
  "\u{1F604}",
  "\u{1F60A}",
  "\u{1F609}",
  "\u{1F60D}",
  "\u{1F60E}",
  "\u{1F929}",
  "\u{1F973}",
  "\u{1F607}",
  "\u{1F914}",
  "\u{1F634}",
  "\u{1F62D}",
  "\u{1F621}",
  "\u{1F44D}",
  "\u{1F44F}",
  "\u{1F525}",
  "\u{2728}",
  "\u{2705}",
  "\u{1F4CC}",
  "\u{1F4A1}",
  "\u{1F4CE}",
  "\u{1F9E0}",
  "\u{1F4DD}",
  "\u{1F680}",
];

function Checkbox({
  checked,
  indeterminate,
  onClick,
  visibleClass,
  ariaLabel,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onClick: () => void;
  visibleClass: string;
  ariaLabel: string;
}) {
  const isOn = checked || indeterminate;
  return (
    <button
      onClick={onClick}
      className={`h-4 w-4 rounded-[3px] border flex items-center justify-center transition-opacity ${visibleClass} ${
        isOn ? "bg-[#2b6de8] border-[#2b6de8] text-white" : "bg-transparent border-[#3a3a3a]"
      }`}
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={ariaLabel}
    >
      {checked && (
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 12l4 4L19 6" />
        </svg>
      )}
      {indeterminate && !checked && (
        <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 12h14" />
        </svg>
      )}
    </button>
  );
}

function PropertyIcon({ type }: { type: string }) {
  switch (type) {
    case "text":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      );
    case "number":
      return <span className="text-sm font-semibold">#</span>;
    case "select":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="8" />
          <path d="M8 12h8" />
        </svg>
      );
    case "multi":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      );
    case "status":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="12" r="7" />
          <path d="M12 9v3l2 2" />
        </svg>
      );
    case "date":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
      );
    case "person":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="12" cy="8" r="3" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      );
    case "files":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="4" y="4" width="12" height="16" rx="2" />
          <path d="M16 8h4v12H8" />
        </svg>
      );
    case "checkbox":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M7 12l3 3 7-7" />
        </svg>
      );
    case "url":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M10 13a5 5 0 0 1 0-7l2-2a5 5 0 0 1 7 7l-1 1" />
          <path d="M14 11a5 5 0 0 1 0 7l-2 2a5 5 0 0 1-7-7l1-1" />
        </svg>
      );
    case "email":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case "phone":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M6 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2c-9 0-16-7-16-16a2 2 0 0 1 2-2z" />
        </svg>
      );
    case "relation":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M8 12h8" />
          <path d="M12 8l4 4-4 4" />
          <path d="M4 6h4M16 18h4" />
        </svg>
      );
    case "rollup":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M6 7h12M6 12h12M6 17h8" />
        </svg>
      );
    case "formula":
      return <span className="text-sm font-semibold">S</span>;
    case "button":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="4" y="7" width="16" height="10" rx="2" />
          <path d="M9 12h6" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      );
  }
}

export default function DatabaseTable({ rows, setRows, query, sort, filterText }: Props) {
  // Selection state keyed by row id for quick toggles.
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [propertyOpen, setPropertyOpen] = useState(false);
  const [propertyPickerOpen, setPropertyPickerOpen] = useState(false);
  const [propertyInput, setPropertyInput] = useState("");
  // Dynamic properties/columns added by the user.
  const [extraProperties, setExtraProperties] = useState<
    { id: string; name: string; type: string }[]
  >([]);
  const [datePicker, setDatePicker] = useState<{ rowId: string; propId: string } | null>(null);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentVisible, setCommentVisible] = useState(false);
  const [commentText, setCommentText] = useState("");
  // Context menu state for per-comment actions.
  const [commentMenu, setCommentMenu] = useState<{ rowId: string; index: number } | null>(null);
  const [commentMenuTop, setCommentMenuTop] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<{ rowId: string; index: number } | null>(null);
  const [propertyName, setPropertyName] = useState("Name");
  const [columnMenuId, setColumnMenuId] = useState<string | null>(null);
  // Drag-and-drop state for row reordering.
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  // Derived selection data for bulk actions and UI state.
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]
  );
  const selectedCount = selectedIds.length;
  const allSelected = rows.length > 0 && selectedCount === rows.length;
  const isIndeterminate = selectedCount > 0 && selectedCount < rows.length;
  const selectedRows = useMemo(() => rows.filter((r) => selected[r.id]), [rows, selected]);
  const allFavorited = selectedRows.length > 0 && selectedRows.every((r) => r.favorite);
  const primarySelectedId = selectedIds[0];
  const primarySelectedRow = useMemo(
    () => rows.find((r) => r.id === primarySelectedId),
    [rows, primarySelectedId]
  );
  const commentPopoverRef = useRef<HTMLDivElement | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const selectionBarRef = useRef<HTMLDivElement | null>(null);
  const nameColumnWidth = 260;
  // Grid column sizes must stay in sync across header and rows.
  const gridTemplateColumns = useMemo(
    () =>
      [
        "44px",
        `${nameColumnWidth}px`,
        ...extraProperties.map(() => "200px"),
        "72px",
      ].join(" "),
    [extraProperties, nameColumnWidth]
  );
  const tableMinWidth = useMemo(
    () => 44 + nameColumnWidth + extraProperties.length * 200 + 72,
    [extraProperties.length, nameColumnWidth]
  );

  // Restore column setup from local storage on first load.
  useEffect(() => {
    if (selectedCount === 0) {
      setCommentOpen(false);
      setCommentVisible(false);
      setCommentText("");
    }
  }, [selectedCount]);

  // Persist column setup whenever it changes.
  useEffect(() => {
    setCommentText("");
    setEditingComment(null);
    setCommentMenu(null);
    setCommentMenuTop(null);
    if (primarySelectedRow?.comments?.length) {
      setCommentVisible(true);
    } else {
      setCommentVisible(false);
    }
  }, [primarySelectedId]);

  // Close comment UI when clicking outside of the popover.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("notion-table-columns");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        if (typeof parsed.propertyName === "string" && parsed.propertyName.trim()) {
          setPropertyName(parsed.propertyName);
        }
        if (Array.isArray(parsed.extraProperties)) {
          const sanitized = parsed.extraProperties
            .filter(
              (item: { id?: unknown; name?: unknown; type?: unknown }) =>
                item &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                typeof item.type === "string"
            )
            .map((item: { id: string; name: string; type: string }) => ({
              id: item.id,
              name: item.name,
              type: item.type,
            }));
          setExtraProperties(sanitized);
        }
      }
    } catch {
      // Ignore invalid storage payloads.
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      "notion-table-columns",
      JSON.stringify({ propertyName, extraProperties })
    );
  }, [propertyName, extraProperties]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!commentVisible && !commentOpen) return;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (commentPopoverRef.current?.contains(target)) return;
      if (target.closest('[data-comment-trigger="true"]')) return;
      setCommentOpen(false);
      setCommentVisible(false);
      setCommentMenu(null);
      setCommentMenuTop(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [commentVisible, commentOpen]);

  // Derive filtered and sorted rows from inputs.
  const filtered = useMemo(() => {
    let out = rows;

    const q = query.trim().toLowerCase();
    if (q) out = out.filter((r) => r.name.toLowerCase().includes(q));

    const f = filterText.trim().toLowerCase();
    if (f) out = out.filter((r) => r.name.toLowerCase().includes(f));

    if (sort === "asc") out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "desc") out = [...out].sort((a, b) => b.name.localeCompare(a.name));
    return out;
  }, [rows, query, filterText, sort]);

  // Anchor the selection bar above the table content.
  const selectionBarTop = selectedCount > 0 ? 0 : null;


  // Toggle selection state for a single row.
  function toggleRow(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
    setCommentOpen(false);
    setCommentVisible(false);
    setCommentText("");
    setEditingComment(null);
    setCommentMenu(null);
    setCommentMenuTop(null);
  }

  function startEdit(row: Row) {
    setEditingId(row.id);
    setDraft(row.name);
  }

  function commitEdit(id: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, name: draft } : r)));
    setEditingId(null);
  }

  function closeMenuPopovers() {
    setEmojiOpen(false);
    setPropertyOpen(false);
    setColumnMenuId(null);
  }

  // Add a column with a unique name, even if a duplicate exists.
  function addProperty(name: string, type: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    setExtraProperties((prev) => {
      let finalName = trimmed;
      const lower = (value: string) => value.toLowerCase();
      if (prev.some((p) => lower(p.name) === lower(finalName))) {
        let i = 1;
        while (prev.some((p) => lower(p.name) === lower(`${trimmed} ${i}`))) {
          i += 1;
        }
        finalName = `${trimmed} ${i}`;
      }
      return [...prev, { id: uid(), name: finalName, type }];
    });
    setPropertyInput("");
    setPropertyPickerOpen(false);
  }

  // Update a single cell value in a row.
  function setFieldValue(rowId: string, propId: string, value: string | number | boolean | string[]) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, fields: { ...(r.fields ?? {}), [propId]: value } }
          : r
      )
    );
  }

  // Remove a column and its stored values across rows.
  function deleteProperty(propId: string) {
    setExtraProperties((prev) => prev.filter((p) => p.id !== propId));
    setRows((prev) =>
      prev.map((r) => {
        if (!r.fields || !(propId in r.fields)) return r;
        const rest = { ...r.fields };
        delete rest[propId];
        return {
          ...r,
          fields: Object.keys(rest).length > 0 ? rest : undefined,
        };
      })
    );
    setDatePicker((prev) => (prev?.propId === propId ? null : prev));
    setColumnMenuId(null);
  }

  // Clone a column (and its values) into a new column next to it.
  function duplicateProperty(propId: string) {
    const sourceIndex = extraProperties.findIndex((p) => p.id === propId);
    if (sourceIndex === -1) return;
    const source = extraProperties[sourceIndex];
    const duplicateId = uid();
    let duplicateName = `${source.name} copy`;
    let i = 2;
    const usedNames = new Set(extraProperties.map((p) => p.name.toLowerCase()));
    while (usedNames.has(duplicateName.toLowerCase())) {
      duplicateName = `${source.name} copy ${i}`;
      i += 1;
    }

    const nextProperties = [...extraProperties];
    nextProperties.splice(sourceIndex + 1, 0, {
      ...source,
      id: duplicateId,
      name: duplicateName,
    });
    setExtraProperties(nextProperties);

    setRows((prev) =>
      prev.map((r) => {
        const sourceValue = r.fields?.[propId];
        if (sourceValue === undefined) return r;
        return {
          ...r,
          fields: {
            ...(r.fields ?? {}),
            [duplicateId]: Array.isArray(sourceValue) ? [...sourceValue] : sourceValue,
          },
        };
      })
    );
    setColumnMenuId(null);
  }

  // Reorder columns within the dynamic properties list.
  function moveProperty(propId: string, direction: "left" | "right") {
    const sourceIndex = extraProperties.findIndex((p) => p.id === propId);
    if (sourceIndex === -1) return;
    const targetIndex = direction === "left" ? sourceIndex - 1 : sourceIndex + 1;
    if (targetIndex < 0 || targetIndex >= extraProperties.length) return;

    const nextProperties = [...extraProperties];
    const [moved] = nextProperties.splice(sourceIndex, 1);
    nextProperties.splice(targetIndex, 0, moved);
    setExtraProperties(nextProperties);
    setColumnMenuId(null);
  }

  function toggleFavorites() {
    setRows((prev) =>
      prev.map((r) => (selected[r.id] ? { ...r, favorite: !allFavorited } : r))
    );
    setMenuOpen(false);
    closeMenuPopovers();
  }

  function setIconForSelected(icon: string) {
    setRows((prev) => prev.map((r) => (selected[r.id] ? { ...r, icon } : r)));
    setMenuOpen(false);
    closeMenuPopovers();
  }

  function openCommentPanel() {
    setCommentOpen((v) => !v);
    setCommentVisible(true);
    setMenuOpen(false);
    closeMenuPopovers();
    setCommentMenu(null);
    setCommentMenuTop(null);
  }

  function startEditComment(rowId: string, index: number, text: string) {
    setEditingComment({ rowId, index });
    setCommentText(text);
    setCommentOpen(true);
    setCommentVisible(true);
    setCommentMenu(null);
    setCommentMenuTop(null);
  }

  function deleteComment(rowId: string, index: number) {
    setRows((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? { ...r, comments: (r.comments ?? []).filter((_, i) => i !== index) }
          : r
      )
    );
    if (editingComment?.rowId === rowId && editingComment.index === index) {
      setEditingComment(null);
      setCommentText("");
    }
    setCommentMenu(null);
    setCommentMenuTop(null);
  }

  function copyCommentLink(rowId: string, index: number) {
    if (typeof window === "undefined") return;
    const url = `${window.location.href.split("#")[0]}#comment-${rowId}-${index}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCommentMenu(null);
    setCommentMenuTop(null);
  }

  function openCommentForRow(id: string) {
    setSelected({ [id]: true });
    setCommentOpen(true);
    setCommentVisible(true);
    setMenuOpen(false);
    closeMenuPopovers();
    setCommentMenu(null);
    setCommentMenuTop(null);
  }

  // Add a new comment or apply edits to an existing comment.
  function applyComment() {
    const text = commentText.trim();
    if (!text) {
      return;
    }
    if (editingComment) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingComment.rowId
            ? {
                ...r,
                comments: (r.comments ?? []).map((c, i) =>
                  i === editingComment.index ? { ...c, text } : c
                ),
              }
            : r
        )
      );
      setEditingComment(null);
    } else {
      setRows((prev) =>
        prev.map((r) =>
          selected[r.id]
            ? { ...r, comments: [...(r.comments ?? []), { text, ts: Date.now() }] }
            : r
        )
      );
    }
    setCommentText("");
    setCommentMenu(null);
    setCommentMenuTop(null);
    setMenuOpen(false);
    closeMenuPopovers();
    setCommentVisible(true);
  }

  function deleteSelected() {
    setRows((prev) => prev.filter((r) => !selected[r.id]));
    setSelected({});
    setMenuOpen(false);
    closeMenuPopovers();
    setCommentOpen(false);
    setCommentVisible(false);
    setCommentMenu(null);
  }

  function duplicateSelected() {
    setRows((prev) => {
      const next: Row[] = [];
      for (const r of prev) {
        next.push(r);
        if (selected[r.id]) {
          next.push({ ...r, id: uid() });
        }
      }
      return next;
    });
    setMenuOpen(false);
    closeMenuPopovers();
  }

  // Reorder rows by dragging a handle.
  function moveRow(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    setRows((prev) => {
      const from = prev.findIndex((r) => r.id === sourceId);
      const to = prev.findIndex((r) => r.id === targetId);
      if (from === -1 || to === -1 || from === to) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  return (
    <div className="bg-[#191919] relative" ref={tableRef}>
      {selectedCount > 0 && selectionBarTop !== null && (
        <div
          ref={selectionBarRef}
          className="absolute left-3 z-30 -translate-y-[calc(100%+6px)]"
          style={{ top: selectionBarTop }}
        >
          <div className="flex items-center rounded-md border border-[#2a2a2a] bg-[#202020] shadow-lg">
            <button
              onClick={() => {
                setSelected({});
                setMenuOpen(false);
                closeMenuPopovers();
                setCommentOpen(false);
              }}
              className="px-3 py-2 text-sm text-[#9ecbff] hover:bg-[#2b2b2b]"
              title="Deselect all"
            >
              {selectedCount} selected
            </button>

            <div className="h-8 w-px bg-[#2a2a2a]" />

            <button
              onClick={deleteSelected}
              className="h-8 w-10 flex items-center justify-center hover:bg-[#2b2b2b] text-[#e6e6e6]"
              title="Delete"
              aria-label="Delete"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 7h16" />
                <path d="M9 7V5h6v2" />
                <rect x="6" y="7" width="12" height="12" rx="2" />
              </svg>
            </button>

            <div className="h-8 w-px bg-[#2a2a2a]" />

            <div className="relative">
              <button
                onClick={() =>
                  setMenuOpen((v) => {
                    const next = !v;
                    if (!next) closeMenuPopovers();
                    return next;
                  })
                }
                className="h-8 w-10 flex items-center justify-center hover:bg-[#2b2b2b] text-[#e6e6e6]"
                title="More"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                ...
              </button>

              {menuOpen && (
                <div className="absolute left-0 mt-2 z-30 w-[300px] rounded-lg border border-[#2a2a2a] bg-[#242424] shadow-xl">
                  <div className="p-2">
                    <input
                      placeholder="Search actions..."
                      className="w-full h-8 px-2 rounded-md bg-[#1f1f1f] border border-[#3a3a3a] text-[#e6e6e6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2b6de8]"
                    />
                  </div>

                  <div className="px-3 pb-1 text-[11px] uppercase tracking-wide text-[#8a8a8a]">Page</div>

                  <div className="px-2 pb-2 space-y-0.5">
                    <button
                      onClick={toggleFavorites}
                      className="group flex w-full items-center gap-2 h-8 px-2 rounded text-sm text-[#e6e6e6] hover:bg-[#2b2b2b]"
                    >
                      <span
                        className={`inline-flex h-4 w-4 items-center justify-center ${
                          allFavorited ? "text-[#f5c451]" : "text-[#9b9b9b]"
                        }`}
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M12 3l2.6 5.6L21 9.2l-4.8 4.2 1.5 6.6L12 17l-5.7 3 1.5-6.6L3 9.2l6.4-.6L12 3z" />
                        </svg>
                      </span>
                      <span className="flex-1 text-left">
                        {allFavorited ? "Remove from Favorites" : "Add to Favorites"}
                      </span>
                    </button>

                    <div className="relative">
                      <button
                        onClick={() => {
                          setEmojiOpen((v) => !v);
                          setPropertyOpen(false);
                          setCommentOpen(false);
                        }}
                        className="group flex w-full items-center gap-2 h-8 px-2 rounded text-sm text-[#e6e6e6] hover:bg-[#2b2b2b]"
                      >
                        <span className="inline-flex h-4 w-4 items-center justify-center text-[#9b9b9b]">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M8.5 14.5c1 1 2.3 1.5 3.5 1.5s2.5-.5 3.5-1.5" />
                            <circle cx="9" cy="10" r="1" fill="currentColor" />
                            <circle cx="15" cy="10" r="1" fill="currentColor" />
                          </svg>
                        </span>
                        <span className="flex-1 text-left">Edit icon</span>
                      </button>

                      {emojiOpen && (
                        <div className="absolute left-full ml-2 top-0 z-40 w-[220px] rounded-md border border-[#2a2a2a] bg-[#242424] shadow-xl">
                          <div className="px-3 pt-2 text-xs text-[#9b9b9b]">Emoji</div>
                          <div className="grid grid-cols-6 gap-1 p-2">
                            {EMOJIS.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => setIconForSelected(emoji)}
                                className="h-8 w-8 rounded hover:bg-[#2b2b2b]"
                                title={emoji}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => {
                          setPropertyOpen((v) => !v);
                          setEmojiOpen(false);
                          setCommentOpen(false);
                        }}
                        className="group flex w-full items-center gap-2 h-8 px-2 rounded text-sm text-[#e6e6e6] hover:bg-[#2b2b2b]"
                      >
                        <span className="inline-flex h-4 w-4 items-center justify-center text-[#9b9b9b]">
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path d="M4 6h16M4 12h16M4 18h10" />
                          </svg>
                        </span>
                        <span className="flex-1 text-left">Edit property</span>
                        <span className="text-[#7a7a7a]">&gt;</span>
                      </button>

                      {propertyOpen && (
                        <div className="absolute left-full ml-2 top-0 z-40 w-[220px] rounded-md border border-[#2a2a2a] bg-[#242424] shadow-xl">
                          <div className="p-2">
                            <div className="mb-2 text-xs text-[#9b9b9b]">Property name</div>
                            <input
                              autoFocus
                              value={propertyName}
                              onChange={(e) => setPropertyName(e.target.value)}
                              className="w-full h-8 px-2 rounded-md bg-[#1f1f1f] border border-[#3a3a3a] text-[#e6e6e6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2b6de8]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="my-1 h-px bg-[#2a2a2a]" />

                  <div className="px-2 pb-2">
                    <button className="group flex w-full items-center gap-2 h-8 px-2 rounded text-sm text-[#e6e6e6] hover:bg-[#2b2b2b]">
                      <span className="inline-flex h-4 w-4 items-center justify-center text-[#9b9b9b]">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M7 17l10-10M7 7h10v10" />
                        </svg>
                      </span>
                      <span className="flex-1 text-left">Open in</span>
                      <span className="text-[#7a7a7a]">&gt;</span>
                    </button>

                    <button
                      onClick={openCommentPanel}
                      data-comment-trigger="true"
                      className="group flex w-full items-center gap-2 h-8 px-2 rounded text-sm text-[#e6e6e6] hover:bg-[#2b2b2b]"
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center text-[#9b9b9b]">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M4 5h16v10H8l-4 4V5z" />
                        </svg>
                      </span>
                      <span className="flex-1 text-left">Comment</span>
                      <span className="text-xs text-[#7a7a7a]">Ctrl+Shift+M</span>
                    </button>

                    <button className="group flex w-full items-center gap-2 h-8 px-2 rounded text-sm text-[#e6e6e6] hover:bg-[#2b2b2b]">
                      <span className="inline-flex h-4 w-4 items-center justify-center text-[#9b9b9b]">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M10 13a5 5 0 0 1 0-7l2-2a5 5 0 0 1 7 7l-1 1" />
                          <path d="M14 11a5 5 0 0 1 0 7l-2 2a5 5 0 0 1-7-7l1-1" />
                        </svg>
                      </span>
                      <span className="flex-1 text-left">Copy link</span>
                    </button>

                    <button
                      onClick={duplicateSelected}
                      className="group flex w-full items-center gap-2 h-8 px-2 rounded text-sm text-[#e6e6e6] hover:bg-[#2b2b2b]"
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center text-[#9b9b9b]">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <rect x="8" y="8" width="10" height="10" rx="2" />
                          <rect x="4" y="4" width="10" height="10" rx="2" />
                        </svg>
                      </span>
                      <span className="flex-1 text-left">Duplicate</span>
                      <span className="text-xs text-[#7a7a7a]">Ctrl+D</span>
                    </button>

                    <button className="group flex w-full items-center gap-2 h-8 px-2 rounded text-sm text-[#e6e6e6] hover:bg-[#2b2b2b]">
                      <span className="inline-flex h-4 w-4 items-center justify-center text-[#9b9b9b]">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M4 12h9" />
                          <path d="M10 7l5 5-5 5" />
                        </svg>
                      </span>
                      <span className="flex-1 text-left">Move to</span>
                      <span className="text-xs text-[#7a7a7a]">Ctrl+Shift+P</span>
                    </button>

                    <button
                      onClick={deleteSelected}
                      className="group flex w-full items-center gap-2 h-8 px-2 rounded text-sm text-[#ffb3b3] hover:bg-[#2b2b2b]"
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center text-[#ffb3b3]">
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M4 7h16" />
                          <path d="M9 7V5h6v2" />
                          <rect x="6" y="7" width="12" height="12" rx="2" />
                        </svg>
                      </span>
                      <span className="flex-1 text-left">Delete</span>
                      <span className="text-xs text-[#7a7a7a]">Del</span>
                    </button>
                  </div>

                  <div className="my-1 h-px bg-[#2a2a2a]" />

                  <div className="px-3 pb-3 text-xs text-[#7a7a7a]">
                    Last edited by Ahmad amro
                    <br />
                    Today at 9:30 AM
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

        <div className="w-full bg-[#191919]" style={{ minWidth: tableMinWidth }}>
        {/* header row */}
        <div
          ref={headerRef}
          className="grid w-full border-b border-[#2a2a2a] text-sm"
          style={{ gridTemplateColumns }}
        >
          <div className="h-10 flex items-center gap-1 pl-1.5">
            <span className="h-4 w-4" aria-hidden="true" />
            <Checkbox
              checked={allSelected}
              indeterminate={isIndeterminate}
              visibleClass="opacity-100"
              ariaLabel="Select all rows"
              onClick={() => {
                if (allSelected) {
                  setSelected({});
                } else {
                  const next: Record<string, boolean> = {};
                  rows.forEach((r) => (next[r.id] = true));
                  setSelected(next);
                }
              }}
            />
          </div>

          <div className="h-10 flex items-center gap-2 px-3 text-[#cfcfcf]">
            <span className="text-[#9b9b9b]">Aa</span>
            <span className="font-medium">{propertyName}</span>
          </div>
            {extraProperties.map((prop, index) => (
              <div
                key={prop.id}
                className="group/column h-10 flex items-center gap-2 px-1.5 text-[#cfcfcf] border-l border-[#242424]"
              >
              <span className="text-[#9b9b9b]">
                <PropertyIcon type={prop.type} />
              </span>
              <span className="font-medium truncate">{prop.name}</span>
              <Popover.Root
                open={columnMenuId === prop.id}
                onOpenChange={(open) => setColumnMenuId(open ? prop.id : null)}
              >
                <Popover.Trigger asChild>
                  <button
                    className={`ml-auto h-6 w-6 rounded text-[#9b9b9b] hover:bg-[#1f1f1f] hover:text-[#e6e6e6] ${
                      columnMenuId === prop.id ? "opacity-100" : "opacity-0 group-hover/column:opacity-100"
                    }`}
                    title="Column options"
                    aria-label="Column options"
                  >
                    ...
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    sideOffset={6}
                    align="end"
                    className="w-[190px] rounded-md border border-[#2a2a2a] bg-[#242424] p-1 shadow-xl"
                  >
                    <button
                      onClick={() => moveProperty(prop.id, "left")}
                      disabled={index === 0}
                      className={`w-full h-8 px-2 rounded text-left text-sm ${
                        index === 0
                          ? "text-[#6f6f6f] cursor-not-allowed"
                          : "text-[#e6e6e6] hover:bg-[#2b2b2b]"
                      }`}
                    >
                      Move left
                    </button>
                    <button
                      onClick={() => moveProperty(prop.id, "right")}
                      disabled={index === extraProperties.length - 1}
                      className={`w-full h-8 px-2 rounded text-left text-sm ${
                        index === extraProperties.length - 1
                          ? "text-[#6f6f6f] cursor-not-allowed"
                          : "text-[#e6e6e6] hover:bg-[#2b2b2b]"
                      }`}
                    >
                      Move right
                    </button>
                    <button
                      onClick={() => duplicateProperty(prop.id)}
                      className="w-full h-8 px-2 rounded text-left text-sm text-[#e6e6e6] hover:bg-[#2b2b2b]"
                    >
                      Duplicate column
                    </button>
                    <button
                      onClick={() => deleteProperty(prop.id)}
                      className="w-full h-8 px-2 rounded text-left text-sm text-[#ffb3b3] hover:bg-[#2b2b2b]"
                    >
                      Delete column
                    </button>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          ))}
            <div className="h-10 flex items-center justify-end gap-1 px-1.5 border-l border-[#242424]">
              <Popover.Root open={propertyPickerOpen} onOpenChange={setPropertyPickerOpen}>
                <Popover.Trigger asChild>
                  <button
                    className="h-7 w-7 rounded-md border border-[#2a2a2a] text-[#bdbdbd] hover:text-[#e6e6e6] hover:border-[#2b6de8] hover:bg-[#1f1f1f] transition-colors select-none"
                    aria-label="Add property"
                    title="Add property"
                  >
                    +
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content
                    sideOffset={8}
                    align="end"
                    className="w-[360px] rounded-lg border border-[#2a2a2a] bg-[#242424] shadow-xl p-2"
                  >
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[#1f1f1f] border border-[#2a2a2a]">
                  <span className="text-[#9b9b9b]">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="8" />
                      <path d="M8 12h8" />
                    </svg>
                  </span>
                  <input
                    value={propertyInput}
                    onChange={(e) => setPropertyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addProperty(propertyInput, "text");
                    }}
                    placeholder="Type property name..."
                    className="flex-1 bg-transparent text-sm text-[#e6e6e6] placeholder:text-[#7d7d7d] focus:outline-none"
                  />
                </div>

                <div className="mt-3 px-1 text-xs text-[#9b9b9b]">Suggested</div>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  {[
                    { label: "Description", type: "text" },
                    { label: "Created Date", type: "date" },
                    { label: "Status", type: "status" },
                    { label: "Assigned To", type: "person" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => addProperty(item.label, item.type)}
                      className="h-8 px-2 rounded-md flex items-center gap-2 text-sm text-[#e6e6e6] hover:bg-[#2b2b2b]"
                    >
                      <span className="text-[#9b9b9b]">
                        <PropertyIcon type={item.type} />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="my-2 h-px bg-[#2a2a2a]" />
                <div className="px-1 text-xs text-[#9b9b9b]">Select type</div>
                <div className="mt-1 grid grid-cols-2 gap-1 max-h-[260px] overflow-auto pr-1">
                  {[
                    { label: "Text", type: "text" },
                    { label: "Number", type: "number" },
                    { label: "Select", type: "select" },
                    { label: "Multi-select", type: "multi" },
                    { label: "Status", type: "status" },
                    { label: "Date", type: "date" },
                    { label: "Person", type: "person" },
                    { label: "Files & media", type: "files" },
                    { label: "Checkbox", type: "checkbox" },
                    { label: "URL", type: "url" },
                    { label: "Phone", type: "phone" },
                    { label: "Email", type: "email" },
                    { label: "Relation", type: "relation" },
                    { label: "Rollup", type: "rollup" },
                    { label: "Formula", type: "formula" },
                    { label: "Button", type: "button" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => addProperty(item.label, item.type)}
                      className="h-8 px-2 rounded-md flex items-center gap-2 text-sm text-[#e6e6e6] hover:bg-[#2b2b2b]"
                    >
                      <span className="text-[#9b9b9b]">
                        <PropertyIcon type={item.type} />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
            </div>
        </div>

        {/* body */}
        <div className="divide-y divide-[#242424]">
        {filtered.map((row) => {
          const isSelected = !!selected[row.id];
          const isEditing = editingId === row.id;
          const hasComments = (row.comments?.length ?? 0) > 0;

          return (
              <div
                key={row.id}
                ref={(el) => {
                  rowRefs.current[row.id] = el;
                }}
                onDragOver={(e) => {
                  if (!draggingId || draggingId === row.id) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  if (dragOverId !== row.id) {
                    setDragOverId(row.id);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sourceId = draggingId ?? e.dataTransfer.getData("text/plain");
                  if (!sourceId || sourceId === row.id) return;
                  moveRow(sourceId, row.id);
                  setDragOverId(null);
                }}
                className={`group grid w-full text-sm ${
                  isSelected
                    ? "bg-[#1b2430] shadow-[inset_0_1px_0_#2a3340,inset_0_-1px_0_#2a3340]"
                    : "bg-transparent"
                } ${dragOverId === row.id ? "outline outline-1 outline-[#2b6de8]" : ""} hover:bg-[#1f1f1f]`}
                style={{ gridTemplateColumns }}
              >
                {/* checkbox cell */}
                <div className="h-10 flex items-center gap-1 pl-1.5">
                  <button
                    className="h-4 w-4 rounded text-[#9b9b9b] hover:text-[#e6e6e6] hover:bg-[#1f1f1f] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                    title="Drag row"
                    aria-label="Drag row"
                    data-drag-handle="true"
                    draggable
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", row.id);
                      setDraggingId(row.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setDragOverId(null);
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                      <circle cx="8" cy="7" r="1.4" />
                      <circle cx="16" cy="7" r="1.4" />
                      <circle cx="8" cy="12" r="1.4" />
                      <circle cx="16" cy="12" r="1.4" />
                      <circle cx="8" cy="17" r="1.4" />
                      <circle cx="16" cy="17" r="1.4" />
                    </svg>
                  </button>
                  <Checkbox
                    checked={isSelected}
                    visibleClass={
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }
                    ariaLabel="Select row"
                    onClick={() => toggleRow(row.id)}
                  />

                </div>

                {/* name cell */}
                <div className="h-10 flex items-center px-3 relative">
                {!isEditing ? (
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => startEdit(row)}
                      className="flex-1 text-left text-[#e6e6e6] cursor-text hover:bg-[#222] px-1 -mx-1 rounded pr-12"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="shrink-0 h-6 w-6 rounded flex items-center justify-center text-[#9b9b9b]">
                          {row.icon ? (
                            <span className="text-[15px] leading-none">{row.icon}</span>
                          ) : (
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                              <rect x="5" y="4" width="14" height="16" rx="2" />
                              <path d="M8 8h8M8 12h8M8 16h6" />
                            </svg>
                          )}
                        </span>
                        <span className="min-w-0 truncate leading-5">{row.name || "Untitled"}</span>
                        {row.favorite && (
                          <span className="shrink-0 text-[#f5c451]">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                              <path d="M12 3l2.6 5.6L21 9.2l-4.8 4.2 1.5 6.6L12 17l-5.7 3 1.5-6.6L3 9.2l6.4-.6L12 3z" />
                            </svg>
                          </span>
                        )}
                      </span>
                    </button>
                    <span
                      className={`pointer-events-none absolute ${
                        hasComments ? "right-10" : "right-3"
                      } top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}
                    >
                      <span className="px-2 py-0.5 rounded-full border border-[#2a2a2a] bg-[#1f1f1f] text-[10px] tracking-wide text-[#bdbdbd]">
                        OPEN
                      </span>
                    </span>
                    {(row.comments?.length ?? 0) > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openCommentForRow(row.id);
                        }}
                        data-comment-trigger="true"
                        className="inline-flex items-center gap-1 text-[#9b9b9b] hover:text-[#cfcfcf]"
                        title="Show comments"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M4 5h16v10H8l-4 4V5z" />
                        </svg>
                        <span className="text-xs">{row.comments?.length}</span>
                      </button>
                    )}
                  </div>
                ) : (
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => commitEdit(row.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit(row.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="w-full h-8 px-2 rounded-md bg-[#1f1f1f] border border-[#3a3a3a] text-[#e6e6e6] focus:outline-none focus:ring-2 focus:ring-[#3a3a3a]"
                    />
                  )}

                  {row.id === primarySelectedId && isSelected && (commentVisible || commentOpen) && (
                    <div className="absolute left-0 top-full mt-2 w-[420px] z-30">
                      <div
                        ref={commentPopoverRef}
                        className="rounded-lg border border-[#2a2a2a] bg-[#242424] shadow-xl relative"
                      >
                        {hasComments && (
                          <div
                            className={`px-3 pt-3 pb-2 space-y-3 max-h-48 overflow-auto ${
                              commentOpen ? "border-b border-[#2a2a2a]" : ""
                            }`}
                          >
                            {row.comments?.map((c, i) => (
                              <div key={`${row.id}-c-${i}`} className="flex gap-3">
                                <div className="h-8 w-8 rounded-full bg-[#0f7b6c] text-white flex items-center justify-center text-xs">
                                  A
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between gap-2 text-sm text-[#e6e6e6]">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Ahmad amro</span>
                                      <span className="text-xs text-[#8a8a8a]">{formatRelativeTime(c.ts)}</span>
                                    </div>
                                    <div className="relative">
                                      <button
                                        onClick={(e) => {
                                          const container = commentPopoverRef.current;
                                          if (container) {
                                            const cRect = container.getBoundingClientRect();
                                            const bRect = e.currentTarget.getBoundingClientRect();
                                            setCommentMenuTop(bRect.bottom - cRect.top + 6);
                                          } else {
                                            setCommentMenuTop(null);
                                          }
                                          setCommentMenu((m) =>
                                            m && m.rowId === row.id && m.index === i
                                              ? null
                                              : { rowId: row.id, index: i }
                                          );
                                        }}
                                        className="h-7 w-7 rounded text-[#9b9b9b] hover:bg-[#2b2b2b]"
                                        title="More"
                                      >
                                        ...
                                      </button>
                                    </div>
                                  </div>
                                  <div className="mt-1 text-sm text-[#d6d6d6] whitespace-pre-wrap">
                                    {c.text}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {commentMenu &&
                          commentMenu.rowId === row.id &&
                          commentMenuTop !== null && (
                            <div
                              className="absolute right-3 z-40"
                              style={{ top: commentMenuTop }}
                            >
                              <div className="w-[210px] rounded-md border border-[#2a2a2a] bg-[#242424] shadow-xl">
                                <button
                                  onClick={() =>
                                    startEditComment(
                                      row.id,
                                      commentMenu.index,
                                      row.comments?.[commentMenu.index]?.text ?? ""
                                    )
                                  }
                                  className="w-full h-8 px-3 flex items-center gap-2 text-left text-sm text-[#e6e6e6] hover:bg-[#2b2b2b]"
                                >
                                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M4 20h4l10-10-4-4L4 16v4z" />
                                    <path d="M13 7l4 4" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  onClick={() => copyCommentLink(row.id, commentMenu.index)}
                                  className="w-full h-8 px-3 flex items-center gap-2 text-left text-sm text-[#e6e6e6] hover:bg-[#2b2b2b]"
                                >
                                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M10 13a5 5 0 0 1 0-7l2-2a5 5 0 0 1 7 7l-1 1" />
                                    <path d="M14 11a5 5 0 0 1 0 7l-2 2a5 5 0 0 1-7-7l1-1" />
                                  </svg>
                                  Copy link to discussion
                                </button>
                                <button
                                  onClick={() => deleteComment(row.id, commentMenu.index)}
                                  className="w-full h-8 px-3 flex items-center gap-2 text-left text-sm text-[#ffb3b3] hover:bg-[#2b2b2b]"
                                >
                                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M4 7h16" />
                                    <path d="M9 7V5h6v2" />
                                    <rect x="6" y="7" width="12" height="12" rx="2" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}

                        {commentOpen && (
                          <div className="px-3 py-2 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-[#0f7b6c] text-white flex items-center justify-center text-xs">
                              A
                            </div>
                            <div className="relative flex-1">
                              <input
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    applyComment();
                                  }
                                  if (e.key === "Escape") {
                                    setCommentOpen(false);
                                    setCommentText("");
                                  }
                                }}
                                placeholder="Add a comment..."
                                className="w-full h-9 pr-14 pl-3 rounded-md bg-[#242424] text-[#e6e6e6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2b6de8]"
                              />
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#9b9b9b]">
                                <button
                                  onClick={applyComment}
                                  className="h-7 w-7 rounded hover:bg-[#2b2b2b]"
                                  title="Send"
                                >
                                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M12 5l6 6-6 6" />
                                    <path d="M18 11H6" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>

                {extraProperties.map((prop) => {
                  const value = row.fields?.[prop.id];
                  const isDate = prop.type === "date";
                  const isDateOpen =
                    datePicker?.rowId === row.id && datePicker?.propId === prop.id;
                  return (
                    <div key={prop.id} className="h-10 flex items-center px-1.5">
                      {prop.type === "checkbox" ? (
                        <input
                          type="checkbox"
                          checked={Boolean(value)}
                          onChange={(e) => setFieldValue(row.id, prop.id, e.target.checked)}
                          className="h-4 w-4 accent-[#2b6de8]"
                        />
                      ) : isDate ? (
                        <Popover.Root
                          open={isDateOpen}
                          onOpenChange={(open) =>
                            setDatePicker(open ? { rowId: row.id, propId: prop.id } : null)
                          }
                        >
                          <Popover.Trigger asChild>
                            <button
                              className={`w-full h-8 px-1 rounded-md text-left text-sm hover:bg-[#1f1f1f] ${
                                value ? "text-[#e6e6e6]" : "text-[#6d6d6d]"
                              }`}
                            >
                              {value ? formatDateDisplay(String(value)) : ""}
                            </button>
                          </Popover.Trigger>
                          <Popover.Portal>
                            <Popover.Content
                              sideOffset={6}
                              align="start"
                              className="w-[240px] rounded-md border border-[#2a2a2a] bg-[#242424] p-2 shadow-xl"
                            >
                              <div className="text-xs text-[#9b9b9b] mb-2">Date</div>
                              <input
                                type="date"
                                value={value === undefined ? "" : String(value)}
                                onChange={(e) => setFieldValue(row.id, prop.id, e.target.value)}
                                className="w-full h-8 px-2 rounded-md bg-[#1f1f1f] text-[#e6e6e6] text-sm focus:outline-none focus:ring-2 focus:ring-[#2b6de8]"
                              />
                              <div className="mt-2 flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    setFieldValue(
                                      row.id,
                                      prop.id,
                                      new Date().toISOString().slice(0, 10)
                                    )
                                  }
                                  className="h-7 px-2 rounded-md bg-[#2b2b2b] text-xs text-[#e6e6e6] hover:bg-[#3a3a3a]"
                                >
                                  Today
                                </button>
                                <button
                                  onClick={() => setFieldValue(row.id, prop.id, "")}
                                  className="h-7 px-2 rounded-md text-xs text-[#9b9b9b] hover:bg-[#2b2b2b]"
                                >
                                  Clear
                                </button>
                              </div>
                            </Popover.Content>
                          </Popover.Portal>
                        </Popover.Root>
                      ) : (
                        <input
                          type={
                            prop.type === "number"
                              ? "number"
                              : prop.type === "email"
                              ? "email"
                              : prop.type === "phone"
                              ? "tel"
                              : prop.type === "url"
                              ? "url"
                              : "text"
                          }
                          value={value === undefined ? "" : String(value)}
                          onChange={(e) => setFieldValue(row.id, prop.id, e.target.value)}
                          className="w-full h-8 px-1 rounded-md bg-transparent text-[#e6e6e6] placeholder:text-[#6d6d6d] text-sm focus:bg-[#1f1f1f] focus:outline-none focus:ring-2 focus:ring-[#2b2b2b]"
                        />
                      )}
                    </div>
                  );
                })}

                {/* add property spacer */}
                <div className="h-10" />
              </div>
            );
          })}
        </div>

        {/* footer */}
        <button
          onClick={() => setRows((prev) => [{ id: uid(), name: "Untitled" }, ...prev])}
          className="w-full text-left h-10 pl-14 pr-4 text-sm text-[#9b9b9b] hover:bg-[#1f1f1f] hover:pl-16 transition-all"
        >
          <span className="mr-2">+</span> New page
        </button>
      </div>
    </div>
  );
}
