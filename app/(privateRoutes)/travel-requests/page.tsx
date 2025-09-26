import React from "react";
import { TravelRequestsTable } from "@/components/travel-requests/travel-requests-table";
import { TravelRequestsCards } from "@/components/travel-requests/travel-requests-cards";
import { AuthAwareWrapper } from "@/components/common/auth-aware-wrapper";

const TravelRequestsPage = () => {
  return (
    <div className="px-4 lg:px-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Travel Requests</h1>
        <p className="text-muted-foreground">
          Review and manage travel requests from employees
        </p>
      </div>
      <AuthAwareWrapper>
        <TravelRequestsCards />
      </AuthAwareWrapper>
      <AuthAwareWrapper>
        <TravelRequestsTable />
      </AuthAwareWrapper>
    </div>
  );
};

export default TravelRequestsPage;
