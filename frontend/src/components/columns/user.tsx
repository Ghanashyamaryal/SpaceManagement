import { DeleteAction } from "@/components/common/DeleteAction";
import { Button } from "@/components/ui/Button";
import { type ColumnDef } from "@tanstack/react-table";
import { SquarePen, Eye, Mail, Shield } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Link } from "react-router-dom";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export const userColumns = (
  refetch: () => void,
  onEdit?: (data: User) => void,
): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "NAME",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "EMAIL",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Mail className="h-3.5 w-3.5" />
        {row.original.email}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "ROLE",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Shield className="h-3.5 w-3.5" />
        <span className="capitalize">
          {{ superadmin: 'Super Admin', admin: 'Admin', user: 'Users' }[row.original.role] || row.original.role}
        </span>
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
          {status ? status.toUpperCase() : 'UNKNOWN'}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link to={`/users/read/${row.original._id}`}>
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
          path={`/api/users/${row.original._id}`}
          onSuccess={refetch}
          confirmMessage={`Are you sure you want to delete the user "${row.original.name}"?`}
        />
      </div>
    ),
  },
];
