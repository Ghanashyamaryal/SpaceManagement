import { useAuth } from "@/context/authcontext";
import Layout from "@/layout/layout";
import { Navigate, useLocation } from "react-router-dom";
import Loading from "@Components/common/Loading";

const GlobalProtectedRoute = () => {
  const { isLoggedIn, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  // Allow auth pages to stay on login/signup without being protected here
  const isAuthPage = ["/login", "/signup", "/forget-password"].includes(location.pathname);
  if (isAuthPage) {
    return null; // Return null so it doesn't render anything, allowing other sibling routes to match
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Layout />;
};

export default GlobalProtectedRoute;