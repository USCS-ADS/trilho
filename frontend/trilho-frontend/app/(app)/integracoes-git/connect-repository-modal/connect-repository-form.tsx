"use client";

import { Button } from "@/app/components/button";
import { Input } from "@/app/components/input";
import { ModalFooter } from "@/app/components/modal";
import { Select } from "@/app/components/select";
import { PROVIDER_LABELS, PROVIDERS } from "@/app/lib/git-integrations/meta";
import type { ConnectRepositoryInput, GitProvider } from "@/app/lib/git-integrations/types";
import { useFormValidation } from "@/app/lib/validation/use-form-validation";
import { FormEvent, useState } from "react";
import { connectRepositorySchema } from "../schema";

interface ConnectRepositoryFormProps {
    teams: { id: string; name: string }[];
    onSubmit: (input: ConnectRepositoryInput) => void;
    onCancel: () => void;
}

export function ConnectRepositoryForm({ teams, onSubmit, onCancel }: ConnectRepositoryFormProps) {
    const [provider, setProvider] = useState<GitProvider>("github");
    const [fullName, setFullName] = useState("");
    const [teamId, setTeamId] = useState(teams[0]?.id ?? "");
    const { errors, validateValues, clearError } = useFormValidation(connectRepositorySchema);

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = validateValues({ provider, fullName, teamId });
        if (!data) return;

        // TODO: chamar a API (OAuth/token do provedor + registro do webhook).
        onSubmit(data);
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <Select
                name="provider"
                label="Provedor"
                value={provider}
                onChange={(event) => setProvider(event.target.value as GitProvider)}
                options={PROVIDERS.map((value) => ({ value, label: PROVIDER_LABELS[value] }))}
            />

            <Input
                name="fullName"
                label="Repositório"
                value={fullName}
                onChange={(event) => {
                    setFullName(event.target.value);
                    clearError("fullName");
                }}
                placeholder="dono/repositório"
                error={errors.fullName}
                autoFocus
                required
            />

            <Select
                name="teamId"
                label="Time responsável"
                value={teamId}
                onChange={(event) => setTeamId(event.target.value)}
                error={errors.teamId}
                options={teams.map((team) => ({ value: team.id, label: team.name }))}
            />

            <p className="mb-2 text-xs text-trilho-dim">
                O Trilho vai registrar um webhook para eventos de commit, pull request e merge.
            </p>

            <ModalFooter>
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit">Conectar</Button>
            </ModalFooter>
        </form>
    );
}
