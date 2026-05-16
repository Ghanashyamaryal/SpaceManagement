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
  meta,
}: DataTablePaginationProps<TData>) {
  const [searchParam, setSearchParams] = useSearchParams();
  if (!meta) {
    return null;
  }

  return (
    <div className={`flex items-center justify-end px-2 mt-6 ${meta.itemCount <= 0 ? "hidden" : ""}`}>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <p className="text-sm font-medium capitalize">
          Total rows: {meta.itemCount}
        </p>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${meta?.take}`}
            onValueChange={(value) => {
              searchParam.set("take", value);
              searchParam.set("page", "1");
              setSearchParams(searchParam);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={10} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Jump to page</p>
          <Select
            value={`${meta?.page}`}
            onValueChange={(value) => {
              searchParam.set("page", value);
              setSearchParams(searchParam);
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={meta?.page} />
            </SelectTrigger>
            <SelectContent side="top">
              {Array.from({ length: meta.pageCount }, (_, i) => (
                <SelectItem key={i + 1} value={`${i + 1}`}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {meta?.page} of {meta?.pageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              searchParam.set("page", "1");
              setSearchParams(searchParam);
            }}
            disabled={!meta?.hasPreviousPage}
          >
            <span className="sr-only">Go to first page</span>
            {`<<`}
            {/* <DoubleArrowLeftIcon className="h-4 w-4" /> */}
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              const previousPage = Math.max(1, meta.page - 1);
              searchParam.set("page", `${previousPage}`);
              setSearchParams(searchParam);
            }}
            disabled={!meta?.hasPreviousPage}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => {
              const nextPage = Math.min(meta.pageCount, meta.page + 1);
              searchParam.set("page", `${nextPage}`);
              setSearchParams(searchParam);
            }}
            disabled={!meta?.hasNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => {
              searchParam.set("page", `${meta.pageCount}`);
              setSearchParams(searchParam);
            }}
            disabled={!meta?.hasNextPage}
          >
            <span className="sr-only">Go to last page</span>
            {/* <DoubleArrowRightIcon className="h-4 w-4" /> */}
            {`>>`}
          </Button>
        </div>
      </div>
    </div>
  );
}