import { Role } from "@/enum/enum";

export const canAccessPath = (role: string, pathname: string) => {
  // Simple implementation for now
  if (role === Role.SUPERADMIN) return true;
  
  // Define specific access rules here
  const permissions: Record<string, string[]> = {
    [Role.CITYADMIN]: ["/dashboard", "/users", "/caregiver"],
    [Role.STATEADMIN]: ["/dashboard", "/users", "/caregiver", "/city-management"],
    [Role.USER]: ["/dashboard", "/profile"],
  };

  const allowedPaths = permissions[role] || ["/dashboard"];
  return allowedPaths.some(path => pathname.startsWith(path));
};
