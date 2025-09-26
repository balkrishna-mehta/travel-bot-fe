"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { IconEdit, IconCheck, IconTrash } from "@tabler/icons-react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import {
  BaseTable,
  createSelectionColumn,
} from "@/components/common/base-table";
import {
  StatusBadge,
  commonStatusConfigs,
} from "@/components/common/status-badge";
import { SortableColumnHeader } from "@/components/common/sortable-column-header";
import {
  TableActions,
  TableActionGroup,
} from "@/components/common/table-actions";
import { UserAvatarCell } from "@/components/common/user-avatar-cell";
import { MapPin } from "lucide-react";
import { EmployeeModal } from "./employee-modal";
import { employeeSchema, EmployeeCreateUpdate } from "@/types/employees.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchEmployees,
  updateEmployee,
  toggleEmployeeStatus,
} from "@/api/employees";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { useAuthLoading } from "@/hooks/use-auth-loading";
import {
  TableLoadingState,
  TableErrorState,
} from "@/components/common/loading-spinner";
import { Status } from "@/types/status.types";
import { fetchManagers } from "@/api/managers";
import { fetchBudgetBands } from "@/api/budget-bands";

export type Employee = z.infer<typeof employeeSchema>;

// Status configurations
const employeeStatusConfigs = {
  Active: commonStatusConfigs.active,
  Inactive: commonStatusConfigs.inactive,
};

const registrationStatusConfigs = {
  Approved: commonStatusConfigs.approved,
  Pending: commonStatusConfigs.pending,
  Rejected: commonStatusConfigs.rejected,
};

// Table columns definition
const createColumns = (
  onEdit: (employee: Employee) => void,
  onDeactivate: (employee: Employee, status: Status) => void
): ColumnDef<Employee>[] => [
  createSelectionColumn<Employee>(),
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Employee</SortableColumnHeader>
    ),
    cell: ({ row }) => {
      const employee = row.original;
      return (
        <UserAvatarCell
          name={employee.name}
          avatar={employee.avatar}
          phone={employee.phone}
        />
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "department",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Department</SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">{row.original.department}</div>
    ),
  },
  {
    accessorKey: "budget_band",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Budget Band</SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {row.original.budget_band?.name || "N/A"}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "manager",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Manager</SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.manager?.name}
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
        statusConfigs={employeeStatusConfigs}
      />
    ),
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id) as string;
      return cellValue === value;
    },
  },
  {
    accessorKey: "registration",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Registration</SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.registration}
        statusConfigs={registrationStatusConfigs}
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
      const employee = row.original;
      const actionGroups: TableActionGroup[] = [
        {
          actions: [
            {
              label: "Edit Employee",
              icon: <IconEdit className="mr-2 h-4 w-4" />,
              onClick: () => onEdit(employee),
            },
            {
              label: "View Travel History",
              icon: <MapPin className="mr-2 h-4 w-4" />,
              onClick: () => {},
            },
          ],
          separator: true,
        },
      ];

      actionGroups.push({
        actions: [
          {
            label: employee.status === "Active" ? "Deactivate" : "Activate",
            icon:
              employee.status === "Active" ? (
                <IconTrash className="mr-2 h-4 w-4" />
              ) : (
                <IconCheck className="mr-2 h-4 w-4" />
              ),
            onClick: () =>
              onDeactivate(
                employee,
                employee.status === "Active" ? Status.Inactive : Status.Active
              ),
            className:
              employee.status === "Active"
                ? "text-destructive"
                : "text-green-600",
          },
        ],
        separator: false,
      });

      return <TableActions actionGroups={actionGroups} />;
    },
    enableHiding: false,
  },
];

export function EmployeesTable() {
  const { setParam, setParams, getParam } = useUrlFilters();
  const queryClient = useQueryClient();
  const { isAuthReady } = useAuthLoading();
  // Get current filters from URL with proper defaults (always include page/size for API)
  const filters = React.useMemo(() => {
    // Always include page and size with defaults for API calls
    const page = getParam("page") ? parseInt(getParam("page")!) : 1;
    const size = getParam("size") ? parseInt(getParam("size")!) : 10;

    const result: Record<string, string | number> = {
      page,
      size,
    };

    // Only add optional filters if they exist
    const search = getParam("search");
    const department = getParam("department");
    const status = getParam("status");
    const registration = getParam("registration");
    const manager_id = getParam("manager_id");
    const budget_band_id = getParam("budget_band_id");

    if (search) result.search = search;
    if (department) result.department = department;
    if (status) result.status = status;
    if (registration) result.registration = registration;
    if (manager_id) result.manager_id = manager_id;
    if (budget_band_id) result.budget_band_id = budget_band_id;

    return result;
  }, [getParam]);

  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["employees", filters],
    queryFn: () => fetchEmployees(filters),
    enabled: isAuthReady, // Only fetch when auth initialization is complete
  });

  const [selectedEmployee, setSelectedEmployee] =
    React.useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Handler for filter changes
  const handleFilterChange = React.useCallback(
    (key: string, value: string | undefined) => {
      setParam(key, value);
    },
    [setParam]
  );

  // Handler for search changes
  const handleSearchChange = React.useCallback(
    (search: string | undefined) => {
      setParam("search", search);
    },
    [setParam]
  );

  // Handler for pagination changes
  const handlePaginationChange = React.useCallback(
    (page: number, pageSize: number) => {
      setParams({
        page: page.toString(),
        size: pageSize.toString(),
      });
    },
    [setParams]
  );

  const {
    data: managersData,
    // isLoading: isLoadingManagers,
    // error: errorManagers,
    // refetch: refetchManagers,
  } = useQuery({
    queryKey: ["managers"],
    queryFn: () => fetchManagers(),
  });

  const {
    data: budgetBandsData,
    // isLoading: isLoadingBudgetBands,
    // error: errorBudgetBands,
    // refetch: refetchBudgetBands,
  } = useQuery({
    queryKey: ["budget-bands"],
    queryFn: () => fetchBudgetBands(),
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({
      id,
      employee,
    }: {
      id: number;
      employee: EmployeeCreateUpdate;
    }) => updateEmployee(id, employee),
    onSuccess: () => {
      refetch();
      setIsModalOpen(false);
      setSelectedEmployee(null);
      queryClient.invalidateQueries({ queryKey: ["employeeKpis"] });
    },
    onError: (error) => {
      console.error("Failed to update employee:", error);
      // Toast notification could be added here for better UX
    },
  });

  const toggleEmployeeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Status }) =>
      toggleEmployeeStatus(id, status),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["employeeKpis"] });
    },
  });

  const handleEditEmployee = React.useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  }, []);

  const handleSaveEmployee = React.useCallback(
    (employee: Employee) => {
      const updateData = {
        name: employee.name,
        phone: employee.phone,
        department: employee.department,
        budget_band_id: employee.budget_band_id,
        manager_id: employee.manager_id,
      };

      updateEmployeeMutation.mutate({
        id: employee.id,
        employee: updateData,
      });
    },
    [updateEmployeeMutation]
  );

  const handleDeactivateEmployee = React.useCallback(
    (employee: Employee) => {
      toggleEmployeeStatusMutation.mutate({
        id: employee.id,
        status: employee.status === "Active" ? Status.Inactive : Status.Active,
      });
    },
    [toggleEmployeeStatusMutation]
  );

  const columns = React.useMemo(
    () => createColumns(handleEditEmployee, handleDeactivateEmployee),
    [handleEditEmployee, handleDeactivateEmployee]
  );

  const tableFilters = [
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
    {
      label: "Registration",
      value: "registration",
      column: "registration",
      placeholder: "Registration",
      options: [
        { label: "Approved", value: "Approved" },
        { label: "Pending", value: "Pending" },
        { label: "Rejected", value: "Rejected" },
      ],
    },
  ];

  return (
    <>
      <div className="rounded-lg border p-6">
        {isLoading && <TableLoadingState message="Loading employees..." />}
        {error && <TableErrorState error={error} onRetry={refetch} />}
        {apiData && (
          <BaseTable
            data={apiData?.users || []}
            columns={columns}
            searchColumn="name"
            searchPlaceholder="Filter employees..."
            filters={tableFilters}
            getRowId={(row: Employee) => String(row.id)}
            pagination={{
              page: Number(filters.page) || 1,
              pageSize: Number(filters.size) || 10,
              totalPages: apiData?.total
                ? Math.ceil(apiData.total / (Number(filters.size) || 10))
                : 1,
              totalItems: apiData?.total || 0,
            }}
            onPaginationChange={handlePaginationChange}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            currentFilters={{
              search:
                typeof filters.search === "string" ? filters.search : undefined,
              status:
                typeof filters.status === "string" ? filters.status : undefined,
              registration:
                typeof filters.registration === "string"
                  ? filters.registration
                  : undefined,
              department:
                typeof filters.department === "string"
                  ? filters.department
                  : undefined,
              manager_id:
                typeof filters.manager_id === "string"
                  ? filters.manager_id
                  : undefined,
              budget_band_id:
                typeof filters.budget_band_id === "string"
                  ? filters.budget_band_id
                  : undefined,
            }}
          />
        )}
      </div>

      <EmployeeModal
        employee={selectedEmployee}
        onSave={handleSaveEmployee}
        trigger={null}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        managers={managersData?.users || []}
        budgetBands={budgetBandsData?.budget_bands || []}
      />
    </>
  );
}
