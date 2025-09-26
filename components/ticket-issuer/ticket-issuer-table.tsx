"use client";

import * as React from "react";
import {
  IconUpload,
  IconDownload,
  IconTicket,
  IconCalendar,
  IconMapPin,
  IconFileText,
  IconX,
} from "@tabler/icons-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserAvatarCell } from "@/components/common/user-avatar-cell";
import { travelRequestSchema } from "@/types/travel-requests.types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchManagerApprovedBookings,
  submitTicketInvoices,
} from "@/api/travel-requests";
import { useAuthLoading } from "@/hooks/use-auth-loading";

export type TravelRequest = z.infer<typeof travelRequestSchema>;

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

// Calculate total cost from selected options
const calculateTotalCost = (booking: TravelRequest): number => {
  let total = 0;

  // Add onward journey cost
  if (
    booking.selected_onward_index !== null &&
    booking.onward_options[booking.selected_onward_index]
  ) {
    const onwardOption = booking.onward_options[booking.selected_onward_index];
    total += (onwardOption.price as number) || 0;
  }

  // Add return journey cost
  if (
    booking.selected_return_index !== null &&
    booking.return_options[booking.selected_return_index]
  ) {
    const returnOption = booking.return_options[booking.selected_return_index];
    total += (returnOption.price as number) || 0;
  }

  // Add hotel cost
  if (
    booking.selected_hotel_index !== null &&
    booking.hotel_options[booking.selected_hotel_index]
  ) {
    const hotelOption = booking.hotel_options[booking.selected_hotel_index];
    total += (hotelOption.price as number) || 0;
  }

  return total;
};

// Document upload component
const DocumentUpload = ({
  type,
  bookingId,
  onUpload,
  uploadedFile,
}: {
  type: string;
  bookingId: string;
  onUpload: (type: string, file: File | null, bookingId: string) => void;
  uploadedFile?: File;
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(type, file, bookingId);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        id={`${bookingId}-${type}`}
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf"
      />
      {uploadedFile ? (
        <div className="flex items-center gap-2">
          <IconFileText className="h-4 w-4 text-green-600" />
          <span
            className="text-xs text-green-600 truncate max-w-32"
            title={uploadedFile.name}
          >
            {uploadedFile.name.length > 20
              ? `${uploadedFile.name.substring(0, 17)}...`
              : uploadedFile.name}
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-xs px-2"
            onClick={() => onUpload(type, null, bookingId)}
          >
            <IconX className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-xs px-2"
          onClick={() =>
            document.getElementById(`${bookingId}-${type}`)?.click()
          }
        >
          <IconUpload className="h-3 w-3 mr-1" />
          Upload
        </Button>
      )}
    </div>
  );
};

// Booking card component
const BookingCard = ({
  booking,
  uploadedFiles,
  onUploadDocument,
  onIssueTicket,
  onDownloadVerification,
  onSubmitTickets,
  isSubmittingTickets,
}: {
  booking: TravelRequest;
  uploadedFiles: Record<string, Record<string, File>>;
  onUploadDocument: (
    type: string,
    file: File | null,
    bookingId: string
  ) => void;
  onIssueTicket: (booking: TravelRequest) => void;
  onDownloadVerification: (booking: TravelRequest) => void;
  onSubmitTickets: (booking: TravelRequest) => void;
  isSubmittingTickets: boolean;
}) => {
  const selectedOnward =
    booking.selected_onward_index !== null
      ? booking.onward_options[booking.selected_onward_index]
      : null;
  const selectedReturn =
    booking.selected_return_index !== null
      ? booking.return_options[booking.selected_return_index]
      : null;
  const selectedHotel =
    booking.selected_hotel_index !== null
      ? booking.hotel_options[booking.selected_hotel_index]
      : null;

  const totalCost = calculateTotalCost(booking);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <UserAvatarCell
              name={booking.user?.name || "Unknown"}
              avatar={undefined}
              subtitle={booking.user?.department || ""}
            />
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <IconMapPin className="h-4 w-4" />
              {booking.destination}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <IconCalendar className="h-4 w-4" />
              {formatDate(booking.departure_date)} -{" "}
              {formatDate(booking.return_date)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatCurrency(totalCost)}
            </div>
            <div className="text-sm text-muted-foreground">Total Cost</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Selected Options with Document Uploads */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Onward Journey */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <IconMapPin className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="font-medium text-sm">Onward Journey</h4>
              </div>
              <DocumentUpload
                type="Onward"
                bookingId={booking.id}
                onUpload={onUploadDocument}
                uploadedFile={uploadedFiles[booking.id]?.Onward}
              />
            </div>
            {selectedOnward ? (
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {(selectedOnward.origin as string) || "SUR"}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-0.5 bg-blue-500"></div>
                      <IconMapPin className="h-3 w-3 text-blue-500" />
                      <div className="w-8 h-0.5 bg-blue-500"></div>
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {(selectedOnward.destination as string) || "DEL"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedOnward.price as number)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">
                        Departure:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {new Date(
                          selectedOnward.departure as string
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">
                        Arrival:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {new Date(
                          selectedOnward.arrival as string
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">
                        {selectedOnward.flight_code
                          ? "Flight: "
                          : "Train code: "}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {(selectedOnward.flight_code as string) ||
                          (selectedOnward.train_number as string)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">
                        Duration:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {selectedOnward.duration_minutes
                          ? `${Math.floor(
                              (selectedOnward.duration_minutes as number) / 60
                            )}h ${
                              (selectedOnward.duration_minutes as number) % 60
                            }m`
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">
                        {selectedOnward.flight_code ? "Airline: " : "Train: "}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {(selectedOnward.airline as string) ||
                          (selectedOnward.train_name as string)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">
                        Class:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {selectedOnward.class as string}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 text-center">
                <div className="text-slate-500 dark:text-slate-400 text-sm">
                  No selection made
                </div>
              </div>
            )}
          </div>

          {/* Return Journey */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <IconMapPin className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="font-medium text-sm">Return Journey</h4>
              </div>
              <DocumentUpload
                type="Return"
                bookingId={booking.id}
                onUpload={onUploadDocument}
                uploadedFile={uploadedFiles[booking.id]?.Return}
              />
            </div>
            {selectedReturn ? (
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {(selectedReturn.origin as string) || "DEL"}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-0.5 bg-purple-500"></div>
                      <IconMapPin className="h-3 w-3 text-purple-500" />
                      <div className="w-8 h-0.5 bg-purple-500"></div>
                    </div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">
                      {(selectedReturn.destination as string) || "SUR"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedReturn.price as number)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">
                        Departure:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {new Date(
                          selectedReturn.departure as string
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">
                        Arrival:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {new Date(
                          selectedReturn.arrival as string
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">
                        {selectedReturn.flight_code
                          ? "Flight: "
                          : "Train code: "}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {(selectedReturn.flight_code as string) ||
                          (selectedReturn.train_number as string)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">
                        Duration:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {selectedReturn.duration_minutes
                          ? `${Math.floor(
                              (selectedReturn.duration_minutes as number) / 60
                            )}h ${
                              (selectedReturn.duration_minutes as number) % 60
                            }m`
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">
                        {selectedReturn.flight_code ? "Airline: " : "Train: "}
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {(selectedReturn.airline as string) ||
                          (selectedReturn.train_name as string)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">
                        Class:
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {selectedReturn.class as string}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 text-center">
                <div className="text-slate-500 dark:text-slate-400 text-sm">
                  No selection made
                </div>
              </div>
            )}
          </div>

          {/* Hotel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-orange-100 rounded-lg">
                  <IconCalendar className="h-4 w-4 text-orange-600" />
                </div>
                <h4 className="font-medium text-sm">Hotel Accommodation</h4>
              </div>
              <DocumentUpload
                type="Hotel"
                bookingId={booking.id}
                onUpload={onUploadDocument}
                uploadedFile={uploadedFiles[booking.id]?.Hotel}
              />
            </div>
            {selectedHotel ? (
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-bold text-slate-900 dark:text-white text-base mb-1">
                      {selectedHotel.name as string}
                    </h5>
                    <div className="flex items-center gap-2 mb-2">
                      {(selectedHotel.stars as number) && (
                        <div className="flex items-center gap-1">
                          {Array.from({
                            length: selectedHotel.stars as number,
                          }).map((_, i) => (
                            <span key={i} className="text-yellow-400 text-sm">
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                      {(selectedHotel.rating as number) && (
                        <div className="px-2 py-0.5 bg-green-100 dark:bg-green-900 rounded text-xs font-medium text-green-700 dark:text-green-300">
                          {selectedHotel.rating as number}/10
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      {formatDate(booking.departure_date)} -{" "}
                      {formatDate(booking.return_date)}
                      {(selectedHotel.cost_per_night as number) && (
                        <span className="ml-2">
                          (
                          {Math.ceil(
                            (new Date(booking.return_date).getTime() -
                              new Date(booking.departure_date).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          nights)
                        </span>
                      )}
                    </div>
                    {(selectedHotel.notes as string) && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {selectedHotel.notes as string}
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedHotel.cost_total as number)}
                    </div>
                    {(selectedHotel.cost_per_night as number) && (
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {formatCurrency(selectedHotel.cost_per_night as number)}{" "}
                        per night
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 text-center">
                <div className="text-slate-500 dark:text-slate-400 text-sm">
                  No selection made
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadVerification(booking)}
            >
              <IconDownload className="h-4 w-4 mr-2" />
              Download Employee Verification
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onIssueTicket(booking)}>
              <IconTicket className="h-4 w-4 mr-2" />
              Issue Ticket
            </Button>
            <Button
              onClick={() => onSubmitTickets(booking)}
              disabled={
                isSubmittingTickets ||
                !(
                  uploadedFiles[booking.id]?.Onward &&
                  uploadedFiles[booking.id]?.Return &&
                  uploadedFiles[booking.id]?.Hotel
                )
              }
            >
              {isSubmittingTickets ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Loading and error components
const LoadingCards = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="p-3 bg-muted rounded-lg animate-pulse">
                  <div className="h-4 w-20 bg-muted-foreground/20 rounded mb-2" />
                  <div className="h-3 w-16 bg-muted-foreground/20 rounded" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const ErrorCards = ({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) => (
  <Card className="w-full">
    <CardContent className="flex flex-col items-center justify-center py-12">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Failed to load bookings</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "An error occurred"}
        </p>
        <Button onClick={onRetry}>Try Again</Button>
      </div>
    </CardContent>
  </Card>
);

export function TicketIssuerTable() {
  const queryClient = useQueryClient();
  const { isAuthReady } = useAuthLoading();
  const [pagination, setPagination] = React.useState({
    page: 1,
    pageSize: 10,
  });
  const [filters, setFilters] = React.useState<
    Record<string, string | undefined>
  >({});
  const [search, setSearch] = React.useState<string | undefined>();
  const [uploadedFiles, setUploadedFiles] = React.useState<
    Record<string, Record<string, File>>
  >({});

  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["manager-approved-bookings", pagination, filters, search],
    queryFn: () =>
      fetchManagerApprovedBookings({
        page: pagination.page,
        size: pagination.pageSize,
        user_id: filters.user_id,
      }),
    enabled: isAuthReady, // Only fetch when auth initialization is complete
  });

  // Mutation for submitting ticket invoices
  const submitTicketsMutation = useMutation({
    mutationFn: async (booking: TravelRequest) => {
      const files = uploadedFiles[booking.id] || {};
      const filesToSubmit: { onward?: File; return?: File; hotel?: File } = {};

      if (files.Onward) filesToSubmit.onward = files.Onward;
      if (files.Return) filesToSubmit.return = files.Return;
      if (files.Hotel) filesToSubmit.hotel = files.Hotel;

      console.log("Submitting files:", filesToSubmit);
      // Compute per-type amounts from selections
      const onwardAmount =
        booking.selected_onward_index !== null &&
        booking.onward_options[booking.selected_onward_index]
          ? (booking.onward_options[booking.selected_onward_index]
              .price as number) || 0
          : 0;
      const returnAmount =
        booking.selected_return_index !== null &&
        booking.return_options[booking.selected_return_index]
          ? (booking.return_options[booking.selected_return_index]
              .price as number) || 0
          : 0;
      const hotelAmount =
        booking.selected_hotel_index !== null &&
        booking.hotel_options[booking.selected_hotel_index]
          ? (booking.hotel_options[booking.selected_hotel_index]
              .cost_total as number) || 0
          : 0;

      return submitTicketInvoices(booking.id, filesToSubmit, {
        onward: onwardAmount,
        return: returnAmount,
        hotel: hotelAmount,
      });
    },
    onSuccess: (data, booking) => {
      // Clear uploaded files for this booking
      setUploadedFiles((prev) => {
        const newFiles = { ...prev };
        delete newFiles[booking.id];
        return newFiles;
      });

      // Refetch the data to update the UI
      queryClient.invalidateQueries({
        queryKey: ["manager-approved-bookings"],
      });

      console.log("Tickets submitted successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to submit tickets:", error);
    },
  });

  const handleIssueTicket = React.useCallback((booking: TravelRequest) => {
    // TODO: Implement ticket issuing logic
    console.log("Issuing ticket for booking:", booking);
  }, []);

  const handleDownloadVerification = React.useCallback(
    (booking: TravelRequest) => {
      // TODO: Implement download verification logic
      console.log("Downloading verification for booking:", booking);
    },
    []
  );

  const handleUploadDocument = React.useCallback(
    (type: string, file: File | null, bookingId: string) => {
      if (file) {
        // Store file in state
        setUploadedFiles((prev) => ({
          ...prev,
          [bookingId]: {
            ...prev[bookingId],
            [type]: file,
          },
        }));
      } else {
        // Remove file from state
        setUploadedFiles((prev) => {
          const newFiles = { ...prev };
          if (newFiles[bookingId]) {
            delete newFiles[bookingId][type];
            if (Object.keys(newFiles[bookingId]).length === 0) {
              delete newFiles[bookingId];
            }
          }
          return newFiles;
        });
      }
    },
    []
  );

  const handleSubmitTickets = React.useCallback(
    (booking: TravelRequest) => {
      const files = uploadedFiles[booking.id] || {};
      console.log("Files to submit:", files);

      // Check if all 3 files are uploaded
      const hasAllFiles = files.Onward && files.Return && files.Hotel;

      if (!hasAllFiles) {
        alert(
          "Please upload all 3 files (Onward, Return, and Hotel) before submitting."
        );
        return;
      }

      submitTicketsMutation.mutate(booking);
    },
    [uploadedFiles, submitTicketsMutation]
  );

  const handlePaginationChange = React.useCallback(
    (page: number, pageSize: number) => {
      setPagination({ page, pageSize });
    },
    []
  );

  const handleFilterChange = React.useCallback(
    (key: string, value: string | undefined) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSearchChange = React.useCallback(
    (searchValue: string | undefined) => {
      setSearch(searchValue);
    },
    []
  );

  if (isLoading) {
    return <LoadingCards />;
  }

  if (error) {
    return <ErrorCards error={error} onRetry={refetch} />;
  }

  if (!apiData) {
    return <LoadingCards />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by destination..."
            value={search || ""}
            onChange={(e) => handleSearchChange(e.target.value || undefined)}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={filters.user_id || ""}
          onChange={(e) =>
            handleFilterChange("user_id", e.target.value || undefined)
          }
          className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Departments</option>
          <option value="engineering-user-id">Engineering</option>
          <option value="marketing-user-id">Marketing</option>
          <option value="sales-user-id">Sales</option>
          <option value="operations-user-id">Operations</option>
        </select>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {apiData.travel_requests?.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            uploadedFiles={uploadedFiles}
            onUploadDocument={handleUploadDocument}
            onIssueTicket={handleIssueTicket}
            onDownloadVerification={handleDownloadVerification}
            onSubmitTickets={handleSubmitTickets}
            isSubmittingTickets={submitTicketsMutation.isPending}
          />
        ))}
      </div>

      {/* Pagination */}
      {apiData.travel_requests && apiData.travel_requests.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
            {Math.min(
              pagination.page * pagination.pageSize,
              apiData.total || 0
            )}{" "}
            of {apiData.total || 0} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePaginationChange(pagination.page - 1, pagination.pageSize)
              }
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {pagination.page} of{" "}
              {Math.ceil((apiData.total || 0) / pagination.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePaginationChange(pagination.page + 1, pagination.pageSize)
              }
              disabled={
                pagination.page >=
                Math.ceil((apiData.total || 0) / pagination.pageSize)
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
