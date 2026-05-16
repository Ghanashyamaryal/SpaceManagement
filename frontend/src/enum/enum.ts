export const Role = {
  SUPERADMIN: "superadmin",
  CITYADMIN: "cityadmin",
  STATEADMIN: "stateadmin",
  USER: "user",
} as const;

export type RoleType = typeof Role[keyof typeof Role];
