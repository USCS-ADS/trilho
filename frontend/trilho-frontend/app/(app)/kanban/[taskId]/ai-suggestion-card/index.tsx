import { Card } from "@/app/components/card";
import { BoltIcon } from "@/app/components/icons";
import { PRIORITY_LABELS } from "@/app/lib/tasks/meta";
import type { TaskAiSuggestion } from "@/app/lib/tasks/types";

export function AiSuggestionCard({ suggestion }: { suggestion: TaskAiSuggestion }) {
    return (
        <Card highlighted>
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-trilho-accent-2">
                <BoltIcon className="h-4 w-4" />
                Sugestão da IA
            </h2>

            <p className="text-sm leading-relaxed text-trilho-text">
                Prioridade <strong>{PRIORITY_LABELS[suggestion.priority]}</strong> sugerida:{" "}
                {suggestion.justification}
            </p>
            <p className="mt-3 text-xs text-trilho-dim">
                É uma recomendação — a decisão final é do líder do time.
            </p>
        </Card>
    );
}
