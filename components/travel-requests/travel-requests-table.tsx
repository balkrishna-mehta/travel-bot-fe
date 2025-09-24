"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  IconEdit,
  IconTrash,
  IconEye,
  IconCheck,
  IconX,
  IconCalendar,
  IconMapPin,
} from "@tabler/icons-react";
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
import {
  TableActions,
  TableActionGroup,
} from "@/components/common/table-actions";
import { UserAvatarCell } from "@/components/common/user-avatar-cell";
import { TravelRequestModal } from "@/components/travel-requests/travel-request-modal";
import {
  TravelRequest,
  travelRequestSchema,
} from "@/types/travel-requests.types";
import { useQuery } from "@tanstack/react-query";
import {
  TableLoadingState,
  TableErrorState,
} from "@/components/common/loading-spinner";
import { fetchTravelRequests } from "@/api/travel-requests";

// Status configurations
const travelRequestStatusConfigs = {
  Active: commonStatusConfigs.approved,
  Inactive: commonStatusConfigs.rejected,
};

// Currency formatter
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Date formatter
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Table columns definition
const createColumns = (
  onEdit: (request: TravelRequest) => void,
  onActivate: (request: TravelRequest) => void,
  onDeactivate: (request: TravelRequest) => void
): ColumnDef<TravelRequest>[] => [
  createSelectionColumn<TravelRequest>(),
  {
    accessorKey: "id",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>
        Request Details
      </SortableColumnHeader>
    ),
    cell: ({ row }) => {
      const request = row.original;
      return (
        <div className="flex flex-col">
          <div className="font-medium text-blue-600">{request.id}</div>
          <div className="text-sm font-medium">
            {request.purpose || "No purpose specified"}
          </div>
          <div className="text-xs text-muted-foreground">
            Created: {formatDate(request.created_at)}
          </div>
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "user.name",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Employee</SortableColumnHeader>
    ),
    cell: ({ row }) => {
      const request = row.original;
      return (
        <UserAvatarCell
          name={request.user?.name || "Unknown User"}
          avatar={undefined}
          subtitle={request.user?.department || "Unknown Department"}
        />
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "destination",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Travel Info</SortableColumnHeader>
    ),
    cell: ({ row }) => {
      const request = row.original;
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 font-medium">
            <IconMapPin className="h-3 w-3 text-muted-foreground" />
            {request.destination}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <IconCalendar className="h-3 w-3" />
            {formatDate(request.departure_date)} -{" "}
            {formatDate(request.return_date)}
          </div>
        </div>
      );
    },
  },
  {
    id: "session.status",
    accessorKey: "session.status",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>
        Session Status
      </SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.session?.status || "Unknown"}
        statusConfigs={{
          InUserSelection: {
            variant: "secondary",
            className: "bg-yellow-500 text-white hover:bg-yellow-600",
          },
          Success: {
            variant: "default",
            className: "bg-green-600 text-white hover:bg-green-700",
          },
          Failed: {
            variant: "destructive",
            className: "bg-red-600 text-white hover:bg-red-700",
          },
        }}
      />
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
        statusConfigs={travelRequestStatusConfigs}
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
      const request = row.original;
      const actionGroups: TableActionGroup[] = [
        {
          actions: [
            {
              label: "Edit Request",
              icon: <IconEdit className="mr-2 h-4 w-4" />,
              onClick: () => onEdit(request),
            },
            {
              label: "View Details",
              icon: <IconEye className="mr-2 h-4 w-4" />,
              onClick: () => {},
            },
          ],
          separator: request.status === "Active",
        },
      ];

      if (request.status === "Active") {
        actionGroups.push({
          actions: [
            {
              label: "Deactivate Request",
              icon: <IconX className="mr-2 h-4 w-4" />,
              onClick: () => onDeactivate(request),
              className: "text-destructive",
            },
          ],
          separator: true,
        });
      } else {
        actionGroups.push({
          actions: [
            {
              label: "Activate Request",
              icon: <IconCheck className="mr-2 h-4 w-4" />,
              onClick: () => onActivate(request),
              className: "text-green-600",
            },
          ],
          separator: true,
        });
      }

      actionGroups.push({
        actions: [
          {
            label: "Delete",
            icon: <IconTrash className="mr-2 h-4 w-4" />,
            onClick: () => {},
            className: "text-destructive",
          },
        ],
        separator: false,
      });

      return <TableActions actionGroups={actionGroups} />;
    },
    enableHiding: false,
  },
];

export function TravelRequestsTable() {
  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["travel-requests"],
    queryFn: () => fetchTravelRequests(),
  });

  const [selectedRequest, setSelectedRequest] =
    React.useState<TravelRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");

  const handleAddRequest = React.useCallback(() => {
    setSelectedRequest(null);
    setModalMode("add");
    setIsModalOpen(true);
  }, []);

  const handleEditRequest = React.useCallback((request: TravelRequest) => {
    setSelectedRequest(request);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  const handleSaveRequest = React.useCallback(
    (request: TravelRequest) => {
      // For now, just close the modal. In a real app, you'd make an API call here
      setIsModalOpen(false);
      setSelectedRequest(null);
      // Refetch data to get the latest from API
      refetch();
    },
    [refetch]
  );

  const handleActivateRequest = React.useCallback(
    (request: TravelRequest) => {
      // In a real app, make API call here
      console.log("Activating request:", request);
      // For now, just refetch data
      refetch();
    },
    [refetch]
  );

  const handleDeactivateRequest = React.useCallback(
    (request: TravelRequest) => {
      // In a real app, make API call here
      console.log("Deactivating request:", request);
      // For now, just refetch data
      refetch();
    },
    [refetch]
  );

  const columns = React.useMemo(
    () =>
      createColumns(
        handleEditRequest,
        handleActivateRequest,
        handleDeactivateRequest
      ),
    [handleEditRequest, handleActivateRequest, handleDeactivateRequest]
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
    {
      label: "Session Status",
      value: "session.status",
      column: "session.status",
      placeholder: "Session Status",
      options: [
        { label: "In Selection", value: "InUserSelection" },
        { label: "Success", value: "Success" },
        { label: "Failed", value: "Failed" },
      ],
    },
  ];

  if (isLoading) {
    return <TableLoadingState message="Loading travel requests..." />;
  }

  if (error) {
    return <TableErrorState error={error} onRetry={refetch} />;
  }

  if (!apiData) {
    return <TableLoadingState message="Loading travel requests..." />;
  }

  return (
    <>
      <BaseTable
        data={apiData.travel_requests || []}
        columns={columns}
        // searchColumn="purpose"
        searchPlaceholder="Filter requests by purpose..."
        filters={filters}
        addButtonLabel="Add Request"
        onAdd={handleAddRequest}
        getRowId={(row) => String(row.id)}
      />

      <TravelRequestModal
        travelRequest={selectedRequest}
        onSave={handleSaveRequest}
        mode={modalMode}
        trigger={null}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
