import { daysBetween } from "../date";
import type { TaskPriority } from "../tasks/types";

/**
 * Mock da sugestão de prioridade (RF07): hoje só olha a proximidade do prazo.
 * Espelha a regra do backend (RuleBasedPrioritizationEngine) para dar retorno imediato no formulário.
 */
export function suggestPriority(today: string, dueDate?: string): TaskPriority {
    if (!dueDate) return "medium";

    const daysLeft = daysBetween(today, dueDate);
    if (daysLeft < 0) return "urgent";
    if (daysLeft <= 7) return "high";
    if (daysLeft <= 21) return "medium";
    return "low";
}
