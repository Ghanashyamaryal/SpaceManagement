import { DeleteAction } from "@/components/common/DeleteAction";
import { Button } from "@/components/ui/Button";
import { type ColumnDef } from "@tanstack/react-table";
import { SquarePen } from "lucide-react";
import { Link } from "react-router-dom";

export interface Stream {
  id: string;
  name: string;
  createdAt?: string;
}

export const streamColumns = (
  refetch: () => void,
  onEdit?: (data: Stream) => void,
): ColumnDef<Stream>[] => [
  {
    accessorKey: "name",
    header: "NAME",
    cell: ({ row }) => (
      <Link to={`/organization/streams/read/${row.original.id}`}>
        {row.original.name}
      </Link>
    ),
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {onEdit ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
          >
            <SquarePen className="h-4 w-4" />
          </Button>
        ) : (
          <Link to={`/organization/streams/update/${row.original.id}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
            >
              <SquarePen className="h-4 w-4" />
            </Button>
          </Link>
        )}
        <DeleteAction
          path={`/api/streams/${row.original.id}`}
          onSuccess={refetch}
          confirmMessage={`Are you sure you want to delete the stream "${row.original.name}"?`}
        />
      </div>
    ),
  },
];
