"use client";

import { Button } from "../components/button";
import { EmptyState } from "../components/empty-state";

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <EmptyState
      title="Algo deu errado"
      description={
        error.digest
          ? `Não foi possível carregar esta página. Se o problema persistir, informe o código ${error.digest}.`
          : "Não foi possível carregar esta página. Tente novamente em instantes."
      }
      action={<Button onClick={() => retry()}>Tentar novamente</Button>}
    />
  );
}
