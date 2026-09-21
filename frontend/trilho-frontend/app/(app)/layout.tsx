import { Sidebar } from "../components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-trilho-bg">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
