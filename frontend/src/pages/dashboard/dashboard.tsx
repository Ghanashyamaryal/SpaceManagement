import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { useAuth } from "@/context/authcontext";
import { isApprovedUser } from "@/config/rolePermissions";
import { Role } from "@/enum/enum";
import { Clock } from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import UserDashboard from "./UserDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const pending = !isApprovedUser(user);
  const role = user?.role?.toLowerCase();
  const isAdmin = role === Role.ADMIN || role === Role.SUPERADMIN;

  // Self-signup users awaiting approval only have the dashboard route — show the
  // notice instead of charts (they have no data/access yet).
  if (pending) {
    return (
      <div className="p-4 space-y-4">
        <Alert>
          <Clock />
          <AlertTitle>Account pending approval</AlertTitle>
          <AlertDescription>
            Your account is awaiting approval from an administrator. You'll get
            full access to the system once it's approved.
          </AlertDescription>
        </Alert>

        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p>Welcome to your workspace management system!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">{isAdmin ? <AdminDashboard /> : <UserDashboard />}</div>
  );
};

export default Dashboard;
