import { AdminSidebar } from "./_components/admin-sidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-root flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <AdminSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col bg-background">{children}</div>
    </div>
  );
}
