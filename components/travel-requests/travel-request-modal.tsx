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
import { TravelRequest } from "@/types/travel-requests.types";

// Local form schema for UI fields (separate from API schema)
const travelRequestFormSchema = z.object({
  requestNumber: z.string().min(1),
  purpose: z.string().min(1),
  requestedDate: z.string().min(1),
  employeeId: z.number().nonnegative(),
  employeeName: z.string().min(1),
  employeeDepartment: z.string().min(1),
  employeeManager: z.string().min(1),
  destination: z.string().min(1),
  departureDate: z.string().min(1),
  returnDate: z.string().min(1),
  budget: z.number().nonnegative(),
  status: z.enum(["Pending", "Approved", "Rejected", "Completed"]),
  submittedDate: z.string().min(1),
});

type TravelRequestFormData = z.infer<typeof travelRequestFormSchema>;

interface TravelRequestModalProps {
  travelRequest?: TravelRequest | null;
  onSave: (travelRequest: TravelRequest) => void;
  trigger?: React.ReactNode;
  mode?: "add" | "edit";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Sample data for dropdowns
const statuses = ["Pending", "Approved", "Rejected", "Completed"] as const;

// Sample employees for dropdown
const employees = [
  {
    id: 1,
    name: "Sarah Johnson",
    department: "Engineering",
    manager: "John Smith",
  },
  {
    id: 2,
    name: "Michael Brown",
    department: "Marketing",
    manager: "Lisa Anderson",
  },
  { id: 3, name: "Emily Davis", department: "Sales", manager: "Robert Taylor" },
  {
    id: 4,
    name: "David Wilson",
    department: "Operations",
    manager: "Jennifer White",
  },
  {
    id: 5,
    name: "Maria Garcia",
    department: "Procurement",
    manager: "Alex Thompson",
  },
  {
    id: 6,
    name: "James Lee",
    department: "Engineering",
    manager: "John Smith",
  },
];

export function TravelRequestModal({
  travelRequest = null,
  onSave,
  trigger,
  mode = "add",
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: TravelRequestModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  const form = useForm<TravelRequestFormData>({
    resolver: zodResolver(travelRequestFormSchema),
    defaultValues: {
      requestNumber: "",
      purpose: travelRequest?.purpose || "",
      requestedDate: new Date().toISOString().split("T")[0],
      employeeId: 0,
      employeeName: "",
      employeeDepartment: "",
      employeeManager: "",
      destination: travelRequest?.destination || "",
      departureDate: travelRequest?.departure_date
        ? new Date(travelRequest.departure_date).toISOString().split("T")[0]
        : "",
      returnDate: travelRequest?.return_date
        ? new Date(travelRequest.return_date).toISOString().split("T")[0]
        : "",
      budget: 0,
      status: "Pending",
      submittedDate: new Date().toISOString().split("T")[0],
    },
  });

  // Reset form when travelRequest changes
  React.useEffect(() => {
    if (travelRequest) {
      form.reset({
        requestNumber: "",
        purpose: travelRequest.purpose || "",
        requestedDate: new Date().toISOString().split("T")[0],
        employeeId: 0,
        employeeName: "",
        employeeDepartment: "",
        employeeManager: "",
        destination: travelRequest.destination,
        departureDate: travelRequest.departure_date
          ? new Date(travelRequest.departure_date).toISOString().split("T")[0]
          : "",
        returnDate: travelRequest.return_date
          ? new Date(travelRequest.return_date).toISOString().split("T")[0]
          : "",
        budget: 0,
        status: "Pending",
        submittedDate: new Date().toISOString().split("T")[0],
      });
    } else {
      const today = new Date().toISOString().split("T")[0];

      form.reset({
        requestNumber: `TR-${String(Date.now()).slice(-3)}`,
        purpose: "",
        requestedDate: today,
        employeeId: 0,
        employeeName: "",
        employeeDepartment: "",
        employeeManager: "",
        destination: "",
        departureDate: "",
        returnDate: "",
        budget: 0,
        status: "Pending",
        submittedDate: today,
      });
    }
  }, [travelRequest, form]);

  // Update employee details when employee ID changes
  const selectedEmployeeId = form.watch("employeeId");
  React.useEffect(() => {
    const selectedEmployee = employees.find(
      (emp) => emp.id === selectedEmployeeId
    );
    if (selectedEmployee) {
      form.setValue("employeeName", selectedEmployee.name);
      form.setValue("employeeDepartment", selectedEmployee.department);
      form.setValue("employeeManager", selectedEmployee.manager);
    }
  }, [selectedEmployeeId, form]);

  const onSubmit = (data: TravelRequestFormData) => {
    // Map UI form fields to API payload
    const travelRequestData: TravelRequest = {
      id: travelRequest?.id || `req-${Date.now()}`,
      user_id: travelRequest?.user_id || `user-${data.employeeId}`,
      session_id: travelRequest?.session_id || `session-${Date.now()}`,
      version: travelRequest?.version || 1,
      purpose: data.purpose,
      destination: data.destination,
      departure_date: new Date(data.departureDate).toISOString(),
      return_date: new Date(data.returnDate).toISOString(),
      onward_options: travelRequest?.onward_options || [],
      return_options: travelRequest?.return_options || [],
      hotel_options: travelRequest?.hotel_options || [],
      selected_onward_index: travelRequest?.selected_onward_index || null,
      selected_return_index: travelRequest?.selected_return_index || null,
      selected_hotel_index: travelRequest?.selected_hotel_index || null,
      status: "Active",
      inactive_reason: null,
      manager_feedback: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: travelRequest?.user,
      session: travelRequest?.session,
    };

    onSave(travelRequestData);
    setOpen(false);
    form.reset();
  };

  const defaultTrigger =
    mode === "add" ? (
      <Button size="sm">
        <IconPlus className="mr-2 h-4 w-4" />
        Add Request
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === "add"
                ? "Add New Travel Request"
                : "Edit Travel Request"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add"
                ? "Fill in the details to create a new travel request."
                : "Update the travel request information below."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestNumber">Request Number *</Label>
                <Input
                  id="requestNumber"
                  {...form.register("requestNumber")}
                  placeholder="e.g., TR-001"
                />
                {form.formState.errors.requestNumber && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.requestNumber.message}
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

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose *</Label>
              <Textarea
                id="purpose"
                {...form.register("purpose")}
                placeholder="Describe the purpose of travel (e.g., Client Meeting, Conference, Training)"
                rows={2}
              />
              {form.formState.errors.purpose && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.purpose.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                        {employee.name} - {employee.department}
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

              <div className="space-y-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  {...form.register("destination")}
                  placeholder="e.g., New York, NY"
                />
                {form.formState.errors.destination && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.destination.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureDate">Departure Date *</Label>
                <Input
                  id="departureDate"
                  type="date"
                  {...form.register("departureDate")}
                />
                {form.formState.errors.departureDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.departureDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnDate">Return Date *</Label>
                <Input
                  id="returnDate"
                  type="date"
                  {...form.register("returnDate")}
                />
                {form.formState.errors.returnDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.returnDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget ($) *</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register("budget", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {form.formState.errors.budget && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.budget.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requestedDate">Requested Date *</Label>
                <Input
                  id="requestedDate"
                  type="date"
                  {...form.register("requestedDate")}
                />
                {form.formState.errors.requestedDate && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.requestedDate.message}
                  </p>
                )}
              </div>

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
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">
              {mode === "add" ? "Create Request" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
