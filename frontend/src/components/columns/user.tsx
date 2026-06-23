import { DeleteAction } from "@/components/common/DeleteAction";
import { Button } from "@/components/ui/Button";
import { type ColumnDef } from "@tanstack/react-table";
import { SquarePen, Eye, Mail, Shield, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Link } from "react-router-dom";
import { useMutation } from "@/hooks";
import { toast } from "sonner";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  isApproved?: boolean;
  createdAt?: string;
}

function ApprovalAction({
  user,
  refetch,
}: {
  user: User;
  refetch: () => void;
}) {
  // Admins/superadmins are implicitly approved — no action needed for them.
  if (user.role === "admin" || user.role === "superadmin") return null;

  const approved = user.isApproved === true;
  const { mutate, isLoading } = useMutation({
    method: "PATCH",
    onSuccess: () => {
      toast.success(approved ? "User access revoked" : "User approved");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update approval");
    },
  });

  const toggle = () =>
    mutate({ path: `/api/users/${user._id}`, data: { isApproved: !approved } });

  return (
    <Button
      variant={approved ? "ghost" : "default"}
      size="sm"
      onClick={toggle}
      disabled={isLoading}
      className={approved ? "text-muted-foreground hover:text-destructive" : ""}
    >
      {approved ? (
        <>
          <X className="h-4 w-4" /> Revoke
        </>
      ) : (
        <>
          <Check className="h-4 w-4" /> Approve
        </>
      )}
    </Button>
  );
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
    accessorKey: "isApproved",
    header: "APPROVAL",
    cell: ({ row }) => {
      const { role, isApproved } = row.original;
      if (role === "admin" || role === "superadmin") {
        return <Badge variant="secondary">APPROVED</Badge>;
      }
      return isApproved ? (
        <Badge variant="secondary">APPROVED</Badge>
      ) : (
        <Badge variant="outline" className="text-amber-600 border-amber-300">
          PENDING
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ApprovalAction user={row.original} refetch={refetch} />
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
