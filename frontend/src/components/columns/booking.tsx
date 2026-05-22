import { DeleteAction } from "@/components/common/DeleteAction";
import { Button } from "@/components/ui/Button";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit } from "lucide-react";

export const bookingColumns = (
  refetch: () => void,
  onUpdate: (data: any) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-between"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const dateValue = row.getValue("date");
      return (
        <div className="text-center">
          {dateValue ? new Date(dateValue as string | number | Date).toLocaleDateString() : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => <div className="text-center">{row.getValue("startTime")}</div>,
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    cell: ({ row }) => <div className="text-center">{row.getValue("endTime")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="text-center capitalize">
        {row.getValue("status")}
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => <div className="text-center">${row.getValue("amount")}</div>,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const data = row.original;
      return (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onUpdate(data); }}>
            <Edit className="w-4 h-4" />
          </Button>
          <DeleteAction
            path={`/api/bookings/${row.original._id}`}
            onSuccess={refetch}
            confirmMessage="Are you sure you want to delete this booking?"
          />
        </div>
      );
    },
  },
];
