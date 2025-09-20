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
  password: string;  // hashed
  status: Status;
};

export const ALL_STATUSES: Status[] = [
  Status.Working,
  Status.WorkingRemotely,
  Status.OnVacation,
  Status.BusinessTrip,
];



export const fullName = (u: User) => `${u.firstName} ${u.lastName}`;
