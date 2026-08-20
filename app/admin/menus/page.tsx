import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function MenusAdminPage() {
  await requirePermission("menus.view");

  const menus = await prisma.menu.findMany({
    orderBy: [
      { location: "asc" },
      { name: "asc" },
    ],
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            Navigation
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
            Menus
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Manage top, footer, secondary and custom navigation menus.
          </p>
        </div>

        <Link
          href="/admin/menus/new"
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          New menu
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {menus.map((menu) => (
          <Link
            key={menu.id.toString()}
            href={`/admin/menus/${menu.id.toString()}/edit`}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              {menu.location ?? "CUSTOM"}
            </p>

            <h2 className="mt-2 text-xl font-bold text-zinc-950">
              {menu.name}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              /{menu.slug}
            </p>

            <div className="mt-5 text-sm font-medium text-zinc-600">
              {menu._count.items} menu items
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
