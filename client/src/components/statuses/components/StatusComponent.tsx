import React, { useEffect, useMemo, useRef, useState } from "react";
import { styles, theme } from "../../../assets/styles/styles";
import { ALL_STATUSES, fullName, Status } from "../../../assets/types/types";
import type { User } from "../../../assets/types/types";

const statusPhrase = (s: Status) => {
  switch (s) {
    case Status.Working:
      return "working";
    case Status.WorkingRemotely:
      return "working remotely";
    case Status.OnVacation:
      return "on vacation";
    case Status.BusinessTrip:
      return "on business trip";
    default:
      return String(s).toLowerCase();
  }
};

export const StatusesComponent: React.FC<{
  userName: string; // full name for greeting
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
  const header = `Hello, ${userName}. You are ${statusPhrase(meStatus)}`;

  // inline dropdown state/logic
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

  const arrow = (col: "name" | "status") => (sortBy === col ? (sortDir === "asc" ? "▲" : "▼") : "↕");

  const thClickable: React.CSSProperties = {
    ...styles.th,
    cursor: "pointer",
    userSelect: "none",
  };

  return (
    <div style={styles.dashboardWrap}>
      {/* Header with Logout (clock lives outside in Container) */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <h2 style={{ ...styles.title, marginBottom: 0 }}>{header}</h2>
        <div style={{ marginLeft: "auto" }} />
        <button
          onClick={onLogout}
          style={{
            borderRadius: 10,
            padding: "8px 14px",
            background: theme.yellow,
            color: theme.navy,
            border: `1px solid ${theme.yellow}`,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(242,195,53,0.35)",
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ marginBottom: 16, fontSize: 14 }}>Update my current status</div>
      <select style={styles.select} value={meStatus} onChange={(e) => setMeStatus(e.target.value as Status)}>
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <section style={{ marginTop: 32 }}>
        <h3 style={styles.sectionTitle}>Employees</h3>

        {/* Search (left) + Filter dropdown (right) */}
        <div style={styles.filtersRow}>
          {/* Left: search with icon */}
          <div style={styles.searchGroup}>
            <span style={styles.searchIcon} aria-hidden>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" />
              </svg>
            </span>
            <input
              style={styles.search}
              type="text"
              placeholder="Search by name.."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Right: dropdown only (no headline) */}
          <div ref={wrapRef} style={{ position: "relative", width: 260 }}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              style={{
                width: "100%", // fill the 260px wrapper
                border: "1px solid #D8E4F5",
                background: "#fff",
                color: statusFilters.length ? "#0B2537" : "#4B6172",
                borderRadius: 10,
                padding: "10px 12px", // match search padding
                cursor: "pointer",
                fontWeight: 400,
                textAlign: "left",
              }}
            >
              {statusFilters.length ? `Selected (${statusFilters.length})` : "Filter by status..."}
            </button>

            {open && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  right: 0,
                  zIndex: 50,
                  width: 260, // match wrapper/search width
                  background: "#fff",
                  border: "1px solid #D8E4F5",
                  borderRadius: 12,
                  boxShadow: "0 12px 30px rgba(14,107,216,0.10)",
                  padding: 10,
                }}
              >
                <input
                  className="status-filter-search"
                  autoFocus
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search statuses…"
                  style={{
                    display: "block",
                    width: "85%", // slightly inset inside 260px panel
                    margin: "6px auto",
                    background: "#fff",
                    border: "1px solid #D8E4F5",
                    borderRadius: 10,
                    color: "#0B2537",
                    padding: "8px 10px",
                    outline: "none",
                  }}
                />

                <div style={{ maxHeight: 200, overflowY: "auto", paddingRight: 4 }}>
                  {filteredStatuses.length === 0 && (
                    <div style={{ color: "#4B6172", fontSize: 13, padding: "6px 2px" }}>
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
                        color: "#0B2537",
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

                <div style={{ marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => {
                      statusFilters.forEach((s) => toggleFilter(s));
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      border: 0,
                      background: "#ef4444",
                      color: "white",
                      borderRadius: 10,
                      padding: "10px 12px",
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

        {/* Table (fixed-height viewport so page doesn’t shrink) */}
        <div style={styles.tableScroll}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={thClickable} onClick={() => onToggleSort("name")} title="Sort by name">
                  Name &nbsp;{arrow("name")}
                </th>
                <th style={thClickable} onClick={() => onToggleSort("status")} title="Sort by status">
                  Status &nbsp;{arrow("status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isVacation = u.status === Status.OnVacation;
                return (
                  <tr key={u.id} style={isVacation ? styles.vacationRow : undefined}>
                    <td style={styles.td}>{fullName(u)}</td>
                    <td style={{ ...styles.td, ...(isVacation ? styles.vacationCell : {}) }}>{u.status}</td>
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
