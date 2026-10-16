import { daysBetween } from "../date";
import type { Task } from "./types";

/** RF03: prazo vencido e status diferente de "Concluído" é destacado como atrasada. */
export function isOverdue(task: Pick<Task, "status" | "dueDate">, today: string): boolean {
    if (task.status === "done" || !task.dueDate) return false;
    return daysBetween(today, task.dueDate) < 0;
}
