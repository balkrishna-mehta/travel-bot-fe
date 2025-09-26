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
import { IconPlus, IconEdit } from "@tabler/icons-react";
import { Invoice } from "./invoices-table";

// Local form schema for UI fields (separate from API schema)
const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1),
  employeeId: z.number().nonnegative(),
  employeeName: z.string().min(1),
  travelDestination: z.string().min(1),
  travelDates: z.string().min(1),
  category: z.enum(["Flight", "Hotel", "Train"]),
  amount: z.number().nonnegative(),
  status: z.enum(["Pending", "Approved", "Paid", "Rejected"]),
  submittedDate: z.string().min(1),
  dueDate: z.string().min(1),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceModalProps {
  invoice?: Invoice | null;
  onSave: (invoice: Partial<Invoice>) => void;
  trigger?: React.ReactNode;
  mode?: "add" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Sample data for dropdowns
const categories = ["Flight", "Hotel", "Train"] as const;
const statuses = ["Pending", "Approved", "Paid", "Rejected"] as const;

// Sample employees for dropdown
const employees = [
  { id: 1, name: "John Smith" },
  { id: 2, name: "Emily Davis" },
  { id: 3, name: "David Wilson" },
  { id: 4, name: "Maria Garcia" },
  { id: 5, name: "James Lee" },
  { id: 6, name: "Sarah Johnson" },
  { id: 7, name: "Michael Brown" },
];

export function InvoiceModal({
  invoice = null,
  onSave,
  trigger,
  mode = "add",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: InvoiceModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: "",
      employeeId: 0,
      employeeName: "",
      travelDestination: "",
      travelDates: "",
      category: invoice?.category || "Flight",
      amount: invoice?.amount || 0,
      status: "Pending",
      submittedDate: new Date().toISOString().split("T")[0],
      dueDate: "",
    },
  });

  // Reset form when invoice changes
  React.useEffect(() => {
    if (invoice) {
      form.reset({
        invoiceNumber: "",
        employeeId: 0,
        employeeName: "",
        travelDestination: "",
        travelDates: "",
        category: invoice.category,
        amount: invoice.amount,
        status: "Pending",
        submittedDate: new Date().toISOString().split("T")[0],
        dueDate: "",
      });
    } else {
      const today = new Date().toISOString().split("T")[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const dueDate = nextMonth.toISOString().split("T")[0];

      form.reset({
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(
          Date.now()
        ).slice(-4)}`,
        employeeId: 0,
        employeeName: "",
        travelDestination: "",
        travelDates: "",
        category: "Flight",
        amount: 0,
        status: "Pending",
        submittedDate: today,
        dueDate: dueDate,
      });
    }
  }, [invoice, form]);

  // Update employee name when employee ID changes
  const selectedEmployeeId = form.watch("employeeId");
  React.useEffect(() => {
    const selectedEmployee = employees.find(
      (emp) => emp.id === selectedEmployeeId
    );
    if (selectedEmployee) {
      form.setValue("employeeName", selectedEmployee.name);
    }
  }, [selectedEmployeeId, form]);

  const onSubmit = (data: InvoiceFormData) => {
    // Map UI form fields to minimal API payload
    const invoiceData: Partial<Invoice> = {
      category: data.category,
      amount: data.amount,
    };

    onSave(invoiceData);
    setOpen(false);
    form.reset();
  };

  const defaultTrigger =
    mode === "add" ? (
      <Button size="sm">
        <IconPlus className="mr-2 h-4 w-4" />
        Add Invoice
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "Add New Invoice" : "Edit Invoice"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add"
                ? "Fill in the details to create a new invoice."
                : "Update the invoice information below."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                <Input
                  id="invoiceNumber"
                  {...form.register("invoiceNumber")}
                  placeholder="e.g., INV-2025-0001"
                />
                {form.formState.errors.invoiceNumber && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.invoiceNumber.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee *</Label>
                <Select
                  value={form.watch("employeeId").toString()}
                  onValueChange={(value) =>
                    form.setValue("employeeId", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id.toString()}
                      >
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.employeeId && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.employeeId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="travelDestination">Travel Destination *</Label>
                <Input
                  id="travelDestination"
                  {...form.register("travelDestination")}
                  placeholder="e.g., New York, NY"
                />
                {form.formState.errors.travelDestination && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.travelDestination.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="travelDates">Travel Dates *</Label>
                <Input
                  id="travelDates"
                  {...form.register("travelDates")}
                  placeholder="e.g., Jan 15-18, 2025"
                />
                {form.formState.errors.travelDates && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.travelDates.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(value) =>
                    form.setValue(
                      "category",
                      value as (typeof categories)[number]
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.category && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register("amount", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.amount.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={form.watch("status")}
                  onValueChange={(value) =>
                    form.setValue("status", value as (typeof statuses)[number])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.status && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.status.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submittedDate">Submitted Date *</Label>
                <Input
                  id="submittedDate"
                  type="date"
                  {...form.register("submittedDate")}
                />
                {form.formState.errors.submittedDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.submittedDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input id="dueDate" type="date" {...form.register("dueDate")} />
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.dueDate.message}
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
              {mode === "add" ? "Create Invoice" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
