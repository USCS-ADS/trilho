import { AppShell } from "../components/app-shell";
import { CurrentUserProvider } from "../components/current-user";
import { getCurrentUser } from "../lib/session/dal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Verifica a sessão (redireciona ao /login se inválida) e carrega o usuário.
  const user = await getCurrentUser();

  return (
    <CurrentUserProvider
      user={{
        name: user.name,
        initials: user.initials,
        email: user.email,
        isAdmin: user.role === "admin",
      }}
    >
      <AppShell>{children}</AppShell>
    </CurrentUserProvider>
  );
}
