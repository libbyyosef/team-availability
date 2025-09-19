export type Status =
  | "Working"
  | "Working Remotely"
  | "On Vacation"
  | "Business Trip";

// Single source of truth: User (includes status)
export type User = {
  id: number;
  firstName: string;
  lastName: string;
  username: string; // email used to log in
  password: string; // assignment-only (FirstName + "123!")
  status: Status;
};

export const ALL_STATUSES: Status[] = [
  "Working",
  "Working Remotely",
  "On Vacation",
  "Business Trip",
];

export const fullName = (u: Pick<User, "firstName" | "lastName">) =>
  `${u.firstName}${u.lastName ? " " + u.lastName : ""}`;

// Seed users (username is email). Password = FirstName + "123!"
export const SEED_USERS: User[] = [
  { id: 1, firstName: "Libby", lastName: "Yosef",    username: "libby.yosef@pubplus.com",   password: "Libby123!",  status: "Working" },
  { id: 2, firstName: "Avi",   lastName: "Cohen",    username: "avi.cohen@pubplus.com",     password: "Avi123!",    status: "Working" },
  { id: 3, firstName: "Diana", lastName: "Tesler",   username: "diana.tesler@pubplus.com",  password: "Diana123!",  status: "On Vacation" },
  { id: 4, firstName: "Yossi", lastName: "Morris",   username: "yossi.morris@pubplus.com",  password: "Yossi123!",  status: "Working" },
  { id: 5, firstName: "Danny", lastName: "Rodin",    username: "danny.rodin@pubplus.com",   password: "Danny123!",  status: "Business Trip" },
  { id: 6, firstName: "Efi",   lastName: "Shmidt",   username: "efi@pubplus.com",           password: "Efi123!",    status: "On Vacation" },
  { id: 7, firstName: "Inbal", lastName: "Goldfarb", username: "inbal.goldfarb@pubplus.com",password: "Inbal123!",  status: "Working" },
  { id: 8, firstName: "Dolev", lastName: "Aufleger", username: "dolev.aufleger@pubplus.com",password: "Dolev123!",  status: "Working" },
];

// Front-end mock auth
export function authenticate(username: string, password: string) {
  const u = SEED_USERS.find(
    x => x.username.toLowerCase() === username.trim().toLowerCase()
  );
  return u && u.password === password ? u : null;
}
