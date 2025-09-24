"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DepartmentComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const defaultDepartments = [
  { label: "Engineering", value: "Engineering" },
  { label: "Marketing", value: "Marketing" },
  { label: "Sales", value: "Sales" },
  { label: "HR", value: "HR" },
  { label: "Finance", value: "Finance" },
];

// Custom CommandInput without search icon
function CommandInputNoIcon({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center border-b px-3"
    >
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-8 w-full rounded-md bg-transparent py-2 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function DepartmentCombobox({
  value,
  onValueChange,
  placeholder = "Select department...",
  className,
  disabled = false,
}: DepartmentComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const [customDepartments, setCustomDepartments] = React.useState<
    { label: string; value: string }[]
  >([]);

  // Combine default departments with custom ones
  const allDepartments = React.useMemo(() => {
    const existing = [...defaultDepartments, ...customDepartments];
    // Remove duplicates
    const unique = existing.filter(
      (dept, index, arr) =>
        arr.findIndex((d) => d.value === dept.value) === index
    );
    return unique;
  }, [customDepartments]);

  const selectedDepartment = allDepartments.find(
    (dept) => dept.value === value
  );

  const handleSelect = (selectedValue: string) => {
    // If it's the same value, clear it
    if (selectedValue === value) {
      onValueChange("");
    } else {
      onValueChange(selectedValue);
    }
    setOpen(false);
  };

  const addCustomDepartment = (departmentName: string) => {
    const trimmedName = departmentName.trim();
    if (
      trimmedName &&
      !allDepartments.find(
        (dept) => dept.label.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      const newDept = { label: trimmedName, value: trimmedName };
      setCustomDepartments((prev) => [...prev, newDept]);
      onValueChange(trimmedName);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={disabled}
        >
          <span className="truncate">
            {selectedDepartment ? selectedDepartment.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInputNoIcon
            placeholder="Type department..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              <CustomDepartmentOption
                searchValue={searchValue}
                onAdd={addCustomDepartment}
              />
            </CommandEmpty>
            <CommandGroup>
              {allDepartments.map((department) => (
                <CommandItem
                  key={department.value}
                  value={department.value}
                  onSelect={handleSelect}
                >
                  {department.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === department.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Component to handle adding custom departments
function CustomDepartmentOption({
  searchValue,
  onAdd,
}: {
  searchValue: string;
  onAdd: (name: string) => void;
}) {
  const handleAdd = () => {
    if (searchValue.trim()) {
      onAdd(searchValue.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  if (!searchValue.trim()) {
    return <div className="py-6 text-center text-sm">No department found.</div>;
  }

  return (
    <div
      className="flex cursor-pointer items-center justify-between px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
      onClick={handleAdd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
    >
      <span>Add "{searchValue.trim()}"</span>
    </div>
  );
}
