import { PageHeader } from "../../components/page-header";
import { toUserMessage } from "@/app/lib/api/errors";
import { fetchDashboard } from "@/app/lib/api/dashboard";
import type { DashboardData } from "@/app/lib/dashboard/types";
import { getCurrentUser, verifySession } from "@/app/lib/session/dal";
import { SprintChart } from "./sprint-chart";
import { StatsSummary } from "./stats-summary";
import { TeamWorkload } from "./team-workload";

export default async function DashboardPage() {
  const session = await verifySession();
  const user = await getCurrentUser();

  let data: DashboardData | undefined;
  let loadError: string | undefined;

  try {
    data = await fetchDashboard(session.token, user.role);
  } catch (error) {
    loadError = toUserMessage(error);
  }

  const isConsolidated = user.role !== "member";

  return (
    <>
      <PageHeader
        title="Dashboard Consolidado"
        description={isConsolidated ? "Visão geral dos times" : "Visão geral dos seus times"}
      />

      <div className="flex flex-col gap-6 p-8">
        {loadError && (
          <p
            role="alert"
            className="rounded-lg border border-trilho-danger/30 bg-trilho-danger/10 px-3 py-2 text-sm text-trilho-danger"
          >
            {loadError}
          </p>
        )}

        {data && (
          <>
            <StatsSummary data={data} />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className={data.sprints ? "lg:col-span-2" : "lg:col-span-3"}>
                <TeamWorkload workloads={data.workloads} thresholdPercent={data.thresholdPercent} />
              </div>
              {data.sprints && <SprintChart sprints={data.sprints} />}
            </div>
          </>
        )}
      </div>
    </>
  );
}
