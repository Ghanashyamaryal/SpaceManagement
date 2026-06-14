import Loading from "@/components/common/Loading";
import PageHeader, { pageContainer } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { useFetch } from "@/hooks/queryFn";
import { ClipboardList } from "lucide-react";

const statusStyle: Record<string, string> = {
  requested: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  accepted: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  rejected: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  delivered: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

interface OrderLine {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface OrderDoc {
  _id: string;
  status: string;
  totalAmount: number;
  items: OrderLine[];
  createdAt: string;
  rejectionReason?: string;
}

export default function MyOrders() {
  const { data, isLoading } = useFetch({
    path: "/api/canteen/orders",
    queryKey: "my-orders",
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders: OrderDoc[] = (data as any)?.orders ?? [];

  return (
    <div className={pageContainer + " p-6"}>
      <PageHeader
        title="My Orders"
        description="Your canteen orders and their status"
        icon={<ClipboardList className="w-6 h-6" />}
        className="mb-1"
      />
      {isLoading ? (
        <Loading className="py-6" />
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground py-6">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-3 mt-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </div>
                    <div className="text-lg font-bold mt-1">
                      ₹{order.totalAmount}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${
                      statusStyle[order.status] ?? ""
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-0.5">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.name} × {item.quantity} — ₹{item.subtotal}
                    </li>
                  ))}
                </ul>
                {order.status === "rejected" && order.rejectionReason && (
                  <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                    Reason: {order.rejectionReason}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
