// import { useAuth } from "@/context/authcontext";
// import Layout from "@/layout/layout";
// import { Navigate, useLocation } from "react-router-dom";
// import Loading from "@/common/extra/loading";

// const GlobalProtectedRoute = () => {
// 	const { isLoggedIn, isInitialized, isLoading } = useAuth();
// 	const location = useLocation();

// 	// Show loading spinner while checking authentication
// 	if (!isInitialized || isLoading) {
// 		return <Loading />;
// 	}

// 	// Redirect to login and save current location
// 	if (!isLoggedIn) {
// 		return <Navigate to="/login" replace state={{ from: location }} />;
// 	}

// 	return <Layout />;
// };

// export default GlobalProtectedRoute;