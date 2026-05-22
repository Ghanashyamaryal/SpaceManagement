import { planColumns } from "@/components/columns/plan";
import Loading from "@/components/common/Loading";
import PageHeader, { pageContainer } from "@/components/common/PageHeader";
import { DataTables } from "@/components/TableComponent/Table";
import { useDataTable } from "@/hooks";
import { Calendar, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import CreatePlan from "./create";
import UpdatePlan from "./update";
import { useNavigate } from "react-router-dom";

export default function Plans() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const {
    data: rawData,
    isLoading,
    refetch,
  } = useDataTable({
    path: "/api/plans",
    queryKey: "plans",
    defaultOrder: "DESC",
  });

  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedPlan(null);
    setIsDialogOpen(true);
  };

  const handleOpenUpdate = useCallback((data: any) => {
    setDialogMode("update");
    setSelectedPlan(data);
    setIsDialogOpen(true);
  }, []);

  const handleOpenRead = useCallback((data: any) => {
    navigate(`/plans/read/${data._id}`);
  }, [navigate]);

  const columns = useMemo(
    () => planColumns(handleOpenUpdate),
    [handleOpenUpdate],
  );

  return (
    <div className={pageContainer + " p-6"}>
      <PageHeader
        title="Plans"
        description="Manage subscription plans"
        icon={<Calendar className="w-6 h-6" />}
        className="mb-1"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add Plan
          </Button>
        }
      />
      {isLoading && !rawData ? (
        <Loading className="py-6" />
      ) : (
        <DataTables
          columns={columns}
          data={(rawData as any)?.plans || []}
          meta={(rawData as any)?.meta}
          tableHeading="Plans"
          sortingName="createdAt"
          onRowClick={handleOpenRead}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Create New Plan" : "Update Plan"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" ? "Create a new subscription plan." : "Modify existing plan details."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {dialogMode === "create" ? (
              <CreatePlan
                onSuccess={() => {
                  setIsDialogOpen(false);
                  refetch();
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
            ) : (
              selectedPlan && (
                <UpdatePlan
                  id={selectedPlan._id}
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
