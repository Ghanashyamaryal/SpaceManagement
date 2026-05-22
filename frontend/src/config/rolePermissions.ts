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
      "/plans"
    ],
    [Role.USER]: [
      "/dashboard", 
      "/profile",
      "/events", // Assuming users can see events
      "/bookings" // Assuming users can see their bookings
    ],
  };

  const allowedPaths = permissions[role] || ["/dashboard"];
  return allowedPaths.some(path => pathname.startsWith(path));
};
