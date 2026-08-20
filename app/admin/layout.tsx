import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
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

  const email = session.user.email?.toLowerCase();

  const currentUser = email
    ? await prisma.user.findUnique({
        where: { email },
        select: {
          role: {
            select: {
              permissions: {
                select: {
                  permission: {
                    select: { key: true },
                  },
                },
              },
            },
          },
        },
      })
    : null;

  const permissions =
    currentUser?.role.permissions.map(
      (item) => item.permission.key,
    ) ?? [];

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-100 lg:flex">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-0 z-0 hidden w-[var(--sira-admin-sidebar-width,16rem)] bg-zinc-950 transition-[width] duration-200 lg:block"
      />
      <AdminSidebar permissions={permissions} />

      <div className="min-w-0 flex-1">
        <AdminHeader
          name={session.user.name}
          email={session.user.email}
                  permissions={permissions}
        />

        <div className="min-w-0 overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
