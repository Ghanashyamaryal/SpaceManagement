import { DeleteAction } from "@/components/common/DeleteAction";
import { Button } from "@/components/ui/Button";
import { type ColumnDef } from "@tanstack/react-table";
import { SquarePen, Eye, MapPin, Phone, Mail } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Link } from "react-router-dom";

export interface Branch {
  _id: string;
  name: string;
  address: string;
  city?: string;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export const branchColumns = (
  refetch: () => void,
  onEdit?: (data: Branch) => void,
): ColumnDef<Branch>[] => [
  {
    accessorKey: "name",
    header: "BRANCH NAME",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "address",
    header: "LOCATION",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {row.original.city}
        </div>
        <div className="text-sm truncate max-w-[200px]">{row.original.address}</div>
      </div>
    ),
  },
  {
    accessorKey: "contact",
    header: "CONTACT",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        {row.original.phone && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {row.original.phone}
          </div>
        )}
        {row.original.email && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" />
            {row.original.email}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={status === 'active' ? 'secondary' : 'outline'}>
          {status.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link to={`/branches/read/${row.original._id}`}>
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
          path={`/api/branches/${row.original._id}`}
          onSuccess={refetch}
          confirmMessage={`Are you sure you want to delete the branch "${row.original.name}"?`}
        />
      </div>
    ),
  },
];
