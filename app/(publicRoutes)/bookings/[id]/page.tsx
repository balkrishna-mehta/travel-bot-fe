"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Check,
  Clock,
  CreditCard,
  Plane,
  Building,
  X,
  Star,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProgressSteps from "@/components/bookings/progress-steps";
import {
  fetchBookingById,
  updateBookingSelections,
  managerReviewBooking,
  deactivateBooking,
} from "@/api/travel-requests";
import {
  TravelRequest,
  SelectionUpdate,
  ManagerReview,
} from "@/types/travel-requests.types";

type TravelOption = Record<string, unknown>;
interface SelectedItems {
  onward: TravelOption | null;
  return: TravelOption | null;
  hotel: TravelOption | null;
}

const TravelBookingStepper = () => {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<TravelRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [managerDecision, setManagerDecision] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({
    onward: null,
    return: null,
    hotel: null,
  });

  // Load booking data on component mount
  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        const bookingData = await fetchBookingById(bookingId);
        setBooking(bookingData);

        // Set selected items from booking data
        if (bookingData) {
          const {
            onward_options,
            return_options,
            hotel_options,
            selected_onward_index,
            selected_return_index,
            selected_hotel_index,
          } = bookingData;

          setSelectedItems({
            onward:
              selected_onward_index !== null &&
              onward_options[selected_onward_index]
                ? onward_options[selected_onward_index]
                : null,
            return:
              selected_return_index !== null &&
              return_options[selected_return_index]
                ? return_options[selected_return_index]
                : null,
            hotel:
              selected_hotel_index !== null &&
              hotel_options[selected_hotel_index]
                ? hotel_options[selected_hotel_index]
                : null,
          });

          // Determine current step based on session status
          const sessionStatus = bookingData.session?.status;
          if (sessionStatus === "InUserSelection") {
            setCurrentStep(0);
          } else if (sessionStatus === "InManagerReview") {
            setCurrentStep(1);
          } else if (sessionStatus === "ManagerApproved") {
            setCurrentStep(2);
          } else if (sessionStatus === "ManagerRejected") {
            setCurrentStep(1);
            setManagerDecision("rejected");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleManagerDecision = async (decision: string) => {
    if (!booking) return;

    try {
      setSubmitting(true);
      setManagerDecision(decision);

      const reviewData: ManagerReview = {
        session_id: booking.session_id,
        booking_id: booking.id,
        action: decision === "approved" ? "ManagerApproved" : "ManagerRejected",
        feedback:
          decision === "approved"
            ? "Travel request approved. Proceed with booking."
            : "Travel request rejected due to budget constraints.",
      };

      await managerReviewBooking(reviewData);

      if (decision === "approved") {
        setTimeout(() => handleNext(), 1500);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process manager decision"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectItem = (type: keyof SelectedItems, item: TravelOption) => {
    setSelectedItems((prev) => ({
      ...prev,
      [type]: item,
    }));
  };

  const handleSubmitSelections = async () => {
    if (!booking) return;

    try {
      setSubmitting(true);

      const selections: SelectionUpdate = {
        selected_onward_index: selectedItems.onward
          ? booking.onward_options.findIndex(
              (opt) => opt === selectedItems.onward
            )
          : null,
        selected_return_index: selectedItems.return
          ? booking.return_options.findIndex(
              (opt) => opt === selectedItems.return
            )
          : null,
        selected_hotel_index: selectedItems.hotel
          ? booking.hotel_options.findIndex(
              (opt) => opt === selectedItems.hotel
            )
          : null,
      };

      await updateBookingSelections(booking.id, selections);
      setCurrentStep(1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit selections"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivateBooking = async (reason: string) => {
    if (!booking) return;

    try {
      setSubmitting(true);
      await deactivateBooking(booking.id, reason);
      router.push("/bookings");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to deactivate booking"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to format duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Helper function to get safe value
  const getValue = (
    obj: Record<string, unknown> | null | undefined,
    ...keys: string[]
  ): string | number | null => {
    for (const key of keys) {
      if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = (obj as Record<string, unknown>)[key];
        if (value !== undefined && value !== null) {
          if (typeof value === "string" || typeof value === "number") {
            return value;
          }
        }
      }
    }
    return null;
  };

  const getString = (
    obj: Record<string, unknown> | null | undefined,
    ...keys: string[]
  ): string | null => {
    const val = getValue(obj, ...keys);
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
    return null;
  };

  const getNumber = (
    obj: Record<string, unknown> | null | undefined,
    ...keys: string[]
  ): number | null => {
    const val = getValue(obj, ...keys);
    if (typeof val === "number") return val;
    if (typeof val === "string" && val.trim() !== "" && !isNaN(Number(val))) {
      return Number(val);
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Booking</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push("/bookings")}>
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  // No booking found
  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested booking could not be found.
          </p>
          <Button onClick={() => router.push("/bookings")}>
            Back to Bookings
          </Button>
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-foreground">
                Select Your Travel Options
              </h3>
              <p className="text-muted-foreground mt-2">
                Choose from available onward and return options for your journey
                to {booking.destination}
              </p>
            </div>

            {/* Onward Options Section */}
            {booking.onward_options && booking.onward_options.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    Onward Journey Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.onward_options.map((option, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedItems.onward === option
                          ? "border-primary bg-accent"
                          : "border-border"
                      }`}
                      onClick={() => handleSelectItem("onward", option)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-semibold">
                              {getValue(
                                option,
                                "airline",
                                "name",
                                "train_name"
                              ) || `Option ${index + 1}`}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {getValue(
                                option,
                                "flight_code",
                                "train_number",
                                "route"
                              ) ||
                                `${getValue(
                                  option,
                                  "from",
                                  "origin"
                                )} → ${getValue(option, "to", "destination")}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              {(() => {
                                const dep = getString(
                                  option,
                                  "departure",
                                  "departure_time",
                                  "time"
                                );
                                return dep ? formatTime(dep) : null;
                              })()}
                            </span>
                            {(() => {
                              const dur = getNumber(option, "duration_minutes");
                              return dur !== null ? (
                                <Badge variant="secondary">
                                  {formatDuration(dur)}
                                </Badge>
                              ) : null;
                            })()}
                            {(() => {
                              const cls = getString(
                                option,
                                "class",
                                "travel_class"
                              );
                              return cls ? (
                                <Badge variant="outline">{cls}</Badge>
                              ) : null;
                            })()}
                          </div>
                          {getValue(option, "notes") && (
                            <p className="text-xs text-muted-foreground">
                              {getValue(option, "notes")}
                            </p>
                          )}
                        </div>
                        <div className="text-right space-y-2">
                          <p className="font-semibold text-lg">
                            ₹
                            {getValue(option, "price", "fare", "cost") || "N/A"}
                          </p>
                          <Button
                            size="sm"
                            variant={
                              selectedItems.onward === option
                                ? "default"
                                : "outline"
                            }
                          >
                            {selectedItems.onward === option
                              ? "Selected"
                              : "Select"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Return Options Section */}
            {booking.return_options && booking.return_options.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-4 w-4" />
                    Return Journey Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.return_options.map((option, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedItems.return === option
                          ? "border-primary bg-accent"
                          : "border-border"
                      }`}
                      onClick={() => handleSelectItem("return", option)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-semibold">
                              {getValue(
                                option,
                                "airline",
                                "name",
                                "train_name"
                              ) || `Option ${index + 1}`}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {getValue(
                                option,
                                "flight_code",
                                "train_number",
                                "route"
                              ) ||
                                `${getValue(
                                  option,
                                  "from",
                                  "origin"
                                )} → ${getValue(option, "to", "destination")}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              {(() => {
                                const dep = getString(
                                  option,
                                  "departure",
                                  "departure_time",
                                  "time"
                                );
                                return dep ? formatTime(dep) : null;
                              })()}
                            </span>
                            {(() => {
                              const dur = getNumber(option, "duration_minutes");
                              return dur !== null ? (
                                <Badge variant="secondary">
                                  {formatDuration(dur)}
                                </Badge>
                              ) : null;
                            })()}
                            {(() => {
                              const cls = getString(
                                option,
                                "class",
                                "travel_class"
                              );
                              return cls ? (
                                <Badge variant="outline">{cls}</Badge>
                              ) : null;
                            })()}
                          </div>
                          {getValue(option, "notes") && (
                            <p className="text-xs text-muted-foreground">
                              {getValue(option, "notes")}
                            </p>
                          )}
                        </div>
                        <div className="text-right space-y-2">
                          <p className="font-semibold text-lg">
                            ₹
                            {getValue(option, "price", "fare", "cost") || "N/A"}
                          </p>
                          <Button
                            size="sm"
                            variant={
                              selectedItems.return === option
                                ? "default"
                                : "outline"
                            }
                          >
                            {selectedItems.return === option
                              ? "Selected"
                              : "Select"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Hotels Section */}
            {booking.hotel_options && booking.hotel_options.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Hotel Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {booking.hotel_options.map((hotel, index) => (
                    <div
                      key={index}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedItems.hotel === hotel
                          ? "border-primary bg-accent"
                          : "border-border"
                      }`}
                      onClick={() => handleSelectItem("hotel", hotel)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-semibold">
                              {getValue(hotel, "name", "hotel_name") ||
                                `Hotel ${index + 1}`}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {getValue(hotel, "location", "address", "city") ||
                                "Location not specified"}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current text-yellow-500" />
                              <span className="text-muted-foreground">
                                {getValue(hotel, "rating", "star_rating") ||
                                  "N/A"}
                              </span>
                              {getValue(hotel, "stars") && (
                                <span className="text-muted-foreground">
                                  ({getValue(hotel, "stars")} stars)
                                </span>
                              )}
                            </div>
                          </div>
                          {getValue(hotel, "notes") && (
                            <p className="text-xs text-muted-foreground">
                              {getValue(hotel, "notes")}
                            </p>
                          )}
                        </div>
                        <div className="text-right space-y-2">
                          <p className="font-semibold text-lg">
                            ₹
                            {getValue(
                              hotel,
                              "cost_per_night",
                              "price",
                              "rate"
                            ) || "N/A"}
                            <span className="text-sm font-normal text-muted-foreground">
                              /night
                            </span>
                          </p>
                          {getValue(hotel, "cost_total") && (
                            <p className="text-sm text-muted-foreground">
                              Total: ₹{getValue(hotel, "cost_total")}
                            </p>
                          )}
                          <Button
                            size="sm"
                            variant={
                              selectedItems.hotel === hotel
                                ? "default"
                                : "outline"
                            }
                          >
                            {selectedItems.hotel === hotel
                              ? "Selected"
                              : "Select"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col items-center pt-4 space-y-3">
              {(!selectedItems.onward ||
                !selectedItems.return ||
                !selectedItems.hotel) && (
                <p className="text-sm text-muted-foreground text-center">
                  Please select at least one option from each category: onward
                  journey, return journey, and hotels
                </p>
              )}
              <Button
                onClick={handleSubmitSelections}
                size="lg"
                disabled={
                  !selectedItems.onward ||
                  !selectedItems.return ||
                  !selectedItems.hotel ||
                  submitting
                }
                className="min-w-48"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Approval"
                )}
              </Button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-foreground">
                Manager Approval
              </h3>
              <p className="text-muted-foreground mt-2">
                Your travel request is being reviewed
              </p>
            </div>

            {managerDecision === null && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="mx-auto mb-6 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-muted-foreground animate-pulse" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">Under Review</h4>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Your travel request is being reviewed by your manager.
                    You&apos;ll receive a notification once the decision is
                    made.
                  </p>

                  {/* Demo Actions */}
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Demo Actions:
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => handleManagerDecision("approved")}
                        variant="outline"
                        size="sm"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-2" />
                        )}
                        Simulate Approval
                      </Button>
                      <Button
                        onClick={() => handleManagerDecision("rejected")}
                        variant="outline"
                        size="sm"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <X className="h-4 w-4 mr-2" />
                        )}
                        Simulate Rejection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {managerDecision === "approved" && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="mx-auto mb-6 w-16 h-16 bg-accent rounded-full flex items-center justify-center">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">
                    Request Approved!
                  </h4>
                  <p className="text-muted-foreground mb-2">
                    Your travel request has been approved by your manager
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Proceeding to ticket processing...
                  </p>
                </CardContent>
              </Card>
            )}

            {managerDecision === "rejected" && (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="mx-auto mb-6 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <X className="h-6 w-6 text-destructive" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-destructive">
                    Request Rejected
                  </h4>
                  <p className="text-muted-foreground mb-6">
                    Your travel request was not approved
                  </p>

                  <Card className="bg-destructive/5 border-destructive/20 max-w-md mx-auto mb-6">
                    <CardContent>
                      <h5 className="font-semibold text-destructive mb-2">
                        Reason for rejection:
                      </h5>
                      <p className="text-destructive/80 text-sm">
                        {booking.manager_feedback ||
                          "Budget constraints for this quarter. Please consider alternative options or resubmit next quarter."}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3 justify-center">
                    <Button
                      onClick={() => {
                        setCurrentStep(0);
                        setManagerDecision(null);
                      }}
                      variant="outline"
                    >
                      Revise Request
                    </Button>
                    <Button
                      onClick={() =>
                        handleDeactivateBooking(
                          "User requested deactivation after rejection"
                        )
                      }
                      variant="destructive"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Deactivating...
                        </>
                      ) : (
                        "Cancel Booking"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-foreground">
                Ticket Processing
              </h3>
              <p className="text-muted-foreground mt-2">
                Processing your bookings and issuing tickets
              </p>
            </div>

            <Card>
              <CardContent className="text-center py-12">
                <div className="mx-auto mb-6 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-muted-foreground animate-pulse" />
                </div>
                <h4 className="text-lg font-semibold mb-2">
                  Processing Bookings
                </h4>
                <p className="text-muted-foreground mb-8">
                  Processing payment and generating booking confirmations
                </p>

                <Card className="bg-accent/30 max-w-lg mx-auto text-left">
                  <CardHeader>
                    <CardTitle className="text-lg">Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedItems.onward && (
                      <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-2">
                          <Plane className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {getValue(
                              selectedItems.onward,
                              "airline",
                              "name"
                            ) || "Onward Journey"}
                          </span>
                        </div>
                        <span className="font-semibold">
                          ₹
                          {getValue(
                            selectedItems.onward,
                            "price",
                            "fare",
                            "cost"
                          ) || "N/A"}
                        </span>
                      </div>
                    )}
                    {selectedItems.return && (
                      <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-2">
                          <Plane className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {getValue(
                              selectedItems.return,
                              "airline",
                              "name"
                            ) || "Return Journey"}
                          </span>
                        </div>
                        <span className="font-semibold">
                          ₹
                          {getValue(
                            selectedItems.return,
                            "price",
                            "fare",
                            "cost"
                          ) || "N/A"}
                        </span>
                      </div>
                    )}
                    {selectedItems.hotel && (
                      <div className="flex justify-between items-center py-2">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {getValue(selectedItems.hotel, "name") || "Hotel"}{" "}
                            (2 nights)
                          </span>
                        </div>
                        <span className="font-semibold">
                          ₹
                          {getValue(
                            selectedItems.hotel,
                            "cost_per_night",
                            "price"
                          ) || "N/A"}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total Amount</span>
                        <span>
                          {(() => {
                            const onwardPrice = selectedItems.onward
                              ? parseInt(
                                  String(
                                    getValue(
                                      selectedItems.onward,
                                      "price",
                                      "fare",
                                      "cost"
                                    ) || "0"
                                  )
                                )
                              : 0;
                            const returnPrice = selectedItems.return
                              ? parseInt(
                                  String(
                                    getValue(
                                      selectedItems.return,
                                      "price",
                                      "fare",
                                      "cost"
                                    ) || "0"
                                  )
                                )
                              : 0;
                            const hotelPrice = selectedItems.hotel
                              ? parseInt(
                                  String(
                                    getValue(
                                      selectedItems.hotel,
                                      "cost_per_night",
                                      "price"
                                    ) || "0"
                                  )
                                ) * 2
                              : 0;
                            return `₹${(
                              onwardPrice +
                              returnPrice +
                              hotelPrice
                            ).toLocaleString()}`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-8 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center justify-center gap-2">
                    <span>📧</span>
                    Tickets will be sent to your registered email
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span>📱</span>
                    SMS confirmations will be sent to your mobile
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 border border-destructive/20 bg-destructive/5 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive text-sm">{error}</span>
          </div>
        )}

        {/* Progress Steps */}
        <ProgressSteps currentStep={currentStep} />

        {/* Content */}
        <Card>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TravelBookingStepper;
