"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { IconCheck, IconEdit, IconTrash, IconUsers } from "@tabler/icons-react";
import { z } from "zod";

import {
  BaseTable,
  createSelectionColumn,
} from "@/components/common/base-table";
import {
  StatusBadge,
  commonStatusConfigs,
} from "@/components/common/status-badge";
import { SortableColumnHeader } from "@/components/common/sortable-column-header";
import { TableActions } from "@/components/common/table-actions";
import { BudgetBandModal } from "@/components/budget-bands/budget-band-modal";
import {
  BudgetBandCreateUpdate,
  budgetBandSchema,
} from "@/types/budget-bands.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  TableLoadingState,
  TableErrorState,
} from "@/components/common/loading-spinner";
import {
  createBudgetBand,
  fetchBudgetBands,
  toggleBudgetBandStatus,
  updateBudgetBand,
} from "@/api/budget-bands";
import { useAuthLoading } from "@/hooks/use-auth-loading";
import { Status } from "@/types/status.types";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type BudgetBand = z.infer<typeof budgetBandSchema>;

// Sample data
// const sampleBudgetBands: BudgetBand[] = [
//   {
//     id: 1,
//     name: "Executive",
//     target: "Senior Executives & Directors",
//     flight_limit: 5000,
//     train_limit: 500,
//     hotel_limit: 300,
//     employee_count: 25,
//     status: "Active",
//   },
//   {
//     id: 2,
//     name: "Senior Management",
//     target: "Managers & Team Leads",
//     flight_limit: 3000,
//     train_limit: 300,
//     hotel_limit: 200,
//     employee_count: 85,
//     status: "Active",
//   },
//   {
//     id: 3,
//     name: "Management",
//     target: "Regular Employees",
//     flight_limit: 2000,
//     train_limit: 200,
//     hotel_limit: 150,
//     employee_count: 450,
//     status: "Active",
//   },
//   {
//     id: 4,
//     name: "Standard",
//     target: "Junior Staff & Interns",
//     flight_limit: 1000,
//     train_limit: 150,
//     hotel_limit: 100,
//     employee_count: 180,
//     status: "Active",
//   },
//   {
//     id: 5,
//     name: "Entry Level",
//     target: "Contractor & Temporary Staff",
//     flight_limit: 800,
//     train_limit: 100,
//     hotel_limit: 80,
//     employee_count: 45,
//     status: "Inactive",
//   },
// ];

// Status configurations
const budgetBandStatusConfigs = {
  Active: commonStatusConfigs.active,
  Inactive: commonStatusConfigs.inactive,
};

// Currency formatter
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Table columns definition
const createColumns = (
  onEdit: (budgetBand: BudgetBand) => void,
  onDeactivate: (budgetBand: BudgetBand, status: Status) => void,
  router: AppRouterInstance
): ColumnDef<BudgetBand>[] => [
  createSelectionColumn<BudgetBand>(),
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Band Name</SortableColumnHeader>
    ),
    cell: ({ row }) => {
      const budgetBand = row.original;
      return (
        <div className="flex flex-col">
          <div className="font-medium">{budgetBand.name}</div>
          <div className="text-sm text-muted-foreground">
            {budgetBand.target}
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "flight_limit",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Flight Limit</SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {formatCurrency(row.original.flight_limit)}
      </div>
    ),
  },
  {
    accessorKey: "train_limit",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Train Limit</SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {formatCurrency(row.original.train_limit)}
      </div>
    ),
  },
  {
    accessorKey: "hotel_limit",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Hotel Limit</SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        {formatCurrency(row.original.hotel_limit)}
      </div>
    ),
  },
  {
    accessorKey: "employee_count",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Employees</SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <IconUsers className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{row.original.employee_count}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Status</SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.status}
        statusConfigs={budgetBandStatusConfigs}
      />
    ),
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id) as string;
      return cellValue === value;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const budgetBand = row.original;
      const actionGroups = [
        {
          actions: [
            {
              label: "Edit Budget Band",
              icon: <IconEdit className="mr-2 h-4 w-4" />,
              onClick: () => onEdit(budgetBand),
            },
            {
              label: "View Assigned Employees",
              icon: <IconUsers className="mr-2 h-4 w-4" />,
              onClick: () => {
                router.push(`/employees?budget_band_id=${budgetBand.id}`);
              },
            },
          ],
          separator: true,
        },
        {
          actions: [
            {
              label: budgetBand.status === "Active" ? "Deactivate" : "Activate",
              icon:
                budgetBand.status === "Active" ? (
                  <IconTrash className="mr-2 h-4 w-4" />
                ) : (
                  <IconCheck className="mr-2 h-4 w-4" />
                ),
              onClick: () =>
                onDeactivate(
                  budgetBand,
                  budgetBand.status === "Active"
                    ? Status.Inactive
                    : Status.Active
                ),
              className:
                budgetBand.status === "Active"
                  ? "text-destructive"
                  : "text-green-500",
            },
          ],
          separator: false,
        },
      ];

      return <TableActions actionGroups={actionGroups} />;
    },
    enableHiding: false,
  },
];

export function BudgetBandsTable() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthReady } = useAuthLoading();

  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["budget-bands"],
    queryFn: () => fetchBudgetBands(),
    enabled: isAuthReady, // Only fetch when auth initialization is complete
  });

  const [selectedBudgetBand, setSelectedBudgetBand] =
    React.useState<BudgetBand | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");

  const createBudgetBandMutation = useMutation({
    mutationFn: createBudgetBand,
    onSuccess: (data) => {
      console.log("Budget band created successfully:", data);
      setIsModalOpen(false);
      setSelectedBudgetBand(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["budgetBandsKpis"] });
    },
    onError: (error: unknown) => {
      console.error("Failed to create budget band:", error);
      // You can add toast notification here if you have a toast library
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to create budget band: ${message}`);
    },
  });

  const updateBudgetBandMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BudgetBandCreateUpdate }) =>
      updateBudgetBand(id, data),
    onSuccess: (data) => {
      console.log("Budget band updated successfully:", data);
      setIsModalOpen(false);
      setSelectedBudgetBand(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["budgetBandsKpis"] });
    },
    onError: (error: unknown) => {
      console.error("Failed to update budget band:", error);
      // You can add toast notification here if you have a toast library
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to update budget band: ${message}`);
    },
  });

  const toggleBudgetBandStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Status }) =>
      toggleBudgetBandStatus(id, status),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["budgetBandsKpis"] });
    },
  });

  const handleAddBudgetBand = React.useCallback(() => {
    setSelectedBudgetBand(null);
    setModalMode("add");
    setIsModalOpen(true);
  }, []);

  const handleEditBudgetBand = React.useCallback((budgetBand: BudgetBand) => {
    setSelectedBudgetBand(budgetBand);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  const handleSaveBudgetBand = React.useCallback(
    (budgetBand: BudgetBand, id?: number) => {
      if (modalMode === "add") {
        createBudgetBandMutation.mutate(budgetBand);
      } else if (id) {
        updateBudgetBandMutation.mutate({ id, data: budgetBand });
      }
    },
    [modalMode, createBudgetBandMutation, updateBudgetBandMutation]
  );

  const handleDeactivateBudgetBand = React.useCallback(
    (budgetBand: BudgetBand) => {
      toggleBudgetBandStatusMutation.mutate({
        id: budgetBand.id,
        status:
          budgetBand.status === "Active" ? Status.Inactive : Status.Active,
      });
    },
    [toggleBudgetBandStatusMutation]
  );

  const columns = React.useMemo(
    () =>
      createColumns(handleEditBudgetBand, handleDeactivateBudgetBand, router),
    [handleEditBudgetBand, handleDeactivateBudgetBand, router]
  );

  const filters = [
    {
      label: "Status",
      value: "status",
      column: "status",
      placeholder: "Status",
      options: [
        { label: "Active", value: "Active" },
        { label: "Inactive", value: "Inactive" },
      ],
    },
  ];

  return (
    <>
      <div className="rounded-lg border p-6">
        {isLoading && <TableLoadingState message="Loading budget bands..." />}
        {error && <TableErrorState error={error} onRetry={refetch} />}
        {apiData && (
          <BaseTable
            data={apiData?.budget_bands || []}
            columns={columns}
            searchColumn="name"
            searchPlaceholder="Filter budget bands..."
            filters={filters}
            addButtonLabel="Add Budget Band"
            onAdd={handleAddBudgetBand}
            getRowId={(row) => String(row.id)}
          />
        )}
      </div>

      <BudgetBandModal
        budgetBand={selectedBudgetBand}
        onSave={handleSaveBudgetBand}
        mode={modalMode}
        trigger={null}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
