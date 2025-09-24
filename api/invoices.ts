import { apiFetch, ApiResponse } from "@/hooks/use-api";
import {
  Invoice,
  InvoiceWithDetails,
  InvoicesResponse,
  InvoicesKpis,
} from "@/types/invoices.types";

export async function fetchInvoices(): Promise<InvoicesResponse> {
  const response = await apiFetch<ApiResponse<InvoicesResponse>>("/invoices");

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to fetch invoices");
  }

  return response.value;
}

export async function createInvoice(
  invoice: Partial<Invoice>
): Promise<ApiResponse<Invoice>> {
  const response = await apiFetch<ApiResponse<Invoice>>("/invoices/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(invoice),
  });

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to create invoice");
  }

  return response;
}

export async function updateInvoice(
  id: string,
  invoice: Partial<Invoice>
): Promise<ApiResponse<Invoice>> {
  const response = await apiFetch<ApiResponse<Invoice>>(`/invoices/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(invoice),
  });

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to update invoice");
  }

  return response;
}

export async function deleteInvoice(id: string): Promise<ApiResponse<void>> {
  const response = await apiFetch<ApiResponse<void>>(`/invoices/${id}`, {
    method: "DELETE",
  });

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to delete invoice");
  }

  return response;
}

export async function downloadInvoice(id: string): Promise<{
  signed_url: string;
  file_path: string;
  invoice_id: string;
}> {
  const response = await apiFetch<
    ApiResponse<{
      signed_url: string;
      file_path: string;
      invoice_id: string;
    }>
  >(`/invoices/${id}`);

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to get download URL");
  }

  return response.value;
}

export async function fetchInvoicesKpis(): Promise<InvoicesKpis> {
  const response = await apiFetch<ApiResponse<InvoicesKpis>>("/invoices/kpis");

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to fetch invoices KPIs");
  }

  return response.value;
}
