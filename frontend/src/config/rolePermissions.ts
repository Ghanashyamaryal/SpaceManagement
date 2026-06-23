import { Role } from "@/enum/enum";

// Admins/superadmins always have access; self-signup `user` accounts must be
// explicitly approved before they get anything beyond the dashboard.
export const isApprovedUser = (user: { role?: string; isApproved?: boolean } | null | undefined) => {
  if (!user) return false;
  const role = user.role?.toLowerCase();
  if (role === Role.SUPERADMIN || role === Role.ADMIN) return true;
  return user.isApproved === true;
};

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
