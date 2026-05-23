import { eventColumns } from "@/components/columns/event";
import Loading from "@/components/common/Loading";
import PageHeader, { pageContainer } from "@/components/common/PageHeader";
import { DataTables } from "@/components/TableComponent/Table";
import { useDataTable } from "@/hooks";
import { CalendarDays, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import CreateEvent from "./create";
import UpdateEvent from "./update";
import { useNavigate } from "react-router-dom";

export default function Events() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const {
    data: rawData,
    isLoading,
    refetch,
  } = useDataTable({
    path: "/api/events",
    queryKey: "events",
    defaultOrder: "DESC",
  });

  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedEvent(null);
    setIsDialogOpen(true);
  };

  const handleOpenUpdate = useCallback((data: any) => {
    setDialogMode("update");
    setSelectedEvent(data);
    setIsDialogOpen(true);
  }, []);

  const handleOpenRead = useCallback((data: any) => {
    navigate(`/events/read/${data._id}`);
  }, [navigate]);

  const columns = useMemo(
    () => eventColumns(refetch, handleOpenUpdate),
    [refetch, handleOpenUpdate],
  );

  return (
    <div className={pageContainer + " p-6"}>
      <PageHeader
        title="Events"
        description="Manage events"
        icon={<CalendarDays className="w-6 h-6" />}
        className="mb-1"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add Event
          </Button>
        }
      />
      {isLoading && !rawData ? (
        <Loading className="py-6" />
      ) : (
        <DataTables
          columns={columns}
          data={(rawData as any)?.events || []}
          meta={(rawData as any)?.meta}
          tableHeading="Events"
          sortingName="createdAt"
          onRowClick={handleOpenRead}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Create New Event" : "Update Event"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" ? "Create a new event." : "Modify existing event details."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {dialogMode === "create" ? (
              <CreateEvent
                onSuccess={() => {
                  setIsDialogOpen(false);
                  refetch();
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
            ) : (
              selectedEvent && (
                <UpdateEvent
                  id={selectedEvent._id}
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
