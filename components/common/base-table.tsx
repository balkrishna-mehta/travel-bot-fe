"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLayoutColumns,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface FilterOption {
  label: string;
  value: string;
  column: string;
  placeholder: string;
  options: { label: string; value: string }[];
  customComponent?: React.ComponentType<{
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
  }>;
}

export interface BaseTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchColumn?: string;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  addButtonLabel?: string;
  onAdd?: () => void;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  initialPageSize?: number;
  getRowId?: (row: TData) => string;
  // Backend filtering props (optional - when provided, enables backend mode)
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  onPaginationChange?: (page: number, pageSize: number) => void;
  onFilterChange?: (key: string, value: string | undefined) => void;
  onSearchChange?: (search: string | undefined) => void;
  currentFilters?: Record<string, string | undefined>;
}

export function BaseTable<TData>({
  data,
  columns,
  searchColumn,
  searchPlaceholder = "Search...",
  filters = [],
  addButtonLabel,
  onAdd,
  enableRowSelection = true,
  enableColumnVisibility = true,
  initialPageSize = 10,
  getRowId,
  // Backend filtering props
  pagination,
  onPaginationChange,
  onFilterChange,
  onSearchChange,
  currentFilters = {},
}: BaseTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [frontendPagination, setFrontendPagination] = React.useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  // Determine if we're in backend mode
  const isBackendMode = !!(pagination && onPaginationChange);

  // Search state for debouncing in backend mode
  const [searchValue, setSearchValue] = React.useState(
    currentFilters.search || ""
  );

  // Debounce search in backend mode
  React.useEffect(() => {
    if (isBackendMode && onSearchChange) {
      const timer = setTimeout(() => {
        onSearchChange(searchValue || undefined);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchValue, onSearchChange, isBackendMode]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: frontendPagination,
    },
    getRowId: getRowId || ((row, index) => index.toString()),
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setFrontendPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: isBackendMode ? undefined : getFilteredRowModel(),
    getPaginationRowModel: isBackendMode ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: isBackendMode,
    manualFiltering: isBackendMode,
    pageCount: isBackendMode ? pagination?.totalPages || 0 : undefined,
  });

  return (
    <div className="w-full space-y-4">
      {/* Header with search and filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {searchColumn && (
            <div className="relative">
              <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={
                  isBackendMode
                    ? searchValue
                    : (table
                        .getColumn(searchColumn)
                        ?.getFilterValue() as string) ?? ""
                }
                onChange={(event) => {
                  if (isBackendMode) {
                    setSearchValue(event.target.value);
                  } else {
                    table
                      .getColumn(searchColumn)
                      ?.setFilterValue(event.target.value);
                  }
                }}
                className="pl-8 w-64"
              />
            </div>
          )}
          {filters.map((filter) => {
            const currentValue = isBackendMode
              ? currentFilters[filter.value] || ""
              : (table.getColumn(filter.column)?.getFilterValue() as string) ??
                "";

            if (filter.customComponent) {
              const CustomComponent = filter.customComponent;
              return (
                <CustomComponent
                  key={filter.column}
                  value={currentValue}
                  onValueChange={(value) => {
                    if (isBackendMode && onFilterChange) {
                      onFilterChange(filter.value, value || undefined);
                    } else {
                      table
                        .getColumn(filter.column)
                        ?.setFilterValue(value === "" ? "" : value);
                    }
                  }}
                  placeholder={filter.placeholder}
                  className="w-40"
                />
              );
            }

            return (
              <Select
                key={filter.column}
                value={currentValue}
                onValueChange={(value) => {
                  if (isBackendMode && onFilterChange) {
                    onFilterChange(
                      filter.value,
                      value === "all" ? undefined : value
                    );
                  } else {
                    table
                      .getColumn(filter.column)
                      ?.setFilterValue(value === "all" ? "" : value);
                  }
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.placeholder}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          })}
        </div>
        <div className="flex items-center space-x-2">
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <IconLayoutColumns className="mr-2 h-4 w-4" />
                  View
                  <IconChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="p-2">
                  <Label className="text-sm font-medium">Toggle columns</Label>
                </div>
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      typeof column.accessorFn !== "undefined" &&
                      column.getCanHide()
                  )
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {onAdd && addButtonLabel && (
            <Button size="sm" onClick={onAdd} className="cursor-pointer">
              <IconPlus className="mr-2 h-4 w-4" />
              {addButtonLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {enableRowSelection && !isBackendMode && (
            <>
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </>
          )}
          {enableRowSelection && isBackendMode && (
            <>
              {table.getSelectedRowModel().rows.length} of {data.length} row(s)
              selected.
            </>
          )}
          {!enableRowSelection && isBackendMode && pagination && (
            <>
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.totalItems
              )}{" "}
              of {pagination.totalItems} entries
            </>
          )}
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={
                isBackendMode
                  ? `${pagination?.pageSize || 10}`
                  : `${table.getState().pagination.pageSize}`
              }
              onValueChange={(value) => {
                if (isBackendMode && onPaginationChange && pagination) {
                  onPaginationChange(1, Number(value)); // Reset to page 1 when changing page size
                } else {
                  table.setPageSize(Number(value));
                }
              }}
            >
              <SelectTrigger className="h-8 w-20">
                <SelectValue
                  placeholder={
                    isBackendMode
                      ? pagination?.pageSize || 10
                      : table.getState().pagination.pageSize
                  }
                />
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
            <div className="text-sm font-medium">
              {isBackendMode && pagination ? (
                <>
                  Page {pagination.page} of {pagination.totalPages}
                </>
              ) : (
                <>
                  Page {table.getState().pagination.pageIndex + 1} of{" "}
                  {table.getPageCount()}
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => {
                  if (isBackendMode && onPaginationChange && pagination) {
                    onPaginationChange(1, pagination.pageSize);
                  } else {
                    table.setPageIndex(0);
                  }
                }}
                disabled={
                  isBackendMode
                    ? pagination?.page <= 1
                    : !table.getCanPreviousPage()
                }
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => {
                  if (isBackendMode && onPaginationChange && pagination) {
                    onPaginationChange(
                      pagination.page - 1,
                      pagination.pageSize
                    );
                  } else {
                    table.previousPage();
                  }
                }}
                disabled={
                  isBackendMode
                    ? pagination?.page <= 1
                    : !table.getCanPreviousPage()
                }
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => {
                  if (isBackendMode && onPaginationChange && pagination) {
                    onPaginationChange(
                      pagination.page + 1,
                      pagination.pageSize
                    );
                  } else {
                    table.nextPage();
                  }
                }}
                disabled={
                  isBackendMode
                    ? pagination?.page >= pagination?.totalPages
                    : !table.getCanNextPage()
                }
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => {
                  if (isBackendMode && onPaginationChange && pagination) {
                    onPaginationChange(
                      pagination.totalPages,
                      pagination.pageSize
                    );
                  } else {
                    table.setPageIndex(table.getPageCount() - 1);
                  }
                }}
                disabled={
                  isBackendMode
                    ? pagination?.page >= pagination?.totalPages
                    : !table.getCanNextPage()
                }
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to create selection column
export function createSelectionColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  };
}
