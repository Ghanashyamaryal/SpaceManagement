import { Button } from "@/components/ui/Button";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Truck, X } from "lucide-react";

const statusStyle: Record<string, string> = {
  requested:
    "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  accepted:
    "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  rejected:
    "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  delivered:
    "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

export const canteenOrderColumns = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onAccept: (row: any) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onReject: (row: any) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDeliver: (row: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ColumnDef<any>[] => [
  {
    accessorKey: "user",
    header: "USER",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="font-medium">{user?.name ?? "—"}</div>
      );
    },
  },
  {
    accessorKey: "items",
    header: "ITEMS",
    cell: ({ row }) => {
      const items = row.original.items ?? [];
      return (
        <div className="text-sm text-muted-foreground">
          {items
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((i: any) => `${i.name} × ${i.quantity}`)
            .join(", ")}
        </div>
      );
    },
  },
  {
    accessorKey: "totalAmount",
    header: "TOTAL",
    cell: ({ row }) => (
      <span className="font-medium">₹{row.getValue("totalAmount")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => {
      const status = String(row.getValue("status"));
      return (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded capitalize ${statusStyle[status] ?? ""}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "PLACED",
    cell: ({ row }) => {
      const d = new Date(row.getValue("createdAt"));
      return <span className="text-sm">{d.toLocaleString()}</span>;
    },
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <div className="flex items-center gap-2">
          {status === "requested" && (
            <>
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept(row.original);
                }}
              >
                <Check className="h-4 w-4" /> Accept
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(row.original);
                }}
              >
                <X className="h-4 w-4" /> Reject
              </Button>
            </>
          )}
          {status === "accepted" && (
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                onDeliver(row.original);
              }}
            >
              <Truck className="h-4 w-4" /> Mark Delivered
            </Button>
          )}
        </div>
      );
    },
  },
];
