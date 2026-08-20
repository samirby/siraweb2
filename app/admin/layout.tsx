import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminHeader } from "./_components/admin-header";
import { AdminSidebar } from "./_components/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-zinc-100 lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader name={session.user.name} email={session.user.email} />
        {children}
      </div>
    </div>
  );
}
