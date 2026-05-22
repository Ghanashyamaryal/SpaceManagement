import { DeleteAction } from "@/components/common/DeleteAction";
import { Button } from "@/components/ui/Button";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Eye, SquarePen } from "lucide-react";
import { Link } from "react-router-dom";

export const planColumns = (
  refetch: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: (data: any) => void,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): ColumnDef<any>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-between"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "type",
    header: "TYPE",
    cell: ({ row }) => (
      <span className="capitalize px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold dark:bg-blue-900/30 dark:text-blue-300">
        {row.getValue("type")}
      </span>
    ),
  },
  {
    accessorKey: "price",
    header: "PRICE",
    cell: ({ row }) => <span className="font-medium">${row.getValue("price")}</span>,
  },
  {
    accessorKey: "durationDays",
    header: "DURATION (DAYS)",
  },
  {
    accessorKey: "isActive",
    header: "STATUS",
    cell: ({ row }) =>
      row.getValue("isActive") ? (
        <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded dark:bg-green-900/30 dark:text-green-300">
          Active
        </span>
      ) : (
        <span className="bg-red-50 text-red-700 text-xs font-bold px-2 py-0.5 rounded dark:bg-red-900/30 dark:text-red-300">
          Inactive
        </span>
      ),
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link to={`/plans/read/${row.original._id}`}>
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
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onUpdate(row.original); }}
          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
        >
          <SquarePen className="h-4 w-4" />
        </Button>
        <DeleteAction
          path={`/api/plans/${row.original._id}`}
          onSuccess={refetch}
          confirmMessage={`Are you sure you want to delete the plan "${row.original.name}"?`}
        />
      </div>
    ),
  },
];
