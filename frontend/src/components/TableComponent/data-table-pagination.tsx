import { Button } from "@Components/index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@Components/index";
import type { Table } from "@tanstack/react-table";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { useSearchParams } from "react-router-dom";

export type TQueryMeta = {
  page: number;
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

interface DataTablePaginationProps<TData> {
  table?: Table<TData>; // Optional since we're not using it
  meta?: TQueryMeta;
}

export function DataTablePagination<TData>({
  table,
  meta,
}: DataTablePaginationProps<TData>) {
  const [searchParam, setSearchParams] = useSearchParams();

  // If both are missing, we can't paginate
  if (!meta && !table) {
    return null;
  }

  // Derive values based on whether we are using server-side (meta) or client-side (table) pagination
  const isServerSide = !!meta;
  
  const totalRows = isServerSide ? meta.itemCount : table?.getFilteredRowModel().rows.length || 0;
  const pageSize = isServerSide ? meta.take : table?.getState().pagination.pageSize || 10;
  const currentPage = isServerSide ? meta.page : (table?.getState().pagination.pageIndex || 0) + 1;
  const pageCount = isServerSide ? meta.pageCount : table?.getPageCount() || 0;
  const hasPreviousPage = isServerSide ? meta.hasPreviousPage : table?.getCanPreviousPage();
  const hasNextPage = isServerSide ? meta.hasNextPage : table?.getCanNextPage();

  const handlePageSizeChange = (value: string) => {
    if (isServerSide) {
      searchParam.set("take", value);
      searchParam.set("page", "1");
      setSearchParams(searchParam);
    } else if (table) {
      table.setPageSize(Number(value));
    }
  };

  const handlePageChange = (value: string) => {
    if (isServerSide) {
      searchParam.set("page", value);
      setSearchParams(searchParam);
    } else if (table) {
      table.setPageIndex(Number(value) - 1);
    }
  };

  const handleFirstPage = () => {
    if (isServerSide) {
      searchParam.set("page", "1");
      setSearchParams(searchParam);
    } else if (table) {
      table.setPageIndex(0);
    }
  };

  const handlePreviousPage = () => {
    if (isServerSide) {
      const previousPage = Math.max(1, meta.page - 1);
      searchParam.set("page", `${previousPage}`);
      setSearchParams(searchParam);
    } else if (table) {
      table.previousPage();
    }
  };

  const handleNextPage = () => {
    if (isServerSide) {
      const nextPage = Math.min(meta.pageCount, meta.page + 1);
      searchParam.set("page", `${nextPage}`);
      setSearchParams(searchParam);
    } else if (table) {
      table.nextPage();
    }
  };

  const handleLastPage = () => {
    if (isServerSide) {
      searchParam.set("page", `${meta.pageCount}`);
      setSearchParams(searchParam);
    } else if (table) {
      table.setPageIndex(table.getPageCount() - 1);
    }
  };

  return (
    <div className={`flex items-center justify-end px-2 mt-6 ${totalRows <= 0 ? "hidden" : ""}`}>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <p className="text-sm font-medium capitalize">
          Total rows: {totalRows}
        </p>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={10} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Jump to page</p>
          <Select
            value={`${currentPage}`}
            onValueChange={handlePageChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={currentPage} />
            </SelectTrigger>
            <SelectContent side="top">
              {Array.from({ length: pageCount }, (_, i) => (
                <SelectItem key={i + 1} value={`${i + 1}`}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {pageCount || 1}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleFirstPage}
            disabled={!hasPreviousPage}
          >
            <span className="sr-only">Go to first page</span>
            {`<<`}
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={handleNextPage}
            disabled={!hasNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={handleLastPage}
            disabled={!hasNextPage}
          >
            <span className="sr-only">Go to last page</span>
            {`>>`}
          </Button>
        </div>
      </div>
    </div>
  );
}