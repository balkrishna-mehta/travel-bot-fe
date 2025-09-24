import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import React from "react";
import { InvoicesTable } from "@/components/invoices/invoices-table";
import { InvoicesCards } from "@/components/invoices/invoices-cards";

const InvoicesPage = () => {
  return (
    <div className="px-4 lg:px-6 flex flex-col gap-6">
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">
              Manage and track all travel-related invoices
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>
      <InvoicesCards />
      <div className="rounded-lg border p-6">
        <InvoicesTable />
      </div>
    </div>
  );
};

export default InvoicesPage;
