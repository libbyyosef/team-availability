import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import type { Status, User } from "../../../assets/types/types";
import { ALL_STATUSES } from "../../../assets/types/types";
import { StatusesComponent } from "../components/StatusComponent";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const POLL_MS = 180_000; // 3 minutes

// ------ Minimal inline toast (unchanged) ------
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

// ------ Backend shapes ------
type BackendUserNameStatus = {
  id: number;
  first_name: string;
  last_name: string;
  status: string | null;
};
type BackendUsersList = { users: BackendUserNameStatus[] };
type BackendMyStatus = BackendUserNameStatus;

// ------ Helpers ------
const toStatus = (s: string | null | undefined): Status => {
  const norm = (s ?? "").toString();
  return (ALL_STATUSES as readonly string[]).includes(norm) ? (norm as Status) : ("Working" as Status);
};
const mapUser = (u: BackendUserNameStatus): User => ({
  id: u.id,
  firstName: u.first_name,
  lastName: u.last_name,
  email: "",
  password: "",
  status: toStatus(u.status),
});

type SortBy = "name" | "status";
type SortDir = "asc" | "desc";

export const StatusesContainer: React.FC<{
  userName: string;
  onLogout: () => void;
}> = ({ userName, onLogout }) => {
  const { show, element: toast } = useToast();
  const showRef = useRef(show);
  useEffect(() => {
    showRef.current = show;
  }, [show]);

  const [usersRaw, setUsersRaw] = useState<User[]>([]);
  const [meStatus, setMeStatus] = useState<Status>("Working" as Status);
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<Status[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // success toast after login
  useEffect(() => {
    showRef.current("you logged in succesfully", "success");
  }, []);

  // Clock
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

  // Fetch "me" status once (on mount). Could also be polled if desired.
  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      try {
        const meRes = await fetch(`${API_URL}/users/me/status`, {
          credentials: "include",
          signal: ctrl.signal,
        });
        if (!meRes.ok) {
          if (meRes.status === 401 || meRes.status === 403) {
            showRef.current("Session expired. Please log in again.", "error");
            onLogout();
            return;
          }
          showRef.current(`Failed to load your status (${meRes.status}).`, "error");
          return;
        }
        const meData: BackendMyStatus = await meRes.json();
        if (!cancelled) setMeStatus(toStatus(meData.status));
      } catch {
        if (!cancelled) showRef.current("Network error. Please try again.", "error");
      }
    })();

    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [onLogout]);

  // Function to fetch ALL users (stable)
  const fetchAllUsers = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`${API_URL}/users/list_users_with_statuses`, {
        credentials: "include",
        signal,
      });
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          showRef.current("Session expired. Please log in again.", "error");
          onLogout();
          return;
        }
        showRef.current(`Failed to load users (${res.status}).`, "error");
        return;
      }
      
      const data: BackendUsersList = await res.json();
      setUsersRaw(data.users.map(mapUser));
    } catch {
      showRef.current("Network error. Please try again.", "error");
    }
  }, [onLogout]);

  // Initial load + poll every 3 minutes
  useEffect(() => {
    let cancelled = false;

    // immediate fetch
    const ctrl = new AbortController();
    fetchAllUsers(ctrl.signal);

    // interval polling
    const id = setInterval(() => {
      if (cancelled) return;
      const c = new AbortController();
      fetchAllUsers(c.signal);
      // optional: store controller to abort old polls if needed
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
      ctrl.abort();
    };
  }, [fetchAllUsers]);

  // Client-side filter/sort (exclude current user from table)
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    let out = usersRaw.filter((u) => `${u.firstName} ${u.lastName}`.trim().toLowerCase() !== currentFull);

    if (q) {
      out = out.filter((u) => (`${u.firstName} ${u.lastName}`).toLowerCase().includes(q));
    }

    if (statusFilters.length > 0) {
      out = out.filter((u) => statusFilters.includes(u.status));
    }

    out = [...out].sort((a, b) => {
      const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
      const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
      const cmp = sortBy === "name" ? aName.localeCompare(bName) : a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return out;
  }, [usersRaw, currentFull, search, statusFilters, sortBy, sortDir]);

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
      {/* Centered clock */}
      <div
        style={{
          padding: "0 6px",
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
