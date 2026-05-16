import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableCell, TableRow } from "@Components/index";
import { flexRender, type Row } from "@tanstack/react-table";

interface Props<T = any> {
  item: T & { id: string | number };
  row: Row<T>;
  meta?: any;
  index: number;
}

function SortableRows<T = any>({ row, item, meta, index }: Props<T>) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      key={row.id}
      data-state={row.getIsSelected() && "selected"}
      className="cursor-move"
    >
      {meta && (
        <TableCell className="text-center font-medium">
          {(meta.page - 1) * meta.take + index + 1}
        </TableCell>
      )}
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className="overflow-hidden text-ellipsis whitespace-nowrap h-10 place-items-center"
        >
          <div className="truncate max-w-[200px] overflow-hidden text-ellipsis">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </div>
        </TableCell>
      ))}
    </TableRow>
  );
}

export default SortableRows;