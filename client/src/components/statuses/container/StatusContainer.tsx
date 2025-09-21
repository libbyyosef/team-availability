import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import { useToast } from "@chakra-ui/react";
import { StatusesComponent, DB_STATUSES, dbToUi } from "../components/StatusComponent";
import type { DbStatus } from "../components/StatusComponent";
import {
  usersAtom,
  meStatusAtom,
  isLoadingAtom,
  lastUpdatedAtom,
  type UserRow,
} from "../../../store/usersAtoms";
import { styles } from "../../../assets/styles/styles";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const POLL_MS = 180_000 as const;

/** Backend payloads */
type BackendUser = {
  id: number;
  first_name: string;
  last_name: string;
  status: DbStatus | null;
};
type BackendUsersList = { users: BackendUser[] };

const mapUser = (u: BackendUser): UserRow => ({
  id: u.id,
  firstName: u.first_name,
  lastName: u.last_name,
  status: (u.status ?? "working") as DbStatus | null,
});

// one retry helper: only 1 retry on network failure (not for non-OK statuses)
async function fetchOnceWithOneRetry(input: RequestInfo | URL, init: RequestInit = {}) {
  try {
    return await fetch(input, init);
  } catch (e) {
    await new Promise((r) => setTimeout(r, 300));
    return await fetch(input, init);
  }
}

type SortBy = "name" | "status";
type SortDir = "asc" | "desc";

export const StatusesContainer: React.FC<{
  userName: string;
  onLogout: () => void;
  currentUserId: number;
}> = ({ userName, onLogout, currentUserId }) => {
  const [usersRaw, setUsersRaw] = useAtom(usersAtom);
  const [meStatusDb, setMeStatusDb] = useAtom(meStatusAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [lastUpdated, setLastUpdated] = useAtom(lastUpdatedAtom);
  const toast = useToast();

  // local UI state
  const [search, setSearch] = useState("");
  const [statusFiltersDb, setStatusFiltersDb] = useState<DbStatus[]>([...DB_STATUSES]);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  /** Fetch all users and set my status (foreground or poll) */
  const fetchAllUsers = useCallback(
    async (opts: { signal?: AbortSignal; foreground?: boolean } = {}) => {
      const { signal, foreground = false } = opts;
      if (foreground) setIsLoading(true);

      try {
        const res = await fetchOnceWithOneRetry(
          `${API_URL}/users/list_users_with_statuses?user_id=${currentUserId}`,
          { credentials: "include", cache: "no-store", signal }
        );

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            toast({ status: "warning", title: "Session expired", description: "Please log in again.", isClosable: true });
            onLogout();
            return;
          }
          // keep showing previous data if polling; if first load and empty -> toast
          if (foreground || usersRaw.length === 0) {
            toast({ status: "error", title: "Load failed", description: `Failed to load users (${res.status}).`, isClosable: true });
          }
          return;
        }

        const data: BackendUsersList = await res.json();
        const mapped = data.users.map(mapUser);
        setUsersRaw(mapped);
        const me = data.users.find((u) => u.id === currentUserId);
        if (me) setMeStatusDb((me.status ?? "working") as DbStatus);
        setLastUpdated(new Date());
      } catch {
        if (foreground || usersRaw.length === 0) {
          toast({ status: "error", title: "Network error", description: "Please try again.", isClosable: true });
        }
      } finally {
        if (foreground) setIsLoading(false);
      }
    },
    [onLogout, currentUserId, usersRaw.length, setUsersRaw, setMeStatusDb, setIsLoading, setLastUpdated, toast]
  );

  // initial load (foreground) + polling every 3 minutes (background)
  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      // small cookie-settle delay helps avoid immediate race after login
      await new Promise((r) => setTimeout(r, 200));
      if (!cancelled) await fetchAllUsers({ signal: ctrl.signal, foreground: true });
    })();

    const id = window.setInterval(() => {
      if (cancelled) return;
      const c = new AbortController();
      fetchAllUsers({ signal: c.signal, foreground: false });
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(id);
      ctrl.abort();
    };
  }, [fetchAllUsers]);

  /** Update my status → optimistic update; on error revert */
  const onChangeMyStatus = useCallback(
    async (nextDb: DbStatus) => {
      if (nextDb === meStatusDb) return;

      const prev = meStatusDb;
      setMeStatusDb(nextDb);
      // optimistic: reflect in table immediately
      setUsersRaw((prevUsers) =>
        prevUsers.map((u) => (u.id === currentUserId ? { ...u, status: nextDb } : u))
      );

      try {
        const res = await fetch(
          `${API_URL}/user_statuses/update_current_user_status?user_id=${currentUserId}&status=${encodeURIComponent(
            nextDb
          )}`,
          { method: "PUT", credentials: "include" }
        );

        if (!res.ok) {
          // revert
          setMeStatusDb(prev);
          setUsersRaw((prevUsers) =>
            prevUsers.map((u) => (u.id === currentUserId ? { ...u, status: prev } : u))
          );

          let detail = "";
          try {
            const d = await res.json();
            detail = typeof d?.detail === "string" ? d.detail : "";
          } catch {}
          toast({
            status: "error",
            title: "Update failed",
            description: detail || `Failed to update status (${res.status}).`,
            isClosable: true,
          });
          return;
        }

        setLastUpdated(new Date());
        toast({ status: "success", title: "Status updated", description: `Status updated to "${dbToUi(nextDb)}".`, isClosable: true });
      } catch {
        setMeStatusDb(prev);
        setUsersRaw((prevUsers) =>
          prevUsers.map((u) => (u.id === currentUserId ? { ...u, status: prev } : u))
        );
        toast({ status: "error", title: "Network error", description: "Please try again.", isClosable: true });
      }
    },
    [meStatusDb, currentUserId, setMeStatusDb, setUsersRaw, setLastUpdated, toast]
  );

  /** Filter/sort (exclude me from the grid of “others”) */
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = usersRaw.filter((u) => u.id !== currentUserId);

    if (q) out = out.filter((u) => `${u.firstName} ${u.lastName}`.toLowerCase().includes(q));
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
    setStatusFiltersDb((prev) => (prev.includes(db) ? prev.filter((x) => x !== db) : [...prev, db]));
  };

  const onToggleSort = (col: "name" | "status") => {
    if (col === sortBy) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  return (
    <div style={styles.appShell}>
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
        // loading + timestamp for header/skeleton
        isLoading={isLoading}
        lastUpdated={lastUpdated}
      />
    </div>
  );
};
