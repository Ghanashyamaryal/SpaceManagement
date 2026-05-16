import { workspaceColumns, type Workspace } from "@/components/columns/manage-spaces";
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
import { Building2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import CreateWorkspace from "./create";
import UpdateWorkspace from "./update";

interface TWorkspaceResponse {
  workspaces: Workspace[];
  meta: any;
}

export default function ManageSpace() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create");
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);

  const {
    data: rawData,
    isLoading,
    refetch,
  } = useDataTable({
    path: "/api/workspaces",
    queryKey: queryKey.WORKSPACES,
    defaultOrder: "DESC",
  });

  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedWorkspace(null);
    setIsDialogOpen(true);
  };

  const handleOpenUpdate = (data: Workspace) => {
    setDialogMode("update");
    setSelectedWorkspace(data);
    setIsDialogOpen(true);
  };

  const data = rawData as TWorkspaceResponse;

  const columns = useMemo(
    () => workspaceColumns(refetch, handleOpenUpdate),
    [refetch],
  );

  return (
    <div className={pageContainer + " p-6"}>
      <PageHeader
        title="Workspaces"
        description="Manage organization workspaces and units"
        icon={<Building2 className="w-6 h-6" />}
        className="mb-1"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add Workspace
          </Button>
        }
      />
      {isLoading && !data ? (
        <Loading className="py-6" />
      ) : (
        <DataTables
          columns={columns}
          data={data?.workspaces || []}
          meta={data?.meta}
          tableHeading="Workspaces"
          sortingName="createdAt"
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Building2 className="w-6 h-6" />
            </div>
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-xl">
                {dialogMode === "create" ? "Create New Workspace" : "Update Workspace"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {dialogMode === "create"
                  ? "Establish a new workspace unit in your organization."
                  : "Modify the existing workspace details below."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="py-2">
            {dialogMode === "create" ? (
              <CreateWorkspace
                onSuccess={() => {
                  setIsDialogOpen(false);
                  refetch();
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
            ) : (
              selectedWorkspace && (
                <UpdateWorkspace
                  id={selectedWorkspace._id}
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
