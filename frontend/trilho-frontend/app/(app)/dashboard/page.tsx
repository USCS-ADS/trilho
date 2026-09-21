import { PageHeader } from "../../components/page-header";
import { SprintChart } from "./sprint-chart";
import { StatsSummary } from "./stats-summary";
import { TeamWorkload } from "./team-workload";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard Consolidado"
        description="Visão geral de todos os times"
      />

      <div className="flex flex-col gap-6 p-8">
        <StatsSummary />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <TeamWorkload />
          </div>
          <SprintChart />
        </div>
      </div>
    </>
  );
}
