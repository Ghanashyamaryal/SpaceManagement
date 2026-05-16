import { DeleteAction } from "@/components/common/DeleteAction";
import { Button } from "@/components/ui/Button";
import { type ColumnDef } from "@tanstack/react-table";
import { SquarePen, Eye } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Link } from "react-router-dom";

export interface Workspace {
  _id: string;
  name: string;
  branch: {
    _id: string;
    name: string;
  };
  type: string;
  capacity: number;
  floor: string;
  status: 'available' | 'occupied' | 'maintenance';
  pricePerHour: number;
  pricePerDay: number;
  pricePerMonth: number;
  createdAt?: string;
}

export const workspaceColumns = (
  refetch: () => void,
  onEdit?: (data: Workspace) => void,
): ColumnDef<Workspace>[] => [
  {
    accessorKey: "name",
    header: "NAME",
  },
  {
    accessorKey: "branch.name",
    header: "BRANCH",
  },
  {
    accessorKey: "type",
    header: "TYPE",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.type.replace('_', ' ').toUpperCase()}
      </Badge>
    ),
  },
  {
    accessorKey: "capacity",
    header: "CAPACITY",
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
      
      if (status === 'available') variant = "secondary";
      if (status === 'occupied') variant = "destructive";
      if (status === 'maintenance') variant = "outline";
      
      return (
        <Badge variant={variant}>
          {status.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "pricePerHour",
    header: "PRICE/HR",
    cell: ({ row }) => `$${row.original.pricePerHour}`,
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link to={`/manage-space/read/${row.original._id}`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit?.(row.original)}
          className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
        >
          <SquarePen className="h-4 w-4" />
        </Button>
        <DeleteAction
          path={`/api/workspaces/${row.original._id}`}
          onSuccess={refetch}
          confirmMessage={`Are you sure you want to delete the workspace "${row.original.name}"?`}
        />
      </div>
    ),
  },
];
