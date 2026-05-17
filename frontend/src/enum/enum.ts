export const Role = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  USER: "user",
} as const;

export type RoleType = typeof Role[keyof typeof Role];
