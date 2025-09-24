import React from "react";
import { EmployeesTable } from "@/components/employees/employees-table";
import { EmployeesCards } from "@/components/employees/employees-cards";

const EmployeesPage = () => {
  return (
    <div className="px-4 lg:px-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Employees</h1>
        <p className="text-muted-foreground">
          Manage your team members and their roles
        </p>
      </div>
      <EmployeesCards />
      <div className="rounded-lg border p-6">
        <EmployeesTable />
      </div>
    </div>
  );
};

export default EmployeesPage;
