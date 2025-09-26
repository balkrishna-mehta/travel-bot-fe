"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { IconCheck, IconEdit, IconTrash, IconUser } from "@tabler/icons-react";
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
import { TableActions } from "@/components/common/table-actions";
import { UserAvatarCell } from "@/components/common/user-avatar-cell";
import { ManagerModal } from "./manager-modal";
import { managerSchema, ManagerCreateUpdate } from "@/types/managers.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchManagers,
  updateManager,
  createManager,
  toggleManagerStatus,
} from "@/api/managers";
import { ManagerFilters } from "@/types/managers.types";
import {
  TableLoadingState,
  TableErrorState,
} from "@/components/common/loading-spinner";
import { Status } from "@/types/status.types";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useUrlFilters } from "@/hooks/use-url-filters";
import { useAuthLoading } from "@/hooks/use-auth-loading";
export type Manager = z.infer<typeof managerSchema>;

// Sample data
// const sampleManagers: Manager[] = [
//   {
//     id: 1,
//     name: "Sarah Johnson",
//     email: "sarah.johnson@company.com",
//     phone: "9000012345",
//     department: "Engineering",
//     team_size: 12,
//     status: "Active",
//     avatar:
//       "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face",
//   },
//   {
//     id: 2,
//     name: "Michael Brown",
//     email: "michael.brown@company.com",
//     phone: "9000012346",
//     department: "Marketing",
//     team_size: 8,
//     status: "Active",
//     avatar:
//       "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=32&h=32&fit=crop&crop=face",
//   },
//   {
//     id: 3,
//     name: "Lisa Anderson",
//     email: "lisa.anderson@company.com",
//     phone: "9000012347",
//     department: "Sales",
//     team_size: 15,
//     status: "Active",
//     avatar:
//       "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=32&h=32&fit=crop&crop=face",
//   },
//   {
//     id: 4,
//     name: "Robert Taylor",
//     email: "robert.taylor@company.com",
//     phone: "9000012348",
//     department: "HR",
//     team_size: 6,
//     status: "Active",
//     avatar:
//       "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face",
//   },
//   {
//     id: 5,
//     name: "Jennifer White",
//     email: "jennifer.white@company.com",
//     phone: "9000012349",
//     department: "Finance",
//     team_size: 10,
//     status: "Inactive",
//     avatar:
//       "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
//   },
//   {
//     id: 6,
//     name: "David Martinez",
//     email: "david.martinez@company.com",
//     phone: "9000012350",
//     department: "Engineering",
//     team_size: 9,
//     status: "Active",
//     avatar:
//       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face",
//   },
//   {
//     id: 7,
//     name: "Emily Davis",
//     email: "emily.davis@company.com",
//     phone: "9000012351",
//     department: "Marketing",
//     team_size: 7,
//     status: "Active",
//     avatar:
//       "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face",
//   },
// ];

// Status configurations
const managerStatusConfigs = {
  Active: commonStatusConfigs.active,
  Inactive: commonStatusConfigs.inactive,
};

// Table columns definition
const createColumns = (
  onEdit: (manager: Manager) => void,
  onDeactivate: (manager: Manager, status: Status) => void,
  router: AppRouterInstance
): ColumnDef<Manager>[] => [
  createSelectionColumn<Manager>(),
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Manager</SortableColumnHeader>
    ),
    cell: ({ row }) => {
      const manager = row.original;
      return (
        <UserAvatarCell
          name={manager.name}
          avatar={manager.avatar}
          subtitle={manager.email}
        />
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>phone</SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">{row.original.phone}</div>
    ),
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
    accessorKey: "team_size",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Team Size</SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Badge variant="outline">{row.original.team_size} members</Badge>
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
        statusConfigs={managerStatusConfigs}
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
      const manager = row.original;
      const actionGroups = [
        {
          actions: [
            {
              label: "Edit Manager",
              icon: <IconEdit className="mr-2 h-4 w-4" />,
              onClick: () => onEdit(manager),
            },
            {
              label: "View Team Members",
              icon: <IconUser className="mr-2 h-4 w-4" />,
              onClick: () => {
                router.push(`/employees?manager_id=${manager.id}`);
              },
            },
          ],
          separator: true,
        },
        {
          actions: [
            {
              label: manager.status === "Active" ? "Deactivate" : "Activate",
              icon:
                manager.status === "Active" ? (
                  <IconTrash className="mr-2 h-4 w-4" />
                ) : (
                  <IconCheck className="mr-2 h-4 w-4" />
                ),
              onClick: () =>
                onDeactivate(
                  manager,
                  manager.status === "Active" ? Status.Inactive : Status.Active
                ),
              className:
                manager.status === "Active"
                  ? "text-destructive"
                  : "text-green-600",
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

export function ManagersTable() {
  const router = useRouter();
  const { setParam, setParams, getParam } = useUrlFilters();
  const queryClient = useQueryClient();
  const { isAuthReady } = useAuthLoading();
  // Get current filters from URL with proper defaults (always include page/size for API)
  const filters: ManagerFilters = React.useMemo(() => {
    // Always include page and size with defaults for API calls
    const page = getParam("page") ? parseInt(getParam("page")!) : 1;
    const size = getParam("size") ? parseInt(getParam("size")!) : 10;

    const result: ManagerFilters = {
      page,
      size,
    };

    // Only add optional filters if they exist
    const search = getParam("search");
    const department = getParam("department");
    const status = getParam("status");
    const manager_id = getParam("manager_id");
    const budget_band_id = getParam("budget_band_id");

    if (search) result.search = search;
    if (department) result.department = department;
    if (status) result.status = status;
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
    queryKey: ["managers", filters],
    queryFn: () => fetchManagers(filters),
    enabled: isAuthReady, // Only fetch when auth initialization is complete
  });

  console.log("apiData: ", apiData);

  const [selectedManager, setSelectedManager] = React.useState<Manager | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");

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

  const handleAddManager = React.useCallback(() => {
    setSelectedManager(null);
    setModalMode("add");
    setIsModalOpen(true);
  }, []);

  const handleEditManager = React.useCallback((manager: Manager) => {
    setSelectedManager(manager);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  const createManagerMutation = useMutation({
    mutationFn: createManager,
    onSuccess: () => {
      setIsModalOpen(false);
      setSelectedManager(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["managerKpis"] });
    },
    onError: (error) => {
      console.error("Failed to create manager:", error);
    },
  });

  const updateManagerMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ManagerCreateUpdate }) =>
      updateManager(id, data),
    onSuccess: () => {
      setIsModalOpen(false);
      setSelectedManager(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["managerKpis"] });
    },
    onError: (error) => {
      console.error("Failed to update manager:", error);
    },
  });

  const toggleManagerStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Status }) =>
      toggleManagerStatus(id, status),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["managerKpis"] });
    },
  });

  const handleSaveManager = React.useCallback(
    (managerData: ManagerCreateUpdate, id?: number) => {
      if (modalMode === "add") {
        createManagerMutation.mutate(managerData);
      } else if (id) {
        updateManagerMutation.mutate({ id, data: managerData });
      }
    },
    [modalMode, createManagerMutation, updateManagerMutation]
  );

  const handleDeactivateManager = React.useCallback(
    (manager: Manager, targetStatus: Status) => {
      toggleManagerStatusMutation.mutate({
        id: manager.id,
        status: targetStatus,
      });
    },
    [toggleManagerStatusMutation]
  );

  const columns = React.useMemo(
    () => createColumns(handleEditManager, handleDeactivateManager, router),
    [handleEditManager, handleDeactivateManager, router]
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
  ];

  return (
    <>
      <div className="rounded-lg border p-6">
        {isLoading && <TableLoadingState message="Loading managers..." />}
        {error && <TableErrorState error={error} onRetry={refetch} />}
        {apiData && (
          <BaseTable
            data={apiData?.users || []}
            columns={columns}
            searchColumn="name"
            searchPlaceholder="Filter managers..."
            filters={tableFilters}
            addButtonLabel="Add Manager"
            onAdd={handleAddManager}
            getRowId={(row) => String(row.id)}
            pagination={{
              page: filters.page || 1,
              pageSize: filters.size || 10,
              totalPages: apiData?.total
                ? Math.ceil(apiData.total / (filters.size || 10))
                : 1,
              totalItems: apiData?.total || 0,
            }}
            onPaginationChange={handlePaginationChange}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            currentFilters={{
              search: filters.search,
              status: filters.status,
              department: filters.department,
              manager_id: filters.manager_id,
              budget_band_id: filters.budget_band_id,
            }}
          />
        )}
      </div>

      <ManagerModal
        manager={selectedManager}
        onSave={handleSaveManager}
        mode={modalMode}
        trigger={null}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
