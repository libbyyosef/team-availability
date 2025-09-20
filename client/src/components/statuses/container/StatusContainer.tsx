import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Status, User } from "../../../assets/types/types";
import { ALL_STATUSES } from "../../../assets/types/types";
import { StatusesComponent } from "../components/StatusComponent";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const POLL_MS = 180_000;

// lightweight inline toast (keeps UI minimal; colors come from inline)
type ToastType = "success" | "error" | "info";
function useInlineToast(autoHideMs = 2200) {
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  useEffect(() => {
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
        background:
          toast.type === "success" ? "#16a34a" :
          toast.type === "error" ? "#ef4444" : "#2563eb",
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

// backend shapes
type BackendUserNameStatus = {
  id: number;
  first_name: string;
  last_name: string;
  status: string | null;
};
type BackendUsersList = { users: BackendUserNameStatus[] };
type BackendMyStatus = BackendUserNameStatus;

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
  currentUserId: number;
}> = ({ userName, onLogout, currentUserId }) => {
  const { show, element: toast } = useInlineToast();
  const showRef = useRef(show);
  useEffect(() => { showRef.current = show; }, [show]);

  const [usersRaw, setUsersRaw] = useState<User[]>([]);
  const [meStatus, setMeStatus] = useState<Status>("Working" as Status);
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<Status[]>(
    [...ALL_STATUSES] as Status[]
  );
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // greet
  useEffect(() => { showRef.current("You logged in successfully", "success"); }, []);

  // clock
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

  // my status
  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      try {
        const meRes = await fetch(`${API_URL}/users/get_user_status?user_id=${currentUserId}`, {
          credentials: "include",
          cache: "no-store",
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
  }, [onLogout, currentUserId]);

  // fetch all
  const fetchAllUsers = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const res = await fetch(`${API_URL}/users/list_users_with_statuses`, {
          credentials: "include",
          cache: "no-store",
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
    },
    [onLogout]
  );

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    fetchAllUsers(ctrl.signal);

    const id = setInterval(() => {
      if (cancelled) return;
      const c = new AbortController();
      fetchAllUsers(c.signal);
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
      ctrl.abort();
    };
  }, [fetchAllUsers]);

  // update my status
  const onChangeMyStatus = useCallback(
    async (next: Status) => {
      if (next === meStatus) return;
      const prev = meStatus;
      setMeStatus(next);

      try {
        const res = await fetch(`${API_URL}/user_statuses/update_user_status?user_id=${currentUserId}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });

        if (!res.ok) {
          setMeStatus(prev);
          let detail = "";
          try {
            const d = await res.json();
            detail = typeof d?.detail === "string" ? d.detail : "";
          } catch {}
          showRef.current(detail || `Failed to update status (${res.status}).`, "error");
          return;
        }

        setUsersRaw((prevUsers) =>
          prevUsers.map((u) => {
            const full = `${u.firstName} ${u.lastName}`.trim().toLowerCase();
            return full === currentFull ? { ...u, status: next } : u;
          })
        );
        showRef.current("Status updated", "success");
      } catch {
        setMeStatus(prev);
        showRef.current("Network error. Please try again.", "error");
      }
    },
    [meStatus, currentFull, currentUserId]
  );

  // filter/sort (exclude me)
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = usersRaw.filter((u) => `${u.firstName} ${u.lastName}`.trim().toLowerCase() !== currentFull);

    if (q) out = out.filter((u) => (`${u.firstName} ${u.lastName}`).toLowerCase().includes(q));
    if (statusFilters.length > 0) out = out.filter((u) => statusFilters.includes(u.status));

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
    if (col === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("asc"); }
  };

  return (
    <>
      {/* centered clock on top */}
      <div
        style={{
          padding: "0 6px",
          background: "transparent",
          color: "rgba(11,37,55,0.85)", // navy-ish to fit palette
          fontWeight: 800,
          letterSpacing: 0.5,
          fontSize: 24,
          lineHeight: 1,
          textAlign: "center",
          fontVariantNumeric: "tabular-nums",
          fontFeatureSettings: '"tnum"',
          textShadow: "0 1px 2px rgba(0,0,0,0.12)",
        }}
      >
        {clock}
      </div>

      <StatusesComponent
        userName={userName}
        meStatus={meStatus}
        onChangeMyStatus={onChangeMyStatus}
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
