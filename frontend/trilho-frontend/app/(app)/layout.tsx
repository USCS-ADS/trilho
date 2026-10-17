import { AppShell } from "../components/app-shell";
import { CurrentUserProvider } from "../components/current-user";
import { fetchNotifications } from "../lib/api/notifications";
import { getCurrentUser, verifySession } from "../lib/session/dal";
import type { NotificationsSnapshot } from "../lib/notifications/types";
import { NotificationsProvider } from "../components/notifications";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Verifica a sessão (redireciona ao /login se inválida) e carrega o usuário.
  const user = await getCurrentUser();
  const session = await verifySession();

  // O sino não pode derrubar a página: sem a API, segue sem notificações.
  let notifications: NotificationsSnapshot = { unreadCount: 0, notifications: [] };
  try {
    notifications = await fetchNotifications(session.token);
  } catch {
    // Segue sem notificações; a próxima atualização do sino tenta de novo.
  }

  return (
    <CurrentUserProvider
      user={{
        name: user.name,
        initials: user.initials,
        email: user.email,
        isAdmin: user.role === "admin",
      }}
    >
      <NotificationsProvider initial={notifications}>
        <AppShell>{children}</AppShell>
      </NotificationsProvider>
    </CurrentUserProvider>
  );
}
