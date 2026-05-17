import { userColumns, type User } from "@/components/columns/user";
import Loading from "@/components/common/Loading";
import PageHeader, { pageContainer } from "@/components/common/PageHeader";
import { DataTables } from "@/components/TableComponent/Table";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useDataTable } from "@/hooks";
import { queryKey } from "@/lib/types/query-keys";
import { Users, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import CreateUser from "./create";
import UpdateUser from "./update";

interface TUserResponse {
  users: User[];
  meta: any;
}

export default function UserManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    data: rawData,
    isLoading,
    refetch,
  } = useDataTable({
    path: "/api/users",
    queryKey: queryKey.USERS || "users",
    defaultOrder: "DESC",
  });

  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleOpenUpdate = (data: User) => {
    setDialogMode("update");
    setSelectedUser(data);
    setIsDialogOpen(true);
  };

  const data = rawData as TUserResponse;

  const columns = useMemo(
    () => userColumns(refetch, handleOpenUpdate),
    [refetch],
  );

  return (
    <div className={pageContainer + " p-6"}>
      <PageHeader
        title="Users"
        description="Manage system users and their roles"
        icon={<Users className="w-6 h-6" />}
        className="mb-1"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add User
          </Button>
        }
      />
      {isLoading && !data ? (
        <Loading className="py-6" />
      ) : (
        <DataTables
          columns={columns}
          data={Array.isArray(data?.users) ? data.users : (Array.isArray(data) ? (data as unknown as User[]) : [])}
          meta={data?.meta}
          tableHeading="Users"
          sortingName="createdAt"
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-xl">
                {dialogMode === "create" ? "Add New User" : "Update User"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {dialogMode === "create"
                  ? "Register a new user in the system."
                  : "Modify the user details below."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="py-2">
            {dialogMode === "create" ? (
              <CreateUser
                onSuccess={() => {
                  setIsDialogOpen(false);
                  refetch();
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
            ) : (
              selectedUser && (
                <UpdateUser
                  id={selectedUser._id}
                  onSuccess={() => {
                    setIsDialogOpen(false);
                    refetch();
                  }}
                  onCancel={() => setIsDialogOpen(false)}
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
