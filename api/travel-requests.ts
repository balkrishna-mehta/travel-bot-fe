import { apiFetch, ApiResponse } from "@/hooks/use-api";
import {
  TravelRequestsResponse,
  TravelRequest,
  SelectionUpdate,
  ManagerReview,
  SessionResponse,
  TravelRequestsKpis,
} from "@/types/travel-requests.types";

// Travel Requests
export async function fetchTravelRequests(params?: {
  user_id?: string;
  status?: string;
  search?: string;
  page?: number;
  size?: number;
}): Promise<TravelRequestsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.user_id) queryParams.append("user_id", params.user_id);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.search) queryParams.append("search", params.search);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.size) queryParams.append("size", params.size.toString());

  const url = `/travel-requests${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const response = await apiFetch<ApiResponse<TravelRequestsResponse>>(url);

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to fetch travel requests");
  }

  return response.value;
}

export async function fetchBookingById(
  bookingId: string
): Promise<TravelRequest> {
  const response = await apiFetch<ApiResponse<TravelRequest>>(
    `/travel-requests/bookings/${bookingId}`
  );

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to fetch booking");
  }

  return response.value;
}

export async function updateBookingSelections(
  bookingId: string,
  selections: SelectionUpdate
): Promise<TravelRequest> {
  const response = await apiFetch<ApiResponse<TravelRequest>>(
    `/travel-requests/bookings/${bookingId}/selections`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selections),
    }
  );

  if (!response.success) {
    throw new Error(
      response.errorMessage || "Failed to update booking selections"
    );
  }

  return response.value;
}

export async function managerReviewBooking(reviewData: ManagerReview): Promise<{
  session: SessionResponse;
  booking: TravelRequest;
}> {
  const response = await apiFetch<
    ApiResponse<{
      session: SessionResponse;
      booking: TravelRequest;
    }>
  >(`/travel-requests/bookings/${reviewData.booking_id}/manager-review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reviewData),
  });

  if (!response.success) {
    throw new Error(
      response.errorMessage || "Failed to process manager review"
    );
  }

  return response.value;
}

export async function deactivateBooking(
  bookingId: string,
  reason: string
): Promise<TravelRequest> {
  const response = await apiFetch<ApiResponse<TravelRequest>>(
    `/travel-requests/bookings/${bookingId}/deactivate?reason=${encodeURIComponent(
      reason
    )}`,
    {
      method: "PUT",
    }
  );

  if (!response.success) {
    throw new Error(response.errorMessage || "Failed to deactivate booking");
  }

  return response.value;
}

export async function fetchManagerApprovedBookings(params?: {
  user_id?: string;
  page?: number;
  size?: number;
}): Promise<TravelRequestsResponse> {
  const queryParams = new URLSearchParams();
  if (params?.user_id) queryParams.append("user_id", params.user_id);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.size) queryParams.append("size", params.size.toString());

  // Use the ticket issuer specific endpoint
  const url = `/travel-requests/ticket-issuer/manager-approved${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  const response = await apiFetch<ApiResponse<TravelRequestsResponse>>(url);

  if (!response.success) {
    throw new Error(
      response.errorMessage || "Failed to fetch manager approved bookings"
    );
  }

  return response.value;
}

// Ticket Issuer Functions
export async function submitTicketInvoices(
  bookingId: string,
  files: {
    onward?: File;
    return?: File;
    hotel?: File;
  },
  amounts: { onward?: number; return?: number; hotel?: number }
): Promise<{
  invoices: any[];
  uploaded_count: number;
}> {
  const formData = new FormData();

  if (files.onward) {
    formData.append("onward_file", files.onward);
  }
  if (files.return) {
    formData.append("return_file", files.return);
  }
  if (files.hotel) {
    formData.append("hotel_file", files.hotel);
  }

  // Add per-type amounts (default to 0 if undefined)
  formData.append("onward_amount", String(amounts.onward ?? 0));
  formData.append("return_amount", String(amounts.return ?? 0));
  formData.append("hotel_amount", String(amounts.hotel ?? 0));

  const response = await apiFetch<
    ApiResponse<{
      invoices: any[];
      uploaded_count: number;
    }>
  >(`/travel-requests/bookings/${bookingId}/submit-tickets`, {
    method: "POST",
    body: formData,
  });

  if (!response.success) {
    throw new Error(
      response.errorMessage || "Failed to submit ticket invoices"
    );
  }

  return response.value;
}

export async function fetchTravelRequestsKpis(): Promise<TravelRequestsKpis> {
  const response = await apiFetch<ApiResponse<TravelRequestsKpis>>(
    "/travel-requests/kpis"
  );

  if (!response.success) {
    throw new Error(
      response.errorMessage || "Failed to fetch travel requests KPIs"
    );
  }

  return response.value;
}
