"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { IconPlus, IconEdit } from "@tabler/icons-react";
import { Manager, ManagerCreateUpdate } from "@/types/managers.types";
import { managerCreateUpdateSchema } from "@/types/managers.types";

type ManagerFormData = z.infer<typeof managerCreateUpdateSchema>;

interface ManagerModalProps {
  manager?: Manager | null;
  onSave: (manager: ManagerCreateUpdate, id?: number) => void;
  trigger?: React.ReactNode;
  mode?: "add" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ManagerModal({
  manager = null,
  onSave,
  trigger,
  mode = "add",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: ManagerModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const form = useForm<ManagerFormData>({
    resolver: zodResolver(managerCreateUpdateSchema),
    defaultValues: {
      name: manager?.name || "",
      email: manager?.email || "",
      phone: manager?.phone || "",
      department: manager?.department || "",
      password: "",
    },
  });

  // Reset form when manager changes
  React.useEffect(() => {
    if (manager) {
      form.reset({
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        department: manager.department,
        password: "", // Password is never pre-filled for security
      });
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        department: "",
        password: "",
      });
    }
  }, [manager, form]);

  const onSubmit = (data: ManagerFormData) => {
    const managerData: ManagerCreateUpdate = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      department: data.department,
      password: "",
    };

    onSave(managerData, manager?.id);
    setOpen(false);
    form.reset();
  };

  const defaultTrigger =
    mode === "add" ? (
      <Button size="sm">
        <IconPlus className="mr-2 h-4 w-4" />
        Add Manager
      </Button>
    ) : (
      <Button variant="ghost" size="sm">
        <IconEdit className="mr-2 h-4 w-4" />
        Edit
      </Button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && controlledOpen === undefined && (
        <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "Add New Manager" : "Edit Manager"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add"
                ? "Fill in the details to add a new manager to the system."
                : "Update the manager information below."}
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
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="Enter email address"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <DepartmentCombobox
                  value={form.watch("department")}
                  onValueChange={(value) => form.setValue("department", value)}
                  placeholder="Department"
                  className="w-full"
                />
                {form.formState.errors.department && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.department.message}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              {mode === "add" ? "Add Manager" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
