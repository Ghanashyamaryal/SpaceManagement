import { canteenOrderColumns } from "@/components/columns/canteen-order";
import Loading from "@/components/common/Loading";
import PageHeader, { pageContainer } from "@/components/common/PageHeader";
import { DataTables } from "@/components/TableComponent/Table";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useDataTable, useMutation } from "@/hooks";
import { ClipboardList } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export default function CanteenOrders() {
  const { data: rawData, isLoading, refetch } = useDataTable({
    path: "/api/canteen/orders",
    queryKey: "canteen-orders",
    defaultOrder: "DESC",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rejectTarget, setRejectTarget] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");

  const statusMutation = useMutation({
    method: "PATCH",
    onSuccess: () => {
      refetch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to update order");
    },
  });

  const handleAccept = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (row: any) => {
      await statusMutation.mutate({
        path: `/api/canteen/orders/${row._id}/status`,
        data: { status: "accepted" },
      });
      toast.success("Order accepted — user credit updated");
    },
    [statusMutation]
  );

  const handleDeliver = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (row: any) => {
      await statusMutation.mutate({
        path: `/api/canteen/orders/${row._id}/status`,
        data: { status: "delivered" },
      });
      toast.success("Order marked delivered");
    },
    [statusMutation]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenReject = useCallback((row: any) => {
    setRejectTarget(row);
    setRejectReason("");
  }, []);

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    await statusMutation.mutate({
      path: `/api/canteen/orders/${rejectTarget._id}/status`,
      data: { status: "rejected", rejectionReason: rejectReason },
    });
    toast.success("Order rejected");
    setRejectTarget(null);
  };

  const columns = useMemo(
    () => canteenOrderColumns(handleAccept, handleOpenReject, handleDeliver),
    [handleAccept, handleOpenReject, handleDeliver]
  );

  return (
    <div className={pageContainer + " p-6"}>
      <PageHeader
        title="Canteen Orders"
        description="Accept, reject, or mark canteen orders as delivered"
        icon={<ClipboardList className="w-6 h-6" />}
        className="mb-1"
      />
      {isLoading && !rawData ? (
        <Loading className="py-6" />
      ) : (
        <DataTables
          columns={columns}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data={(rawData as any)?.orders || []}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          meta={(rawData as any)?.meta}
          tableHeading="Orders"
          sortingName="createdAt"
        />
      )}

      <Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject order</DialogTitle>
            <DialogDescription>
              Optionally include a reason. The user will see it on their order page.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <Label htmlFor="reject-reason">Rejection reason</Label>
            <Input
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Item unavailable"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject}>
              Reject Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
