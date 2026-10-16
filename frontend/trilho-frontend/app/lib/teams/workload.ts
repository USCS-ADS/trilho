/** Acima disso o time é sinalizado como sobrecarregado (RF08). */
export const CAPACITY_THRESHOLD = 85;

export type WorkloadTone = "danger" | "warning" | "cyan" | "success";

export function getWorkloadTone(workload: number): WorkloadTone {
    if (workload > CAPACITY_THRESHOLD) return "danger";
    if (workload >= 70) return "warning";
    if (workload >= 60) return "cyan";
    return "success";
}
