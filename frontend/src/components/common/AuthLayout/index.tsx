import { useLogout } from "@/hooks/useLogout";
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
// import { Container } from "@/components/common/container";

export default function Layout() {
  const navigate = useNavigate();
  const { logout, isLoading } = useLogout();

  async function logoutUser(): Promise<void> {
    try {
      await logout();
      navigate("/login");
    } catch (error) {}
  }

  return (
    <>
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
                    //   src={`${API_URL}/public/${user?.image}`}
                    //   alt="error Image"
                    //   className="object-cover aspect-square"
                    />
                    <AvatarFallback>
                      {/* 
                      {user?.name ? (
                        <span className="text-primary">
                          {user?.name.split(" ")[0][0]?.toUpperCase() || "U"}
                          {user?.name.split(" ")[1]?.[0]?.toUpperCase() || ""}
                        </span>
                      ) : (
                        "U"
                      )} */}
                      JD
                    </AvatarFallback>
                  </Avatar>

                  <section className="flex flex-col text-xs ">
                    <span className={`font-semibold text-left`}>
                      {/*                       
                      {user?.name}{" "}
                       */}
                      John Doe
                    </span>
                    <span className="text-left capitalize text-accent">
                      {/*                       
                      {" "}
                      {user?.role}
                       */}
                      Author
                    </span>
                  </section>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel className="capitalize">
                    {/*                     
                    {" "}
                    {user?.name || "setting"}{" "}
                     */}
                    John
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to={`/change-password`}>Change Password</Link>
                  </DropdownMenuItem>
                  {/* {user?.role === "admin" ||
                  user?.permissions.includes(PermissionOptions.ACTIVITY_LOGS_READ) ? ( */}
                  <DropdownMenuItem>
                    <Link to={`/activity-log`}>Activity Log</Link>
                  </DropdownMenuItem>
                  {/* ) : null} */}

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
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>
    </>
  );
}
