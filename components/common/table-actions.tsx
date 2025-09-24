import * as React from "react";
import { IconDotsVertical } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface TableAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export interface TableActionGroup {
  actions: TableAction[];
  separator?: boolean;
}

interface TableActionsProps {
  actionGroups: TableActionGroup[];
}

export function TableActions({ actionGroups }: TableActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
          size="icon"
        >
          <IconDotsVertical className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {actionGroups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {group.actions.map((action, actionIndex) => (
              <DropdownMenuItem
                key={actionIndex}
                onClick={action.onClick}
                className={action.className}
              >
                {action.icon}
                {action.label}
              </DropdownMenuItem>
            ))}
            {group.separator && groupIndex < actionGroups.length - 1 && (
              <DropdownMenuSeparator />
            )}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
