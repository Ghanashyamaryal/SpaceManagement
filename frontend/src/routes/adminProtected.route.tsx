import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/context/authcontext";
import Error from "@Components/common/Error";
import { Role } from "@/enum/enum";
import Loading from "@Components/common/Loading";
import { canAccessPath } from "@/config/rolePermissions";

const AdminProtectedRoute = () => {
  const { user, isLoggedIn, isLoading } = useAuth();
  const userRole = user?.role?.toLowerCase();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }
  
  if (!isLoggedIn || !userRole) {
    return <Navigate to="/login" replace />;
  }

  if
    (userRole === Role.ADMIN ||
     userRole === Role.SUPERADMIN)
    {
    if (userRole === Role.SUPERADMIN) {
      return <Outlet />;
    }

    if (canAccessPath(userRole, location.pathname)) {
      return <Outlet />;
    }

    return <Error title="Access Denied" message="You do not have permission to access this page." />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
