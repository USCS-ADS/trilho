import { TASKS } from "./mock-data";
import type { Task } from "./types";

export * from "./meta";
export { MOCK_TODAY } from "./mock-data";
export { isOverdue } from "./overdue";
export type * from "./types";

// Costura para a API: hoje lê o mock; na integração, estas funções passam a
// chamar o backend (e viram assíncronas) sem tocar nas telas.
//
// Código que roda no cliente e só precisa de tipos/metadados/regras puras deve
// importar de "./meta", "./types" e "./overdue" para não levar o mock no bundle.

export function listTasks(): Task[] {
    return TASKS;
}

export function getTaskById(taskId: string): Task | undefined {
    return TASKS.find((task) => task.id === taskId);
}
