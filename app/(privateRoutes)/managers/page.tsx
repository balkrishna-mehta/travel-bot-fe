import React from "react";
import { ManagersTable } from "@/components/managers/managers-table";
import { ManagerCards } from "@/components/managers/manager-cards";

const ManagersPage = () => {
  return (
    <div className="px-4 lg:px-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Managers</h1>
        <p className="text-muted-foreground">
          Manage managers and their permissions
        </p>
      </div>
      <ManagerCards />
      <div className="rounded-lg border p-6">
        <ManagersTable />
      </div>
    </div>
  );
};

export default ManagersPage;
