"use client";
import React from "react";
import { SectionCards } from "@/components/common/section-cards";
import { useQuery } from "@tanstack/react-query";
import { fetchTravelRequestsKpis } from "@/api/travel-requests";

export function TravelRequestsCards() {
  const { data: travelRequestsKpis } = useQuery({
    queryKey: ["travelRequestsKpis"],
    queryFn: () => fetchTravelRequestsKpis(),
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
