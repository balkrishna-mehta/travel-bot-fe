"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepartmentCombobox } from "@/components/common/department-combobox";
import { IconEdit } from "@tabler/icons-react";
import { Employee } from "./employees-table";
import {
  employeeCreateUpdateSchema,
  EmployeeCreateUpdate,
} from "@/types/employees.types";
import { Manager } from "@/types/managers.types";
import { BudgetBand } from "@/types/budget-bands.types";

type EmployeeFormData = EmployeeCreateUpdate;

interface EmployeeModalProps {
  employee: Employee | null;
  onSave: (employee: Employee) => void;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  managers?: Manager[];
  budgetBands?: BudgetBand[];
}

export function EmployeeModal({
  employee,
  onSave,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  managers = [],
  budgetBands = [],
}: EmployeeModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeCreateUpdateSchema),
    defaultValues: {
      name: employee?.name || "",
      phone: employee?.phone || "",
      department: employee?.department || "",
      budget_band_id: employee?.budget_band?.id?.toString() || "",
      manager_id: employee?.manager?.id?.toString() || "",
    },
  });

  // Reset form when employee changes
  React.useEffect(() => {
    if (employee) {
      form.reset({
        name: employee.name,
        phone: employee.phone,
        department: employee.department,
        budget_band_id: employee.budget_band?.id?.toString(),
        manager_id: employee.manager?.id?.toString(),
      });
    }
  }, [employee, form]);

  const onSubmit = (data: EmployeeFormData) => {
    if (!employee) return;

    const employeeData: Employee = {
      ...employee,
      name: data.name,
      phone: data.phone,
      department: data.department,
      budget_band_id: data.budget_band_id,
      manager_id: data.manager_id,
      updated_at: new Date().toISOString(),
    };

    onSave(employeeData);
    // Note: Don't close modal here - let the parent component handle it after successful API call
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" disabled={!employee}>
      <IconEdit className="mr-2 h-4 w-4" />
      Edit
    </Button>
  );

  if (!employee) {
    return trigger ? <>{trigger}</> : defaultTrigger;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && controlledOpen === undefined && (
        <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update the employee information below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Enter full name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  {...form.register("phone")}
                  placeholder="Enter phone number"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget_band_id">Budget Band *</Label>
                <Select
                  value={form.watch("budget_band_id")}
                  onValueChange={(value) =>
                    form.setValue("budget_band_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget band" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetBands.map((band) => (
                      <SelectItem key={band.id} value={band.id.toString()}>
                        {band.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.budget_band_id && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.budget_band_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager_id">Manager *</Label>
                <Select
                  value={form.watch("manager_id")}
                  onValueChange={(value) => form.setValue("manager_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem
                        key={manager.id}
                        value={manager.id.toString()}
                      >
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.manager_id && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.manager_id.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <DepartmentCombobox
                value={form.watch("department")}
                onValueChange={(value) => form.setValue("department", value)}
                placeholder="Select or type department"
                className="w-full"
              />
              {form.formState.errors.department && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.department.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
