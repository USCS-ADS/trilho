"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { Textarea } from "@/app/components/textarea";
import type { TeamWithMembers } from "@/app/lib/teams/types";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { FormEvent, useState } from "react";
import { updateTeamAction } from "../actions";
import { manageTeamSchema } from "./schema";
import type { RunTeamAction } from "./types";

interface TeamDetailsSectionProps {
    team: TeamWithMembers;
    disabled: boolean;
    run: RunTeamAction;
}

export function TeamDetailsSection({ team, disabled, run }: TeamDetailsSectionProps) {
    const [name, setName] = useState(team.name);
    const [description, setDescription] = useState(team.description);
    const { errors, validateValues, clearError } = useFormValidation(manageTeamSchema);

    const unchanged = name.trim() === team.name && description.trim() === team.description;

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const data = validateValues({ name, description });
        if (!data) return;

        await run(() => updateTeamAction(team.id, data));
    }

    return (
        <form onSubmit={handleSubmit} noValidate aria-label="Dados do time">
            <Input
                name="name"
                label="Nome do time"
                value={name}
                onChange={(event) => {
                    setName(event.target.value);
                    clearError("name");
                }}
                error={errors.name}
                disabled={disabled}
                required
            />
            <Textarea
                name="description"
                label="Descrição"
                value={description}
                onChange={(event) => {
                    setDescription(event.target.value);
                    clearError("description");
                }}
                error={errors.description}
                disabled={disabled}
            />
            <div className="flex justify-end">
                <Button type="submit" className="text-sm" disabled={disabled || unchanged}>
                    Salvar dados
                </Button>
            </div>
        </form>
    );
}
