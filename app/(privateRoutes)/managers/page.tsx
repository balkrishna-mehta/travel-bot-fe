import React from "react";
import { ManagersTable } from "@/components/managers/managers-table";
import { ManagerCards } from "@/components/managers/manager-cards";
import { AuthAwareWrapper } from "@/components/common/auth-aware-wrapper";

const ManagersPage = () => {
  return (
    <div className="px-4 lg:px-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Managers</h1>
        <p className="text-muted-foreground">
          Manage managers and their permissions
        </p>
      </div>

      <AuthAwareWrapper>
        <ManagerCards />
      </AuthAwareWrapper>

      <AuthAwareWrapper>
        <ManagersTable />
      </AuthAwareWrapper>
    </div>
  );
};

export default ManagersPage;
