import React, { useEffect, useMemo, useRef, useState } from "react";
import { styles, theme } from "../../../assets/styles/styles";

/** ---------- DB <-> UI status mapping (authoritative) ---------- */
export const DB_STATUSES = ["working", "working_remotely", "on_vacation", "business_trip"] as const;
export type DbStatus = (typeof DB_STATUSES)[number];

const UI_BY_DB: Record<DbStatus, string> = {
  working: "Working",
  working_remotely: "Working Remotely",
  on_vacation: "On Vacation",
  business_trip: "Business Trip",
};
const dbByUi = (label: string): DbStatus => {
  const normalized = label.trim().toLowerCase().replace(/\s+/g, "_");
  switch (normalized) {
    case "working":
      return "working";
    case "working_remotely":
      return "working_remotely";
    case "on_vacation":
      return "on_vacation";
    case "business_trip":
      return "business_trip";
    default:
      return "working";
  }
};
export const dbToUi = (s: string | null | undefined): string =>
  UI_BY_DB[(s as DbStatus) ?? "working"] ?? "Working";

/** “On Vacation” row background */
const VACATION_ROW_BG = "#797a7cff";

/** ---------- Local shapes consumed by the component ---------- */
export type UserRow = {
  id: number;
  firstName: string;
  lastName: string;
  status: DbStatus | null; // comes from backend (snake_case) or null
};

export const StatusesComponent: React.FC<{
  userName: string;
  meStatusDb: DbStatus;                 // my current status (db value)
  onChangeMyStatus: (nextDb: DbStatus) => void;
  search: string;
  setSearch: (v: string) => void;
  statusFiltersDb: DbStatus[];          // active filters (db values)
  toggleFilterDb: (db: DbStatus) => void;
  users: UserRow[];                     // includes everyone (you’ll render “others” by excluding me in container)
  onLogout: () => void;
  sortBy: "name" | "status";
  sortDir: "asc" | "desc";
  onToggleSort: (col: "name" | "status") => void;
}> = ({
  userName,
  meStatusDb,
  onChangeMyStatus,
  search,
  setSearch,
  statusFiltersDb,
  toggleFilterDb,
  users,
  onLogout,
  sortBy,
  sortDir,
  onToggleSort,
}) => {
  const header = `Hello, ${userName}. You are ${dbToUi(meStatusDb).toLowerCase()}.`;

  // filter dropdown
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

  const FILTER_LABELS = useMemo(() => DB_STATUSES.map((s) => UI_BY_DB[s]), []);
  const filteredFilterLabels = useMemo(
    () => FILTER_LABELS.filter((s) => s.toLowerCase().includes(q.trim().toLowerCase())),
    [FILTER_LABELS, q]
  );

  const arrow = (col: "name" | "status") =>
    sortBy === col ? (sortDir === "asc" ? "▲" : "▼") : "↕";

  const thClickable: React.CSSProperties = {
    ...styles.th,
    cursor: "pointer",
    userSelect: "none",
  };

  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        width: "100%",
        minHeight: "calc(100dvh - 120px)",
        padding: 16,
      }}
    >
      <div
        style={{
          ...styles.dashboardWrap,
          background:
            "linear-gradient(180deg, rgba(216,228,245,0.24) 0%, rgba(216,228,245,0.08) 100%)",
          borderRadius: 16,
          padding: 16,
          width: "100%",
          maxWidth: 980,
        }}
      >
        {/* Header + Logout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <h2
            style={{
              ...styles.title,
              marginBottom: 0,
              textAlign: "left",
              flex: "1 1 auto",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              boxShadow: `inset 0 -0.35em 0 ${theme.yellow}33`,
            }}
            title={header}
          >
            {header}
          </h2>

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
              flex: "0 0 auto",
              whiteSpace: "nowrap",
            }}
          >
            Logout
          </button>
        </div>

        {/* My status updater */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            margin: "8px 0 16px",
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: theme.textSecondary,
              whiteSpace: "nowrap",
            }}
          >
            Update my current status
          </div>

          <select
            style={{ ...styles.select, minWidth: 220 }}
            value={meStatusDb}
            onChange={(e) => onChangeMyStatus(e.target.value as DbStatus)}
          >
            {DB_STATUSES.map((db) => (
              <option key={db} value={db}>
                {UI_BY_DB[db]}
              </option>
            ))}
          </select>
        </div>

        <section style={{ marginTop: 16 }}>
          <h3 style={styles.sectionTitle}>Employees</h3>

          {/* Search + Filter */}
          <div style={styles.filtersRow}>
            {/* Search */}
            <div style={styles.searchGroup}>
              <span style={styles.searchIcon} aria-hidden>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14Z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name.."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: 260,
                  background: "#fff",
                  border: "1px solid #D8E4F5",
                  borderRadius: 10,
                  color: "#0B2537",
                  padding: "10px 12px",
                }}
              />
            </div>

            {/* Filter */}
            <div ref={wrapRef} style={{ position: "relative", width: 260 }}>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="listbox"
                style={{
                  width: "100%",
                  background: "#fff",
                  border: "1px solid #D8E4F5",
                  borderRadius: 10,
                  color: statusFiltersDb.length ? "#0B2537" : "#4B6172",
                  padding: "10px 12px",
                  cursor: "pointer",
                  fontWeight: 400,
                  textAlign: "left",
                }}
              >
                {statusFiltersDb.length === DB_STATUSES.length
                  ? "All statuses"
                  : `Selected (${statusFiltersDb.length})`}
              </button>

              {open && (
                <div
                  style={{
                    position: "absolute",
                    top: "110%",
                    right: 0,
                    zIndex: 50,
                    width: 260,
                    background: "#fff",
                    border: "1px solid #D8E4F5",
                    borderRadius: 12,
                    boxShadow: "0 12px 30px rgba(14,107,216,0.10)",
                    padding: 10,
                  }}
                >
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `.status-filter-search::placeholder{ color:#9CA3AF; opacity:1 }`,
                    }}
                  />
                  <input
                    className="status-filter-search"
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search statuses…"
                    style={{
                      display: "block",
                      width: "85%",
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
                    {/* “All” toggle */}
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        color: "#0B2537",
                        fontSize: 14,
                        padding: "6px 4px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={statusFiltersDb.length === DB_STATUSES.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            DB_STATUSES.forEach((db) => {
                              if (!statusFiltersDb.includes(db)) toggleFilterDb(db);
                            });
                          } else {
                            [...statusFiltersDb].forEach((db) => toggleFilterDb(db));
                          }
                        }}
                      />
                      (All)
                    </label>

                    {/* Individual toggles */}
                    {filteredFilterLabels.map((label) => {
                      const db = dbByUi(label);
                      const checked = statusFiltersDb.includes(db);
                      return (
                        <label
                          key={label}
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
                          <input type="checkbox" checked={checked} onChange={() => toggleFilterDb(db)} />
                          {label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
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
                  const isVac = u.status === "on_vacation";
                  return (
                    <tr
                      key={u.id}
                      style={isVac ? { ...(styles.vacationRow ?? {}), background: VACATION_ROW_BG } : undefined}
                    >
                      <td style={{ ...styles.td, ...(isVac ? { background: VACATION_ROW_BG } : null) }}>
                        {u.firstName} {u.lastName}
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          ...(isVac ? { background: VACATION_ROW_BG, fontWeight: 700 } : null),
                        }}
                      >
                        {dbToUi(u.status)}
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
    </div>
  );
};
