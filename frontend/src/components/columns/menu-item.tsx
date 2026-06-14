import { DeleteAction } from "@/components/common/DeleteAction";
import { Button } from "@/components/ui/Button";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, SquarePen } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const menuItemColumns = (
  refetch: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: (data: any) => void
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
    accessorKey: "category",
    header: "CATEGORY",
    cell: ({ row }) => (
      <span className="capitalize px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold dark:bg-blue-900/30 dark:text-blue-300">
        {row.getValue("category")}
      </span>
    ),
  },
  {
    accessorKey: "price",
    header: "PRICE",
    cell: ({ row }) => <span className="font-medium">₹{row.getValue("price")}</span>,
  },
  {
    accessorKey: "prepTimeMinutes",
    header: "PREP TIME",
    cell: ({ row }) => <span>{row.getValue("prepTimeMinutes")} min</span>,
  },
  {
    accessorKey: "isAvailable",
    header: "STATUS",
    cell: ({ row }) =>
      row.getValue("isAvailable") ? (
        <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-0.5 rounded dark:bg-green-900/30 dark:text-green-300">
          Available
        </span>
      ) : (
        <span className="bg-red-50 text-red-700 text-xs font-bold px-2 py-0.5 rounded dark:bg-red-900/30 dark:text-red-300">
          Sold Out
        </span>
      ),
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onUpdate(row.original);
          }}
          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
        >
          <SquarePen className="h-4 w-4" />
        </Button>
        <DeleteAction
          path={`/api/canteen/menu/${row.original._id}`}
          onSuccess={refetch}
          confirmMessage={`Delete menu item "${row.original.name}"?`}
        />
      </div>
    ),
  },
];
