import * as React from "react";
import {
  IconChevronDown,
  IconArrowUp,
  IconArrowDown,
  IconEyeOff,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SortableColumnHeaderProps {
  column: any;
  children: React.ReactNode;
}

export function SortableColumnHeader({
  column,
  children,
}: SortableColumnHeaderProps) {
  const canSort = column.getCanSort();
  const sortDirection = column.getIsSorted();
  const isSorted = sortDirection !== false;

  if (!canSort) {
    return <div className="font-medium">{children}</div>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium hover:bg-transparent"
        >
          <div className="flex items-center gap-2">
            {children}
            {isSorted ? (
              sortDirection === "asc" ? (
                <IconArrowUp className="h-4 w-4" />
              ) : (
                <IconArrowDown className="h-4 w-4" />
              )
            ) : (
              <IconChevronDown className="h-4 w-4 opacity-50" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
          <IconArrowUp className="mr-2 h-4 w-4" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
          <IconArrowDown className="mr-2 h-4 w-4" />
          Desc
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
          <IconEyeOff className="mr-2 h-4 w-4" />
          Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
