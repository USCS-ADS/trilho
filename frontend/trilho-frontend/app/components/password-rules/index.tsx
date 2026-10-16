import { PASSWORD_RULES } from "@/app/lib/password-rules";
import { CheckIcon } from "../icons";

interface PasswordRulesProps {
    value: string;
}

/** Checklist das regras de senha (RF01) que reage ao valor digitado. */
export function PasswordRules({ value }: PasswordRulesProps) {
    return (
        <ul className="mb-4 flex flex-col gap-1.5" aria-label="Requisitos da senha">
            {PASSWORD_RULES.map((rule) => {
                const isMet = rule.test(value);

                return (
                    <li
                        key={rule.id}
                        data-met={isMet}
                        className={`flex items-center gap-2 text-xs ${
                            isMet ? "text-trilho-success" : "text-trilho-dim"
                        }`}
                    >
                        <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                                isMet
                                    ? "border-trilho-success bg-trilho-success/15"
                                    : "border-trilho-border"
                            }`}
                        >
                            {isMet && <CheckIcon className="h-2.5 w-2.5" strokeWidth={3} />}
                        </span>
                        {rule.label}
                    </li>
                );
            })}
        </ul>
    );
}
