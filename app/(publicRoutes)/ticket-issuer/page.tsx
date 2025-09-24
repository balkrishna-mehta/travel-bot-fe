import React from "react";
import { TicketIssuerTable } from "@/components/ticket-issuer/ticket-issuer-table";
import { LogoutButton } from "@/components/auth/logout-button";

const TicketIssuerPage = () => {
  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Ticket Issuer</h1>
          <p className="text-muted-foreground">
            Issue and manage travel tickets for manager-approved bookings
          </p>
        </div>
        <LogoutButton />
      </div>
      <div className="rounded-lg border p-6">
        <TicketIssuerTable />
      </div>
    </div>
  );
};

export default TicketIssuerPage;
