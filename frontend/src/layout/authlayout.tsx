import { Outlet } from "react-router-dom";
import { ThemeToggle } from "@Components/common/ThemeToggle";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-background relative transition-colors duration-300">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  );
};

export default AuthLayout;
