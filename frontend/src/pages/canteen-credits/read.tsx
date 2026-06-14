import Loading from "@/components/common/Loading";
import { pageContainer } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
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
import { useMutation } from "@/hooks";
import { useFetch } from "@/hooks/queryFn";
import { ArrowLeft, User, Wallet } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

interface OrderLine {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Tx {
  _id: string;
  type: "order_charge" | "settlement";
  amount: number;
  note?: string;
  createdAt: string;
  order?: {
    _id: string;
    totalAmount: number;
    items?: OrderLine[];
  };
}

export default function CanteenCreditRead() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useFetch({
    path: `/api/canteen/credit/users/${id}`,
    queryKey: `credit-user-${id}`,
  });

  const [settleOpen, setSettleOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState("");
  const [settleNote, setSettleNote] = useState("");

  const settleMutation = useMutation({
    method: "POST",
    onSuccess: () => {
      refetch();
      setSettleOpen(false);
      toast.success("Balance settled");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => toast.error(err.message || "Failed to settle"),
  });

  const handleSettle = async () => {
    const amount = Number(settleAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    await settleMutation.mutate({
      path: "/api/canteen/credit/settle",
      data: { userId: id, amount, note: settleNote },
    });
  };

  const backButton = (
    <Button
      variant="ghost"
      onClick={() => navigate("/canteen-credits")}
      className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground transition-colors -ml-2"
    >
      <ArrowLeft className="w-4 h-4" />
      Back
    </Button>
  );

  if (isLoading) {
    return (
      <div className={pageContainer}>
        <Loading className="min-h-100" />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const summary = data as any;
  if (!summary?.user) {
    return (
      <div className={pageContainer}>
        <div className="flex flex-col items-center justify-center min-h-100 gap-6 bg-card border border-border rounded-2xl shadow-xl">
          <p className="text-xl font-bold text-muted-foreground">User not found</p>
          {backButton}
        </div>
      </div>
    );
  }

  const transactions: Tx[] = summary.recentTransactions ?? [];
  const charges = transactions.filter((t) => t.type === "order_charge");
  const settlements = transactions.filter((t) => t.type === "settlement");

  return (
    <div className={pageContainer + " p-6"}>
      <div className="mb-6">
        {backButton}
        <div className="mt-4 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Credit Details</h1>
            <p className="text-muted-foreground mt-1">{summary.user.name} — {summary.user.email}</p>
          </div>
          {summary.balance > 0 && (
            <Button
              onClick={() => {
                setSettleAmount(String(summary.balance));
                setSettleNote("");
                setSettleOpen(true);
              }}
            >
              <Wallet className="h-4 w-4" /> Settle Balance
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Outstanding</div>
            <div className="text-3xl font-extrabold mt-1 text-amber-700 dark:text-amber-300">
              ₹{summary.balance}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total Charged</div>
            <div className="text-3xl font-extrabold mt-1">₹{summary.charges}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {charges.length} order{charges.length === 1 ? "" : "s"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-muted-foreground">Total Paid</div>
            <div className="text-3xl font-extrabold mt-1 text-green-700 dark:text-green-300">
              ₹{summary.settlements}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {settlements.length} settlement{settlements.length === 1 ? "" : "s"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <User className="h-5 w-5" /> All Orders
          </h2>
          {charges.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders charged yet.</p>
          ) : (
            <div className="space-y-2">
              {charges.map((tx) => (
                <Card key={tx._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                        <div className="text-lg font-bold mt-1">₹{tx.amount}</div>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        Charged
                      </span>
                    </div>
                    {tx.order?.items && tx.order.items.length > 0 && (
                      <ul className="text-sm text-muted-foreground space-y-0.5 pt-2 border-t">
                        {tx.order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.name} × {item.quantity} — ₹{item.subtotal}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Wallet className="h-5 w-5" /> Payments
          </h2>
          {settlements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {settlements.map((tx) => (
                <Card key={tx._id}>
                  <CardContent className="p-4 flex items-start justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                      <div className="text-lg font-bold mt-1 text-green-700 dark:text-green-300">
                        ₹{tx.amount}
                      </div>
                      {tx.note && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {tx.note}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Paid
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settle balance</DialogTitle>
            <DialogDescription>
              Record a payment from {summary.user.name}. Outstanding: ₹{summary.balance}.
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
            <Button variant="ghost" onClick={() => setSettleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSettle}>Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
