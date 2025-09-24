"use client";

import * as React from "react";
import { DepartmentCombobox } from "./department-combobox";

interface DepartmentFilterProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DepartmentFilter({
  value,
  onValueChange,
  placeholder = "Department",
  className,
}: DepartmentFilterProps) {
  return (
    <DepartmentCombobox
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      className={className}
    />
  );
}
