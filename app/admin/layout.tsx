import { auth } from "@/auth";
import { AdminHeader } from "./_components/admin-header";
import { AdminSidebar } from "./_components/admin-sidebar";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    return children;
  }

  return (
    <div className="min-h-screen bg-zinc-100 lg:flex">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <AdminHeader
          name={session.user.name}
          email={session.user.email}
        />

        <div className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
