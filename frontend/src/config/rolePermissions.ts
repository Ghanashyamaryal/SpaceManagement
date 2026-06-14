import { Role } from "@/enum/enum";

export const canAccessPath = (role: string, pathname: string) => {
  // Simple implementation for now
  if (role === Role.SUPERADMIN) return true;
  
  // Define specific access rules here
  const permissions: Record<string, string[]> = {
    [Role.ADMIN]: [
      "/dashboard",
      "/users",
      "/caregiver",
      "/city-management",
      "/branch",
      "/branches",
      "/manage-space",
      "/role",
      "/events",
      "/bookings",
      "/plans",
      "/canteen-menu",
      "/canteen-orders",
      "/canteen-credits",
    ],
    [Role.USER]: [
      "/dashboard",
      "/profile",
      "/events",
      "/bookings",
      "/canteen",
      "/my-orders",
      "/my-credit",
    ],
  };

  const allowedPaths = permissions[role] || ["/dashboard"];
  return allowedPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
};
