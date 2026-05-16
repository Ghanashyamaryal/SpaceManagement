import { useAuth } from "@/context/authcontext";
import { toast } from "sonner";
import { ThemeToggle } from "@Components/common/ThemeToggle";
import { AppSidebar } from "@Components/HOC/AppSidebar";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarProvider,
  SidebarTrigger,
} from "@Components/index";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const logoutUser = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {}
  };

  return (
    <SidebarProvider className="">
      <AppSidebar />
      <main className="min-w-0 flex-1">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 sticky top-0 bg-background z-50">
          <SidebarTrigger className="" />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center cursor-pointer gap-2">
                <Avatar>
                  <AvatarImage
                    src={user?.image}
                    alt="User"
                  />
                  <AvatarFallback>
                    {user?.name ? (
                      <span className="text-primary font-bold">
                        {user.name.split(" ")[0][0]?.toUpperCase() || "U"}
                      </span>
                    ) : (
                      "U"
                    )}
                  </AvatarFallback>
                </Avatar>

                <section className="hidden md:flex flex-col text-xs text-left">
                  <span className="font-semibold capitalize">
                    {user?.name || "Guest User"}
                  </span>
                  <span className="text-accent uppercase font-medium">
                    {user?.role || "User"}
                  </span>
                </section>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="capitalize text-center">
                  {user?.name || "Profile"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/change-password">Change Password</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logoutUser}
                  className={`w-full ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
}
