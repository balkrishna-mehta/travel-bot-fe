import React from "react";
import { BudgetBandsTable } from "@/components/budget-bands/budget-bands-table";
import { BudgetBandsCards } from "@/components/budget-bands/budget-bands-cards";
import { AuthAwareWrapper } from "@/components/common/auth-aware-wrapper";

const BudgetBandsPage = () => {
  return (
    <div className="px-4 lg:px-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Budget Bands</h1>
        <p className="text-muted-foreground">
          Configure budget limits and spending categories
        </p>
      </div>
      <AuthAwareWrapper>
        <BudgetBandsCards />
      </AuthAwareWrapper>
      <AuthAwareWrapper>
        <BudgetBandsTable />
      </AuthAwareWrapper>
    </div>
  );
};

export default BudgetBandsPage;
