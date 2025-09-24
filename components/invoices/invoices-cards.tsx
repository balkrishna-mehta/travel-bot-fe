"use client";
import React from "react";
import { SectionCards } from "@/components/common/section-cards";
import { useQuery } from "@tanstack/react-query";
import { fetchInvoicesKpis } from "@/api/invoices";

export function InvoicesCards() {
  const { data: invoicesKpis } = useQuery({
    queryKey: ["invoicesKpis"],
    queryFn: () => fetchInvoicesKpis(),
  });

  const sectionCardsData = [
    {
      title: "Total Invoices",
      value: invoicesKpis?.total_invoices.toString() || "0",
      description: "Invoices submitted this month",
      icon: "📄",
    },
    {
      title: "Total Amount",
      value: `$${invoicesKpis?.total_amount.toString() || "0"}`,
      description: "Combined value of all invoices",
      icon: "💰",
    },
    {
      title: "Flight Expenses",
      value: `$${invoicesKpis?.flight_expenses.toString() || "0"}`,
      description: "Total flight costs",
      icon: "✈️",
    },
    {
      title: "Avg Invoice",
      value: `$${invoicesKpis?.avg_invoice.toString() || "0"}`,
      description: "Average invoice amount",
      icon: "📊",
    },
  ];
  return <SectionCards data={sectionCardsData} />;
}
