import { atom } from "jotai";
import type { DbStatus } from "../components/statuses/components/StatusComponent"


export type UserRow = {
  id: number;
  firstName: string;
  lastName: string;
  status: DbStatus | null;
};

export const usersAtom = atom<UserRow[]>([]);
export const meStatusAtom = atom<DbStatus>("working");

// UX flags
export const isLoadingAtom = atom<boolean>(true);      // first foreground load only
export const lastUpdatedAtom = atom<Date | null>(null);
