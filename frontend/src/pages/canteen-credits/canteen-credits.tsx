import { canteenCreditColumns } from "@/components/columns/canteen-credit";
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
import { Wallet } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

export default function CanteenCredits() {
  const { data: rawData, isLoading, refetch } = useDataTable({
    path: "/api/canteen/credit/users",
    queryKey: "canteen-credits",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [settleTarget, setSettleTarget] = useState<any>(null);
  const [settleAmount, setSettleAmount] = useState<string>("");
  const [settleNote, setSettleNote] = useState<string>("");

  const settleMutation = useMutation({
    method: "POST",
    onSuccess: () => {
      refetch();
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error.message || "Failed to settle balance");
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOpenSettle = useCallback((row: any) => {
    setSettleTarget(row);
    setSettleAmount(String(row.balance ?? ""));
    setSettleNote("");
  }, []);

  const handleConfirmSettle = async () => {
    if (!settleTarget) return;
    const amount = Number(settleAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    await settleMutation.mutate({
      path: "/api/canteen/credit/settle",
      data: {
        userId: settleTarget.user._id,
        amount,
        note: settleNote,
      },
    });
    toast.success(`Settled ₹${amount} for ${settleTarget.user.name}`);
    setSettleTarget(null);
  };

  const columns = useMemo(
    () => canteenCreditColumns(handleOpenSettle),
    [handleOpenSettle]
  );

  return (
    <div className={pageContainer + " p-6"}>
      <PageHeader
        title="Canteen Credits"
        description="Outstanding tabs — settle when users pay"
        icon={<Wallet className="w-6 h-6" />}
        className="mb-1"
      />
      {isLoading && !rawData ? (
        <Loading className="py-6" />
      ) : (
        <DataTables
          columns={columns}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data={(rawData as any)?.balances || []}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          meta={(rawData as any)?.meta}
          tableHeading="Outstanding balances"
          sortingName="balance"
        />
      )}

      <Dialog open={!!settleTarget} onOpenChange={(o) => !o && setSettleTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settle balance</DialogTitle>
            <DialogDescription>
              Record a payment from {settleTarget?.user?.name}. Outstanding: ₹
              {settleTarget?.balance}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-3">
            <div className="space-y-1">
              <Label htmlFor="settle-amount">Amount</Label>
              <Input
                id="settle-amount"
                type="number"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="settle-note">Note (optional)</Label>
              <Input
                id="settle-note"
                value={settleNote}
                onChange={(e) => setSettleNote(e.target.value)}
                placeholder="e.g. June month-end cash payment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSettleTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSettle}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
