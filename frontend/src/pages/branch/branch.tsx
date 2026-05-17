import { branchColumns, type Branch } from "@/components/columns/branch";
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
import { MapPin, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import CreateBranch from "./create";
import UpdateBranch from "./update";

interface TBranchResponse {
  branches: Branch[];
  meta: any;
}

export default function BranchManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const {
    data: rawData,
    isLoading,
    refetch,
  } = useDataTable({
    path: "/api/branches",
    queryKey: queryKey.BRANCHES,
    defaultOrder: "DESC",
  });

  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedBranch(null);
    setIsDialogOpen(true);
  };

  const handleOpenUpdate = (data: Branch) => {
    setDialogMode("update");
    setSelectedBranch(data);
    setIsDialogOpen(true);
  };

  const data = rawData as TBranchResponse;

  const columns = useMemo(
    () => branchColumns(refetch, handleOpenUpdate),
    [refetch],
  );

  return (
    <div className={pageContainer + " p-6"}>
      <PageHeader
        title="Branches"
        description="Manage your physical locations and branch offices"
        icon={<MapPin className="w-6 h-6" />}
        className="mb-1"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add Branch
          </Button>
        }
      />
      {isLoading && !data ? (
        <Loading className="py-6" />
      ) : (
        <DataTables
          columns={columns}
          data={data?.branches || []}
          meta={data?.meta}
          tableHeading="Branches"
          sortingName="createdAt"
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <MapPin className="w-6 h-6" />
            </div>
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-xl">
                {dialogMode === "create" ? "Add New Branch" : "Update Branch"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {dialogMode === "create"
                  ? "Register a new branch location in the system."
                  : "Modify the branch details below."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="py-2">
            {dialogMode === "create" ? (
              <CreateBranch
                onSuccess={() => {
                  setIsDialogOpen(false);
                  refetch();
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
            ) : (
              selectedBranch && (
                <UpdateBranch
                  id={selectedBranch._id}
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
