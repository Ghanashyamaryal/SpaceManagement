import { DeleteAction } from "@/components/common/DeleteAction";
import { Button } from "@/components/ui/Button";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Edit } from "lucide-react";

export const eventColumns = (
  refetch: () => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate: (data: any) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): ColumnDef<any>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="w-full justify-between"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="text-center">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "event_type",
    header: "Type",
    cell: ({ row }) => <div className="text-center capitalize">{String(row.getValue("event_type")).replace('_', ' ')}</div>,
  },
  {
    accessorKey: "date",
    header: "Date",
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="text-center capitalize">
        {row.getValue("status")}
      </div>
    ),
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => <div className="text-center">{row.getValue("capacity")}</div>,
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
            path={`/api/events/${row.original._id}`}
            onSuccess={refetch}
            confirmMessage={`Are you sure you want to delete the event "${row.original.title}"?`}
          />
        </div>
      );
    },
  },
];
