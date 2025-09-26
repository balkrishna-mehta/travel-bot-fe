"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  IconEdit,
  IconTrash,
  IconEye,
  IconDownload,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  BaseTable,
  createSelectionColumn,
} from "@/components/common/base-table";
import { SortableColumnHeader } from "@/components/common/sortable-column-header";
import { TableActions } from "@/components/common/table-actions";
import { UserAvatarCell } from "@/components/common/user-avatar-cell";
import { InvoiceModal } from "@/components/invoices/invoice-modal";
import { InvoiceWithDetails } from "@/types/invoices.types";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  TableLoadingState,
  TableErrorState,
} from "@/components/common/loading-spinner";
import {
  fetchInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoice,
} from "@/api/invoices";
import { useAuthLoading } from "@/hooks/use-auth-loading";

export type Invoice = InvoiceWithDetails;

// Category badge component
function CategoryBadge({ category }: { category: Invoice["category"] }) {
  const categoryConfig = {
    Flight: { className: "bg-sky-100 text-sky-800 border-sky-200" },
    Hotel: { className: "bg-purple-100 text-purple-800 border-purple-200" },
    Train: { className: "bg-green-100 text-green-800 border-green-200" },
  };

  const config = categoryConfig[category];

  return (
    <Badge variant="outline" className={config.className}>
      {category}
    </Badge>
  );
}

// Currency formatter
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Table columns definition
const createColumns = (
  onEdit: (invoice: Invoice) => void,
  onDelete: (invoice: Invoice) => void,
  onDownload: (invoice: Invoice) => void
): ColumnDef<Invoice>[] => [
  createSelectionColumn<Invoice>(),
  {
    accessorKey: "id",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Invoice #</SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <div className="font-medium text-blue-600">
        {row.original.id.slice(0, 8)}...
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "employee",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Employee</SortableColumnHeader>
    ),
    cell: ({ row }) => {
      const invoice = row.original;
      const employee = invoice.employee;
      if (!employee) {
        return <div className="text-muted-foreground">No employee data</div>;
      }
      return <UserAvatarCell name={employee.name} avatar={``} />;
    },
    enableHiding: false,
  },
  {
    accessorKey: "booking",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>
        Travel Details
      </SortableColumnHeader>
    ),
    cell: ({ row }) => {
      const invoice = row.original;
      const booking = invoice.booking;
      if (!booking) {
        return <div className="text-muted-foreground">No booking data</div>;
      }
      const departureDate = new Date(
        booking.departure_date
      ).toLocaleDateString();
      const returnDate = new Date(booking.return_date).toLocaleDateString();
      return (
        <div className="flex flex-col">
          <div className="font-medium">{booking.destination}</div>
          <div className="text-sm text-muted-foreground">
            {departureDate} - {returnDate}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Category</SortableColumnHeader>
    ),
    cell: ({ row }) => <CategoryBadge category={row.original.category} />,
    filterFn: (row, id, value) => {
      const cellValue = row.getValue(id) as string;
      return cellValue === value;
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <SortableColumnHeader column={column}>Amount</SortableColumnHeader>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{formatCurrency(row.original.amount)}</div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const invoice = row.original;
      const actionGroups = [
        {
          actions: [
            {
              label: "Edit Invoice",
              icon: <IconEdit className="mr-2 h-4 w-4" />,
              onClick: () => onEdit(invoice),
            },
            {
              label: "View Details",
              icon: <IconEye className="mr-2 h-4 w-4" />,
              onClick: () => {},
            },
            {
              label: "Download PDF",
              icon: <IconDownload className="mr-2 h-4 w-4" />,
              onClick: () => onDownload(invoice),
            },
          ],
          separator: true,
        },
        {
          actions: [
            {
              label: "Delete",
              icon: <IconTrash className="mr-2 h-4 w-4" />,
              onClick: () => onDelete(invoice),
              className: "text-destructive",
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

export function InvoicesTable() {
  const { isAuthReady } = useAuthLoading();

  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => fetchInvoices(),
    enabled: isAuthReady, // Only fetch when auth initialization is complete
  });

  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");

  const createInvoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      setIsModalOpen(false);
      setSelectedInvoice(null);
      refetch();
    },
    onError: (error: unknown) => {
      console.error("Failed to create invoice:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to create invoice: ${message}`);
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) =>
      updateInvoice(id, data),
    onSuccess: () => {
      setIsModalOpen(false);
      setSelectedInvoice(null);
      refetch();
    },
    onError: (error: unknown) => {
      console.error("Failed to update invoice:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to update invoice: ${message}`);
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      refetch();
    },
    onError: (error: unknown) => {
      console.error("Failed to delete invoice:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to delete invoice: ${message}`);
    },
  });

  const handleAddInvoice = React.useCallback(() => {
    setSelectedInvoice(null);
    setModalMode("add");
    setIsModalOpen(true);
  }, []);

  const handleEditInvoice = React.useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  const handleSaveInvoice = React.useCallback(
    (invoice: Partial<Invoice>, id?: string) => {
      if (modalMode === "add") {
        createInvoiceMutation.mutate(invoice);
      } else if (id) {
        updateInvoiceMutation.mutate({ id, data: invoice });
      }
    },
    [modalMode, createInvoiceMutation, updateInvoiceMutation]
  );

  const handleDeleteInvoice = React.useCallback(
    (invoice: Invoice) => {
      if (window.confirm("Are you sure you want to delete this invoice?")) {
        deleteInvoiceMutation.mutate(invoice.id);
      }
    },
    [deleteInvoiceMutation]
  );

  const handleDownloadInvoice = React.useCallback(async (invoice: Invoice) => {
    try {
      const downloadData = await downloadInvoice(invoice.id);

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = downloadData.signed_url;
      link.download = `invoice_${invoice.id.slice(0, 8)}.pdf`;
      link.target = "_blank";

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download invoice:", error);
      alert(
        `Failed to download invoice: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }, []);

  const columns = React.useMemo(
    () =>
      createColumns(
        handleEditInvoice,
        handleDeleteInvoice,
        handleDownloadInvoice
      ),
    [handleEditInvoice, handleDeleteInvoice, handleDownloadInvoice]
  );

  const filters = [
    {
      label: "Category",
      value: "category",
      column: "category",
      placeholder: "Category",
      options: [
        { label: "Flight", value: "Flight" },
        { label: "Hotel", value: "Hotel" },
        { label: "Train", value: "Train" },
      ],
    },
  ];

  return (
    <>
      <div className="rounded-lg border p-6">
        {isLoading && <TableLoadingState message="Loading invoices..." />}
        {error && <TableErrorState error={error} onRetry={refetch} />}
        {apiData && (
          <BaseTable
            data={apiData?.invoices || []}
            columns={columns}
            searchColumn="id"
            searchPlaceholder="Filter invoices..."
            filters={filters}
            addButtonLabel="Add Invoice"
            onAdd={handleAddInvoice}
            getRowId={(row) => String(row.id)}
          />
        )}
      </div>

      <InvoiceModal
        invoice={selectedInvoice}
        onSave={handleSaveInvoice}
        mode={modalMode}
        trigger={null}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}
