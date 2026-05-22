import { bookingColumns } from "@/components/columns/booking";
import Loading from "@/components/common/Loading";
import PageHeader, { pageContainer } from "@/components/common/PageHeader";
import { DataTables } from "@/components/TableComponent/Table";
import { useDataTable } from "@/hooks";
import { BookOpen, Plus } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/Dialog";
import CreateBooking from "./create";
import UpdateBooking from "./update";
import { useNavigate } from "react-router-dom";

export default function Bookings() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "update">("create");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const {
    data: rawData,
    isLoading,
    refetch,
  } = useDataTable({
    path: "/api/bookings",
    queryKey: "bookings",
    defaultOrder: "DESC",
  });

  const handleOpenCreate = () => {
    setDialogMode("create");
    setSelectedBooking(null);
    setIsDialogOpen(true);
  };

  const handleOpenUpdate = useCallback((data: any) => {
    setDialogMode("update");
    setSelectedBooking(data);
    setIsDialogOpen(true);
  }, []);

  const handleOpenRead = useCallback((data: any) => {
    navigate(`/bookings/read/${data._id}`);
  }, [navigate]);

  const columns = useMemo(
    () => bookingColumns(handleOpenUpdate),
    [handleOpenUpdate],
  );

  return (
    <div className={pageContainer + " p-6"}>
      <PageHeader
        title="Bookings"
        description="Manage workspace bookings"
        icon={<BookOpen className="w-6 h-6" />}
        className="mb-1"
        action={
          <Button onClick={handleOpenCreate}>
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add Booking
          </Button>
        }
      />
      {isLoading && !rawData ? (
        <Loading className="py-6" />
      ) : (
        <DataTables
          columns={columns}
          data={(rawData as any)?.bookings || []}
          meta={(rawData as any)?.meta}
          tableHeading="Bookings"
          sortingName="createdAt"
          onRowClick={handleOpenRead}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "Create New Booking" : "Update Booking"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create" ? "Create a new booking." : "Modify existing booking details."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {dialogMode === "create" ? (
              <CreateBooking
                onSuccess={() => {
                  setIsDialogOpen(false);
                  refetch();
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
            ) : (
              selectedBooking && (
                <UpdateBooking
                  id={selectedBooking._id}
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
