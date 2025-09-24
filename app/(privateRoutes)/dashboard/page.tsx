import { ChartAreaInteractive } from "@/components/common/chart-area-interactive";
import { DashboardCards } from "@/components/dashboard/dashboard-cards";

export default function DashboardPage() {
  return (
    <div className="px-4 lg:px-6 flex flex-col gap-6">
      <DashboardCards />
      <ChartAreaInteractive />
    </div>
  );
}
