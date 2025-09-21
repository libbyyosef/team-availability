
// ----- UI Status labels -----
export const Status = {
  Working: "Working",
  WorkingRemotely: "Working Remotely",
  OnVacation: "On Vacation",
  BusinessTrip: "Business Trip",
} as const;

export type Status = typeof Status[keyof typeof Status];
export const ALL_STATUSES: Status[] = [
  Status.Working,
  Status.WorkingRemotely,
  Status.OnVacation,
  Status.BusinessTrip,
];

// ----- DB (snake_case) values -----
export const DB_STATUSES = ["working", "working_remotely", "on_vacation", "business_trip"] as const;
export type DbStatus = (typeof DB_STATUSES)[number];

// DB → UI
export const UI_BY_DB: Record<DbStatus, Status> = {
  working: Status.Working,
  working_remotely: Status.WorkingRemotely,
  on_vacation: Status.OnVacation,
  business_trip: Status.BusinessTrip,
};

// UI → DB
const DB_BY_UI = Object.fromEntries(
  Object.entries(UI_BY_DB).map(([db, ui]) => [ui, db as DbStatus])
) as Record<Status, DbStatus>;

export const dbToUi = (s: DbStatus | null | undefined): Status =>
  UI_BY_DB[s ?? "working"];

export const uiToDb = (label: Status): DbStatus => DB_BY_UI[label];

// Visual tokens that relate to statuses (optional, but handy)
export const VACATION_ROW_BG = "#797a7cff";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;  // hashed
  status: Status;
};

export const fullName = (u: User) => `${u.firstName} ${u.lastName}`;
