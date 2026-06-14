import Loading from "@/components/common/Loading";
import PageHeader, { pageContainer } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { useFetch } from "@/hooks/queryFn";
import { Wallet } from "lucide-react";

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

export default function MyCredit() {
  const { data, isLoading } = useFetch({
    path: "/api/canteen/credit/me",
    queryKey: "my-credit",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const summary = (data as any) ?? { balance: 0, charges: 0, settlements: 0, recentTransactions: [] };
  const transactions: Tx[] = summary.recentTransactions ?? [];

  return (
    <div className={pageContainer + " p-6"}>
      <PageHeader
        title="My Credit"
        description="Your outstanding canteen balance"
        icon={<Wallet className="w-6 h-6" />}
        className="mb-1"
      />

      {isLoading ? (
        <Loading className="py-6" />
      ) : (
        <div className="space-y-6 mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-sm text-muted-foreground">Outstanding</div>
              <div className="text-4xl font-extrabold mt-1">
                ₹{summary.balance}
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                Total charged: ₹{summary.charges} · Total paid: ₹
                {summary.settlements}
              </div>
              {summary.balance > 0 && (
                <p className="mt-4 text-sm">
                  Please pay this amount in cash to the canteen admin. They will
                  mark your balance as cleared.
                </p>
              )}
            </CardContent>
          </Card>

          <div>
            <h3 className="font-bold mb-2">Recent Transactions</h3>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No transactions yet.
              </p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <Card key={tx._id}>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-sm font-medium capitalize">
                            {tx.type.replace("_", " ")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleString()}
                            {tx.note ? ` · ${tx.note}` : ""}
                          </div>
                        </div>
                        <span
                          className={`font-bold ${
                            tx.type === "order_charge"
                              ? "text-amber-700 dark:text-amber-300"
                              : "text-green-700 dark:text-green-300"
                          }`}
                        >
                          {tx.type === "order_charge" ? "+" : "-"}₹{tx.amount}
                        </span>
                      </div>
                      {tx.type === "order_charge" && tx.order?.items && tx.order.items.length > 0 && (
                        <ul className="text-xs text-muted-foreground space-y-0.5 pt-2 mt-2 border-t">
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
          </div>
        </div>
      )}
    </div>
  );
}
