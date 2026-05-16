import { Outlet } from "react-router-dom";
// import { useAuth } from "@/context/authcontext";
// import Loading from "@/common/extra/loading";

const PublicRoute = () => {
  // const { isLoggedIn, isInitialized, isLoading } = useAuth();

  // // Show loading spinner while checking authentication
  // if (!isInitialized || isLoading) {
  // 	return <Loading />;
  // }

  // // Redirect to dashboard if already authenticated
  // if (isLoggedIn) {
  // 	return <Navigate to="/" replace />;
  // }

  return <Outlet />;
};

export default PublicRoute;