"use client";
import React from "react";
import { SectionCards } from "@/components/common/section-cards";
import { useQuery } from "@tanstack/react-query";
import { fetchTravelRequestsKpis } from "@/api/travel-requests";
import { useAuthLoading } from "@/hooks/use-auth-loading";

export function TravelRequestsCards() {
  const { isAuthReady } = useAuthLoading();

  const { data: travelRequestsKpis } = useQuery({
    queryKey: ["travelRequestsKpis"],
    queryFn: () => fetchTravelRequestsKpis(),
    enabled: isAuthReady, // Only fetch when auth initialization is complete
  });

  const sectionCardsData = [
    {
      title: "Total Requests",
      value: travelRequestsKpis?.total_requests.toString() || "0",
      description: "This month",
      icon: "📋",
    },
    {
      title: "Pending Approval",
      value: travelRequestsKpis?.pending_approval.toString() || "0",
      description: "Requiring action",
      icon: "⏳",
    },
    {
      title: "Approved Today",
      value: travelRequestsKpis?.approved_today.toString() || "0",
      description: "Ready for booking",
      icon: "✅",
    },
    {
      title: "Completed Bookings",
      value: travelRequestsKpis?.completed_bookings.toString() || "0",
      description: "This month",
      icon: "🚀",
    },
  ];
  return <SectionCards data={sectionCardsData} />;
}
