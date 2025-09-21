import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StatusesComponent, DB_STATUSES, dbToUi } from "../components/StatusComponent";
import type { DbStatus } from "../components/StatusComponent";
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const POLL_MS = 180_000 as const;

/** Backend payloads */
type BackendUser = {
  id: number;
  first_name: string;
  last_name: string;
  status: DbStatus | null; // snake_case or null
};
type BackendUsersList = { users: BackendUser[] };

/** Local user row (matches component) */
type UserRow = {
  id: number;
  firstName: string;
  lastName: string;
  status: DbStatus | null;
};

const mapUser = (u: BackendUser): UserRow => ({
  id: u.id,
  firstName: u.first_name,
  lastName: u.last_name,
  status: (u.status ?? "working") as DbStatus | null,
});

type SortBy = "name" | "status";
type SortDir = "asc" | "desc";

export const StatusesContainer: React.FC<{
  userName: string;
  onLogout: () => void;
  currentUserId: number;
}> = ({ userName, onLogout, currentUserId }) => {
  const [usersRaw, setUsersRaw] = useState<UserRow[]>([]);
  const [meStatusDb, setMeStatusDb] = useState<DbStatus>("working");
  const [search, setSearch] = useState("");
  const [statusFiltersDb, setStatusFiltersDb] = useState<DbStatus[]>([...DB_STATUSES]);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  /** Fetch all users and set my status from that list */
  const fetchAllUsers = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const res = await fetch(
          `${API_URL}/users/list_users_with_statuses?user_id=${currentUserId}`,
          { credentials: "include", cache: "no-store", signal }
        );

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            alert("Session expired. Please log in again.");
            onLogout();
            return;
          }
          alert(`Failed to load users (${res.status}).`);
          return;
        }

        const data: BackendUsersList = await res.json();
        const mapped = data.users.map(mapUser);
        setUsersRaw(mapped);

        const me = data.users.find((u) => u.id === currentUserId);
        if (me) setMeStatusDb((me.status ?? "working") as DbStatus);
      } catch {
        alert("Network error. Please try again.");
      }
    },
    [onLogout, currentUserId]
  );

  // initial + polling
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

  /** Update my status via exposed endpoint (query params only) */
  const onChangeMyStatus = useCallback(
    async (nextDb: DbStatus) => {
      if (nextDb === meStatusDb) return;

      const prev = meStatusDb;
      setMeStatusDb(nextDb);

      try {
        const res = await fetch(
          `${API_URL}/user_statuses/update_current_user_status?user_id=${currentUserId}&status=${encodeURIComponent(
            nextDb
          )}`,
          {
            method: "PUT",
            credentials: "include",
          }
        );

        if (!res.ok) {
          setMeStatusDb(prev);
          let detail = "";
          try {
            const d = await res.json();
            detail = typeof d?.detail === "string" ? d.detail : "";
          } catch {}
          alert(detail || `Failed to update status (${res.status}).`);
          return;
        }

        // reflect in table
        setUsersRaw((prevUsers) =>
          prevUsers.map((u) => (u.id === currentUserId ? { ...u, status: nextDb } : u))
        );

        alert(`Status updated to "${dbToUi(nextDb)}".`);
      } catch {
        setMeStatusDb(prev);
        alert("Network error. Please try again.");
      }
    },
    [meStatusDb, currentUserId]
  );

  /** Filter/sort (exclude me from the grid of “others”) */
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = usersRaw.filter((u) => u.id !== currentUserId);

    if (q) {
      out = out.filter((u) => (`${u.firstName} ${u.lastName}`).toLowerCase().includes(q));
    }
    if (statusFiltersDb.length > 0) {
      out = out.filter((u) => (u.status ? statusFiltersDb.includes(u.status) : true));
    }

    out = [...out].sort((a, b) => {
      if (sortBy === "name") {
        const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
        const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
        const cmp = aName.localeCompare(bName);
        return sortDir === "asc" ? cmp : -cmp;
      } else {
        const aS = dbToUi(a.status);
        const bS = dbToUi(b.status);
        const cmp = aS.localeCompare(bS);
        return sortDir === "asc" ? cmp : -cmp;
      }
    });

    return out;
  }, [usersRaw, currentUserId, search, statusFiltersDb, sortBy, sortDir]);

  const toggleFilterDb = (db: DbStatus) => {
    setStatusFiltersDb((prev) =>
      prev.includes(db) ? prev.filter((x) => x !== db) : [...prev, db]
    );
  };

  const onToggleSort = (col: "name" | "status") => {
    if (col === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  return (
    <StatusesComponent
      userName={userName}
      meStatusDb={meStatusDb}
      onChangeMyStatus={onChangeMyStatus}
      search={search}
      setSearch={setSearch}
      statusFiltersDb={statusFiltersDb}
      toggleFilterDb={toggleFilterDb}
      users={filteredUsers}
      onLogout={onLogout}
      sortBy={sortBy}
      sortDir={sortDir}
      onToggleSort={onToggleSort}
    />
  );
};
