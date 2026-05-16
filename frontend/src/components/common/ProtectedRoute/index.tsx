import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  isLoading?: boolean;
}

export const ProtectedRoute = ({
  isAuthenticated,
  isLoading = false,
}: ProtectedRouteProps) => {
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
