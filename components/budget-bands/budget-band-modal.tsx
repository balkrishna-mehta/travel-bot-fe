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
import { Textarea } from "@/components/ui/textarea";
import { IconPlus, IconEdit } from "@tabler/icons-react";
import { BudgetBand } from "./budget-bands-table";
import { budgetBandCreateUpdateSchema } from "@/types/budget-bands.types";

type BudgetBandFormData = z.infer<typeof budgetBandCreateUpdateSchema>;

interface BudgetBandModalProps {
  budgetBand?: BudgetBand | null;
  onSave: (budgetBand: BudgetBand, id?: number) => void;
  trigger?: React.ReactNode;
  mode?: "add" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Sample data for dropdowns
const statuses = ["Active", "Inactive"] as const;

export function BudgetBandModal({
  budgetBand = null,
  onSave,
  trigger,
  mode = "add",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: BudgetBandModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const form = useForm<BudgetBandFormData>({
    resolver: zodResolver(budgetBandCreateUpdateSchema),
    defaultValues: {
      name: budgetBand?.name || "",
      target: budgetBand?.target || "",
      flight_limit: budgetBand?.flight_limit || 0,
      train_limit: budgetBand?.train_limit || 0,
      hotel_limit: budgetBand?.hotel_limit || 0,
    },
  });

  // Reset form when budgetBand changes
  React.useEffect(() => {
    if (budgetBand) {
      form.reset({
        name: budgetBand.name,
        target: budgetBand.target,
        flight_limit: budgetBand.flight_limit,
        train_limit: budgetBand.train_limit,
        hotel_limit: budgetBand.hotel_limit,
      });
    } else {
      form.reset({
        name: "",
        target: "",
        flight_limit: 0,
        train_limit: 0,
        hotel_limit: 0,
      });
    }
  }, [budgetBand, form]);

  const onSubmit = (data: BudgetBandFormData) => {
    // For the callback, we still need the full BudgetBand structure
    // but employee_count and status will be handled by the backend
    const budgetBandData: BudgetBand = {
      id: budgetBand?.id || Date.now(), // Generate ID for new budget bands
      name: data.name,
      target: data.target,
      flight_limit: data.flight_limit,
      train_limit: data.train_limit,
      hotel_limit: data.hotel_limit,
      employee_count: budgetBand?.employee_count || 0, // Keep existing or default
      status: budgetBand?.status || "Active", // Keep existing or default
    };

    onSave(budgetBandData, budgetBand?.id);
    setOpen(false);
    form.reset();
  };

  const defaultTrigger =
    mode === "add" ? (
      <Button size="sm">
        <IconPlus className="mr-2 h-4 w-4" />
        Add Budget Band
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
              {mode === "add" ? "Add New Budget Band" : "Edit Budget Band"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add"
                ? "Fill in the details to create a new budget band."
                : "Update the budget band information below."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Band Name *</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="e.g., Band A, Executive Level"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target *</Label>
                <Input
                  id="target"
                  {...form.register("target")}
                  placeholder="e.g., Senior Executives & Directors, Interns, etc."
                />
                {form.formState.errors.target && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.target.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="flight_limit">Flight Limit ($) *</Label>
                <Input
                  id="flight_limit"
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register("flight_limit", { valueAsNumber: true })}
                  placeholder="Maximum flight cost"
                />
                {form.formState.errors.flight_limit && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.flight_limit.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="train_limit">Train Limit ($) *</Label>
                <Input
                  id="train_limit"
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register("train_limit", { valueAsNumber: true })}
                  placeholder="Maximum train cost"
                />
                {form.formState.errors.train_limit && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.train_limit.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotel_limit">Hotel Limit ($) *</Label>
                <Input
                  id="hotel_limit"
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register("hotel_limit", { valueAsNumber: true })}
                  placeholder="Maximum hotel cost per night"
                />
                {form.formState.errors.hotel_limit && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.hotel_limit.message}
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
              {mode === "add" ? "Create Budget Band" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
