import { newTaskSchema } from "../../new-task-modal/schema";

/** Campos editáveis da tarefa (RF03): mesmas regras da criação; o time e o status não mudam aqui. */
export const editTaskSchema = newTaskSchema.pick({
    title: true,
    description: true,
    assigneeId: true,
    dueDate: true,
    priority: true,
});
