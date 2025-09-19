import React, { useEffect, useMemo, useState } from "react";
import { SEED_USERS } from "../../../assets/types/types";
import type { Status,User } from "../../../assets/types/types";

import { StatusesComponent } from "../components/StatusComponent";


type SortBy = "name" | "status";
type SortDir = "asc" | "desc";

export const StatusesContainer: React.FC<{
  userName: string;
  onLogout: () => void;
}> = ({ userName, onLogout }) => {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [meStatus, setMeStatus] = useState<Status>("Working");
  const [search, setSearch] = useState("");
  const [statusFilters, setStatusFilters] = useState<Status[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const currentFull = userName.trim().toLowerCase();

  // initialize my status
  useEffect(() => {
    const u = users.find(
      (x) => `${x.firstName} ${x.lastName}`.trim().toLowerCase() === currentFull
    );
    if (u) setMeStatus(u.status);
  }, [users, currentFull]);

  // keep my status in list
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

    // 1) exclude me
    let out = users.filter(
      (u) => `${u.firstName} ${u.lastName}`.trim().toLowerCase() !== currentFull
    );

    // 2) search
    out = out.filter((u) => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      return !q || name.includes(q);
    });

    // 3) status filter
    if (statusFilters.length > 0) {
      out = out.filter((u) => statusFilters.includes(u.status));
    }

    // 4) sort
    out = [...out].sort((a, b) => {
      const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
      const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
      let cmp =
        sortBy === "name" ? aName.localeCompare(bName) : a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return out;
  }, [users, currentFull, search, statusFilters, sortBy, sortDir]);

  const toggleFilter = (s: Status) =>
    setStatusFilters((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  // Called when user clicks a column header
  const onToggleSort = (col: SortBy) => {
    if (col === sortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  return (
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
  );
};
