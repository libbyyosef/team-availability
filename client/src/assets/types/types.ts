// Replace enum with erasable const object + string-literal type
export const Status = {
  Working: "Working",
  WorkingRemotely: "Working Remotely",
  OnVacation: "On Vacation",
  BusinessTrip: "Business Trip",
} as const;

export type Status = typeof Status[keyof typeof Status];

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;     // login (username)
  password: string;  // seed only (FirstName123!)
  status: Status;
};

export const ALL_STATUSES: Status[] = [
  Status.Working,
  Status.WorkingRemotely,
  Status.OnVacation,
  Status.BusinessTrip,
];

// Seed users (passwords are FirstName123!)
export const SEED_USERS: User[] = [
  { id: 1, firstName: "Libby",  lastName: "Yosef",    email: "libby.yosef@pubplus.com",    password: "Libby123!",  status: Status.Working },
  { id: 2, firstName: "Avi",    lastName: "Cohen",    email: "avi.cohen@pubplus.com",      password: "Avi123!",    status: Status.Working },
  { id: 3, firstName: "Diana",  lastName: "Tesler",   email: "diana.tesler@pubplus.com",   password: "Diana123!",  status: Status.OnVacation },
  { id: 4, firstName: "Yossi",  lastName: "Morris",   email: "yossi.morris@pubplus.com",   password: "Yossi123!",  status: Status.Working },
  { id: 5, firstName: "Danny",  lastName: "Rodin",    email: "danny.rodin@pubplus.com",    password: "Danny123!",  status: Status.BusinessTrip },
  { id: 6, firstName: "Efi",    lastName: "Shmidt",   email: "efi.shmidt@pubplus.com",     password: "Efi123!",    status: Status.OnVacation },
  { id: 7, firstName: "Inbal",  lastName: "Goldfarb", email: "inbal.goldfarb@pubplus.com", password: "Inbal123!",  status: Status.Working },
  { id: 8, firstName: "Dolev",  lastName: "Aufleger", email: "dolev.aufleger@pubplus.com", password: "Dolev123!",  status: Status.Working },
];

export const fullName = (u: User) => `${u.firstName} ${u.lastName}`;
