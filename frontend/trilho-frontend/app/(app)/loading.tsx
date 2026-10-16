/** Esqueleto exibido enquanto uma página autenticada carrega (navegação com dados no servidor). */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-label="Carregando conteúdo">
      <div className="border-b border-trilho-border px-4 py-5 sm:px-8 sm:py-6">
        <div className="h-6 w-56 animate-pulse rounded bg-trilho-surface-2" />
        <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded bg-trilho-surface" />
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-8 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border border-trilho-border bg-trilho-surface"
          />
        ))}
      </div>

      <span className="sr-only">Carregando...</span>
    </div>
  );
}
