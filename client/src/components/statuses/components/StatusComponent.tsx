import React, { useEffect, useMemo, useRef, useState } from "react";
import { styles, theme } from "../../../assets/styles/styles";
import { ALL_STATUSES, fullName } from "../../../assets/types/types";
import type { Status, User } from "../../../assets/types/types";

export const StatusesComponent: React.FC<{
  userName: string;
  meStatus: Status;
  setMeStatus: (s: Status) => void;
  search: string;
  setSearch: (v: string) => void;
  statusFilters: Status[];
  toggleFilter: (s: Status) => void;
  users: User[];
  onLogout: () => void;
  // sorting
  sortBy: "name" | "status";
  sortDir: "asc" | "desc";
  onToggleSort: (col: "name" | "status") => void;
}> = ({
  userName,
  meStatus,
  setMeStatus,
  search,
  setSearch,
  statusFilters,
  toggleFilter,
  users,
  onLogout,
  sortBy,
  sortDir,
  onToggleSort,
}) => {
  const header = `Hello, ${userName}. You are on ${meStatus}`;

  // inline dropdown state/logic (no separate file)
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredStatuses = useMemo(
    () => ALL_STATUSES.filter((s) => s.toLowerCase().includes(q.trim().toLowerCase())),
    [q]
  );

  const arrow = (col: "name" | "status") =>
    sortBy === col ? (sortDir === "asc" ? "▲" : "▼") : "↕";

  const thClickable: React.CSSProperties = {
    ...styles.th,
    cursor: "pointer",
    userSelect: "none",
  };

  return (
    <div style={styles.dashboardWrap}>
      {/* Header with Logout */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <h2 style={{ ...styles.title, marginBottom: 0 }}>{header}</h2>
        <div style={{ marginLeft: "auto" }} />
        <button
          onClick={onLogout}
          style={{
            borderRadius: 10,
            padding: "8px 12px",
            background: "transparent",
            color: theme.yellow,
            border: `1px solid ${theme.yellow}`,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginBottom: 16, fontSize: 14 }}>Update my current status</div>
      <select
        style={styles.select}
        value={meStatus}
        onChange={(e) => setMeStatus(e.target.value as Status)}
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <section style={{ marginTop: 32 }}>
        <h3 style={styles.sectionTitle}>Employees</h3>

        {/* Search + Status filter dropdown */}
        <div style={styles.filtersRow}>
          <input
            style={styles.search}
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Dropdown button + panel */}
          <div ref={wrapRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              style={{
                border: "1px solid #374151",
                background: "#0a0f1a",
                color: "#e5e7eb",
                borderRadius: 10,
                padding: "10px 12px",
                cursor: "pointer",
                minWidth: 180,
              }}
            >
              Filter by status {statusFilters.length ? `(${statusFilters.length})` : ""}
            </button>

            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  left: 0,
                  zIndex: 50,
                  width: 280,
                  background: "#0b1220",
                  border: "1px solid #1f2937",
                  borderRadius: 12,
                  boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
                  padding: 10,
                }}
              >
                <input
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search statuses…"
                  style={{
                    width: "100%",
                    background: "#0a0f1a",
                    border: "1px solid #374151",
                    borderRadius: 10,
                    color: "#e5e7eb",
                    padding: "8px 10px",
                    marginBottom: 8,
                  }}
                />
                <div style={{ maxHeight: 220, overflowY: "auto", paddingRight: 4 }}>
                  {filteredStatuses.length === 0 && (
                    <div style={{ color: "#94a3b8", fontSize: 13, padding: "6px 2px" }}>
                      No statuses match.
                    </div>
                  )}
                  {filteredStatuses.map((s) => (
                    <label
                      key={s}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#e5e7eb",
                        fontSize: 14,
                        padding: "6px 4px",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={statusFilters.includes(s)}
                        onChange={() => toggleFilter(s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{
                      flex: 1,
                      border: "1px solid #374151",
                      background: "#0a0f1a",
                      color: "#e5e7eb",
                      borderRadius: 10,
                      padding: "8px 10px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      statusFilters.forEach((s) => toggleFilter(s));
                    }}
                    style={{
                      border: 0,
                      background: "#ef4444",
                      color: "white",
                      borderRadius: 10,
                      padding: "8px 10px",
                      cursor: "pointer",
                      fontWeight: 700,
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th
                  style={thClickable}
                  onClick={() => onToggleSort("name")}
                  title="Sort by name"
                >
                  Name &nbsp;{arrow("name")}
                </th>
                <th
                  style={thClickable}
                  onClick={() => onToggleSort("status")}
                  title="Sort by status"
                >
                  Status &nbsp;{arrow("status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isVacation = u.status === "On Vacation";
                return (
                  <tr key={u.id} style={isVacation ? styles.vacationRow : undefined}>
                    <td style={styles.td}>{fullName(u)}</td>
                    <td style={{ ...styles.td, ...(isVacation ? styles.vacationCell : {}) }}>
                      {u.status}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td style={styles.td} colSpan={2}>
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
