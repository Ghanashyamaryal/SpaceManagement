import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@Components/index";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { Download, Printer, Settings2 } from "lucide-react";
import { CSVLink } from "react-csv";
import { useReactToPrint } from "react-to-print";

import {
  Button, buttonVariants,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@Components/index";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
// import { CreateVehicleDialog } from "@/dialog/vehicle/create";
import type { TeamData } from "@Types/types";
import { cn } from "@Utils/cn";
import { closestCenter, DndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableRows from "../../common/DragAndDrop/sortable_row";
import { DataTablePagination } from "../data-table-pagination";

interface DataTableProps {
  columns: ColumnDef<any>[];
  sortable?: boolean;
  items?: TeamData[];
  handleDragEnd?: any;
  data: any[];
  showExport?: boolean;
  heads?: any[];
  tableHeading?: string;
  sortingName?: string;
  refetch?: () => void;
  meta?: TQueryMeta;
  pageSize?: number; // Optional prop to set default page size
  dialogTitle?: string;
  dialogDescription?: string;
  searchOnlyHide?: boolean; // Optional prop to hide the search input
  searchHide?: boolean; // Optional prop to hide the search input
  paginationHide?: boolean; // Optional prop to hide the search input
  filterComponent?: React.ReactNode;
  onRowClick?: (row: any) => void;
}

export type TQueryMeta = {
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export function DataTables({
  sortable = false,
  handleDragEnd,
  searchHide = false,
  searchOnlyHide = false,
  columns,
  data,
  sortingName,
  meta,
  heads,
  showExport,
  tableHeading = "Data Table",
  filterComponent,
  onRowClick,
}: DataTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(
    searchParams.get("search") || "",
  );

  const [sorting, setSorting] = useState<{
      id: string; 
      desc: boolean 
    }[]>(
    sortingName ? [{ id: sortingName,
       desc: true }] : []
  );

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: meta?.take || 10, // Use the provided page size or default to 10
    // default page size
  });

  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState({});
  const [globalFilter, setGlobalFilter] = useState(
    searchParams.get("search") || "",
  );

  const tableRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: tableRef,
  });

  // Debounced search function
  const debounceDelay = 1000; //

  const debouncedUpdateSearch = useCallback(
    (() => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return (value: string) => {
        clearTimeout(timeoutId as unknown as number);
        timeoutId = setTimeout(() => {
          setGlobalFilter(value);

          // Update URL search params
          const newSearchParams = new URLSearchParams(searchParams);
          if (value) {
            newSearchParams.set("search", value);
          } else {
            newSearchParams.delete("search");
          }
          setSearchParams(newSearchParams);
        }, debounceDelay);
      };
    })(),
    [searchParams, setSearchParams],
  );

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    debouncedUpdateSearch(value);
  };

  // Initialize global filter from URL params on component mount
  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setGlobalFilter(searchParam);
      setInputValue(searchParam);
    }
  }, [searchParams]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      globalFilter,
      pagination,
      rowSelection,
    },

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    globalFilterFn: (row, _columnId, value): boolean => {
      // Custom filter function to handle nested objects
      if (!value) return true;

      const search = String(value).toLowerCase();

      // Function to recursively search through nested objects
      const searchInValue = (val: any): boolean => {
        if (val === null || val === undefined) return false;

        if (
          typeof val === "string" ||
          typeof val === "number" ||
          typeof val === "boolean"
        ) {
          return String(val).toLowerCase().includes(search);
        }

        if (typeof val === "object" && !Array.isArray(val)) {
          return Object.values(val).some(searchInValue);
        }

        if (Array.isArray(val)) {
          return val.some(searchInValue);
        }

        return false;
      };

      return searchInValue(row.original);
    },

    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
  });

  const filteredData = data?.map((item) => {
    const {
      // @ts-ignore
      // updatedAt,
      // @ts-ignore
      // createdAt
      // @ts-ignore,
      deletedAt,
      // @ts-ignore
      id,
      // @ts-ignore
      address,
      // @ts-ignore
      organization,
      // @ts-ignore
      donor,
      // @ts-ignore
      donation,

      ...rest
    } = item;
    return rest;
  });

  return (
    <div className="w-full">
      <div
        className={`flex flex-col justify-center w-full mb-4 ${
          searchHide ? "hidden" : ""
        }`}
      >
        {filterComponent}

        <div
          className={`w-full flex py-2 items-center ${
            searchOnlyHide ? "justify-end" : "justify-between"
          }`}
        >
          <Input
            placeholder="Filter data..."
            value={inputValue}
            onChange={handleInputChange}
            className={`max-w-sm ${searchHide ? "hidden" : ""} ${
              searchOnlyHide ? "hidden" : ""
            }`}
          />
            
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="h-9 border-border text-muted-foreground hover:bg-muted font-bold uppercase tracking-widest text-[10px] rounded-none"
                >
                  <Printer className="w-4 h-4 mr-2" /> Print
                </Button>
            {showExport && heads && heads.length > 0 && (
              <CSVLink
                data={filteredData}
                headers={heads}
                filename={"data.csv"}
                className={cn(
                  buttonVariants({ size: "sm", variant: "outline" }),
                  "h-9 border-border text-muted-foreground hover:bg-muted font-bold uppercase tracking-widest text-[10px] rounded-none flex items-center gap-2",
                )}
              >
                <Download className="size-4" />
                Export CSV
              </CSVLink>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="capitalize">
                  <Settings2 />
                  Views
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="uppercase"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value: any) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="rounded-md border" ref={tableRef}>
        <div className="hidden print:block text-primary text-center py-4 font-bold text-lg">
          <h2>{tableHeading}</h2>
          <span>Table Export - {new Date().toLocaleDateString()}</span>
        </div>
        <Table className="">
          <TableHeader className="bg-muted/30 dark:bg-zinc-900/50 border-b border-border">
            {table?.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                <TableHead className="text-muted-foreground dark:text-slate-400 text-center font-bold h-11 uppercase tracking-wider text-[12px] border-none w-16">
                  S.N
                </TableHead>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="text-muted-foreground dark:text-slate-400 text-left font-bold h-11 uppercase tracking-wider text-[12px] border-none px-4"
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <>
                {sortable ? (
                  <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={data.map((i) => i.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {data.map((item, index) => (
                        <SortableRows
                          key={item.id}
                          item={item}
                          meta={meta}
                          row={table.getRowModel().rows[index]}
                          index={index}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                ) : (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={`hover:bg-muted/50 transition-colors border-b border-border ${onRowClick ? 'cursor-pointer' : ''}`}
                      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                    >
                      <TableCell className="text-center font-medium py-4">
                        {meta
                          ? (meta.page - 1) * meta.take + index + 1
                          : row.index + 1}
                      </TableCell>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="py-4 px-4"
                        >
                          <div className="flex justify-start">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns?.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} meta={meta} />
    </div>
  );
}