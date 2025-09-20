import React, { useEffect, useMemo, useState } from "react";
import { SEED_USERS } from "../../../assets/types/types";
import type { Status, User } from "../../../assets/types/types";

import { StatusesComponent } from "../components/StatusComponent";

type SortBy = "name" | "status";
type SortDir = "asc" | "desc";

// Inline toast hook (green success, red error, blue info)
type ToastType = "success" | "error" | "info";
function useToast(autoHideMs = 2200) {
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), autoHideMs);
    return () => clearTimeout(t);
  }, [toast, autoHideMs]);
  const show = (msg: string, type: ToastType) => setToast({ msg, type });
  const element = toast ? (
    <div
      role="alert"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
        background: toast.type === "success" ? "#16a34a" : toast.type === "error" ? "#ef4444" : "#2563eb",
        color: "white",
        padding: "10px 14px",
        borderRadius: 10,
        boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
        fontWeight: 600,
        maxWidth: 360,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span>{toast.msg}</span>
      <button
        onClick={() => setToast(null)}
        style={{
          marginLeft: 8,
          background: "rgba(255,255,255,0.2)",
          border: 0,
          color: "white",
          padding: "4px 8px",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        ×
      </button>
    </div>
  ) : null;
  return { show, element };
}

export const StatusesContainer: React.FC<{
  userName: string;
  onLogout: () => void;
}> = ({ userName, onLogout }) => {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [meStatus, setMeStatus] = useState<Status>("Working" as Status);
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<Status[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const { show, element: toast } = useToast();

  // Show green toast on mount (after successful login)
  useEffect(() => {
    show("you logged in succesfully", "success");
  }, []); // once

  // Centered clock (Asia/Jerusalem) outside the card
  const [clock, setClock] = useState<string>("");
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jerusalem",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date());
    setClock(fmt());
    const id = setInterval(() => setClock(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  const currentFull = userName.trim().toLowerCase();

  // Initialize my status from the logged-in user
  useEffect(() => {
    const u = users.find((x) => `${x.firstName} ${x.lastName}`.trim().toLowerCase() === currentFull);
    if (u) setMeStatus(u.status);
  }, [users, currentFull]);

  // Keep my status synced in the list
  useEffect(() => {
    setUsers((prev) =>
      prev.map((x) => {
        const full = `${x.firstName} ${x.lastName}`.trim().toLowerCase();
        return full === currentFull ? { ...x, status: meStatus } : x;
      })
    );
  }, [meStatus, currentFull]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    // 1) exclude the logged-in user
    let out = users.filter((u) => `${u.firstName} ${u.lastName}`.trim().toLowerCase() !== currentFull);

    // 2) search by name
    out = out.filter((u) => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      return !q || name.includes(q);
    });

    // 3) status filter (multi)
    if (statusFilters.length > 0) {
      out = out.filter((u) => statusFilters.includes(u.status));
    }

    // 4) sort
    out = [...out].sort((a, b) => {
      const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
      const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
      const cmp = sortBy === "name" ? aName.localeCompare(bName) : a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return out;
  }, [users, currentFull, search, statusFilters, sortBy, sortDir]);

  const toggleFilter = (s: Status) =>
    setStatusFilters((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const onToggleSort = (col: SortBy) => {
    if (col === sortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  return (
    <>
      {/* Centered clock at top of page, white/light-grey text, no border/bg */}
      <div
         style={{
    padding: "0 6px",           // tighter vertical padding (was larger)
    background: "transparent",
    color: "rgba(255,255,255,0.92)",
    fontWeight: 800,
    letterSpacing: 0.5,
    fontSize: 24,
    lineHeight: 1,
    textAlign: "center",
    fontVariantNumeric: "tabular-nums",
    fontFeatureSettings: '"tnum"',
    textShadow: "0 1px 2px rgba(0,0,0,0.25)",
    pointerEvents: "auto",
  }}
      >
        {clock}
      </div>

      <StatusesComponent
        userName={userName}
        meStatus={meStatus}
        setMeStatus={setMeStatus}
        search={search}
        setSearch={setSearch}
        statusFilters={statusFilters}
        toggleFilter={toggleFilter}
        users={filteredUsers}
        onLogout={onLogout}
        sortBy={sortBy}
        sortDir={sortDir}
        onToggleSort={onToggleSort}
      />
      {toast}
    </>
  );
};
