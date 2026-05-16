import { DeleteAction } from '@/components/common/DeleteAction';
import { type ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';

export interface ClassStreamGroup {
  id: string | number;
  class?: { id: string | number; name: string };
  stream?: { id: string | number; name: string };
  group?: { id: string | number; name: string };
}

export const comboColumns = (
  refetch: () => void,
  onEdit?: (data: ClassStreamGroup) => void,
): ColumnDef<ClassStreamGroup>[] => [
  {
    id: 'label',
    header: 'LABEL',
    cell: ({ row }) => {
      const cls = row.original.class?.name || 'N/A';
      const str = row.original.stream?.name || 'N/A';
      const grp = row.original.group?.name || 'N/A';
      return (
        <Link
          to={`/organization/combos/read/${row.original.id}`}
          className=" text-primary"
        >
          {`${cls} - ${str} - ${grp}`}
        </Link>
      );
    },
  },
  {
    id: 'class',
    header: 'CLASS',
    cell: ({ row }) => <span>{row.original.class?.name || '-'}</span>,
  },
  {
    id: 'stream',
    header: 'STREAM',
    cell: ({ row }) => <span>{row.original.stream?.name || '-'}</span>,
  },
  {
    id: 'group',
    header: 'GROUP',
    cell: ({ row }) => <span>{row.original.group?.name || '-'}</span>,
  },
  {
    id: 'actions',
    header: 'ACTIONS',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {/* {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
          >
            <SquarePen className="h-4 w-4" />
          </Button>
        )} */}
        <DeleteAction
          path={`/api/class-stream-groups/${row.original.id}`}
          onSuccess={refetch}
          confirmMessage={`Are you sure you want to delete this combo?`}
        />
      </div>
    ),
  },
];
