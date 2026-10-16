import { PRIORITIES, PRIORITY_LABELS } from "@/app/lib/tasks/meta";
import type { TaskPriority } from "@/app/lib/tasks/types";

interface PriorityPickerProps {
    value: TaskPriority;
    onChange: (priority: TaskPriority) => void;
}

/** Seletor de prioridade em "pílulas" (radio group acessível). */
export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
    return (
        <fieldset className="mb-4">
            <legend className="mb-2 block text-xs font-medium uppercase tracking-wide text-trilho-dim">
                Prioridade
            </legend>

            <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((priority) => (
                    <label key={priority} className="cursor-pointer">
                        <input
                            type="radio"
                            name="priority"
                            value={priority}
                            checked={value === priority}
                            onChange={() => onChange(priority)}
                            className="peer sr-only"
                        />
                        <span className="inline-block rounded-full border border-trilho-border px-3 py-1.5 text-xs text-trilho-dim transition-colors hover:text-trilho-text peer-checked:border-trilho-accent peer-checked:bg-trilho-accent/15 peer-checked:text-trilho-accent peer-focus-visible:ring-2 peer-focus-visible:ring-trilho-accent">
                            {PRIORITY_LABELS[priority]}
                        </span>
                    </label>
                ))}
            </div>
        </fieldset>
    );
}
