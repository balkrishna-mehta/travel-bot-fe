import React from "react";
import { EmployeesTable } from "@/components/employees/employees-table";
import { EmployeesCards } from "@/components/employees/employees-cards";
import { AuthAwareWrapper } from "@/components/common/auth-aware-wrapper";

const EmployeesPage = () => {
  return (
    <div className="px-4 lg:px-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Employees</h1>
        <p className="text-muted-foreground">
          Manage your team members and their roles
        </p>
      </div>
      <AuthAwareWrapper>
        <EmployeesCards />
      </AuthAwareWrapper>
      <AuthAwareWrapper>
        <EmployeesTable />
      </AuthAwareWrapper>
    </div>
  );
};

export default EmployeesPage;
