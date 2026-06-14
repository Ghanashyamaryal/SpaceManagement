import { Button } from "@/components/ui/Button";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export const canteenCreditColumns = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSettle: (row: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): ColumnDef<any>[] => [
  {
    accessorKey: "user.name",
    header: "USER",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.user?.name ?? "—"}</div>
    ),
  },
  {
    accessorKey: "user.email",
    header: "EMAIL",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.user?.email}
      </span>
    ),
  },
  {
    accessorKey: "charges",
    header: "TOTAL CHARGED",
    cell: ({ row }) => <span>₹{row.original.charges ?? 0}</span>,
  },
  {
    accessorKey: "settlements",
    header: "TOTAL PAID",
    cell: ({ row }) => <span>₹{row.original.settlements ?? 0}</span>,
  },
  {
    accessorKey: "balance",
    header: "OUTSTANDING",
    cell: ({ row }) => (
      <span className="font-bold text-amber-700 dark:text-amber-300">
        ₹{row.original.balance ?? 0}
      </span>
    ),
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link to={`/canteen-credits/read/${row.original.user._id}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSettle(row.original);
          }}
        >
          <Wallet className="h-4 w-4" /> Settle
        </Button>
      </div>
    ),
  },
];
