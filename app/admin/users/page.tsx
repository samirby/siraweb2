import { prisma } from "@/lib/db/prisma";
export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" }, include: { role: { select: { name: true } } } });
  return (
    <main className="px-5 py-8 sm:px-7 lg:px-10">
      <p className="text-sm font-medium text-zinc-500">Access</p><h1 className="mt-1 text-3xl font-bold text-zinc-950">Users</h1>
      <div className="mt-6 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white shadow-sm">{users.map((user) => <div key={user.id.toString()} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="font-semibold">{user.name}</p><p className="text-sm text-zinc-500">{user.email}</p></div><div className="text-right"><p className="text-sm font-medium">{user.role.name}</p><p className="text-xs text-zinc-500">{user.status}</p></div></div>)}</div>
    </main>
  );
}
