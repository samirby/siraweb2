import { prisma } from "@/lib/db/prisma";
export const dynamic = "force-dynamic";

export default async function MenusAdminPage() {
  const menus = await prisma.menu.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { items: true } } } });
  return (
    <main className="px-5 py-8 sm:px-7 lg:px-10">
      <p className="text-sm font-medium text-zinc-500">Navigation</p><h1 className="mt-1 text-3xl font-bold text-zinc-950">Menus</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">{menus.map((menu) => <article key={menu.id.toString()} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"><p className="text-xs font-semibold uppercase text-zinc-500">{menu.location ?? "Unassigned"}</p><h2 className="mt-2 text-xl font-bold">{menu.name}</h2><p className="mt-2 text-sm text-zinc-500">{menu._count.items} items</p></article>)}</div>
    </main>
  );
}
