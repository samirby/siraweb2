import { prisma } from "@/lib/db/prisma";
export const dynamic = "force-dynamic";

export default async function PagesAdminPage() {
  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { name: true } } },
    take: 100,
  });

  return (
    <main className="px-5 py-8 sm:px-7 lg:px-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-zinc-500">Content</p><h1 className="mt-1 text-3xl font-bold text-zinc-950">Pages</h1></div>
        <button className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">New page</button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {pages.length ? (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500"><tr><th className="px-5 py-3">Title</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Author</th></tr></thead>
            <tbody className="divide-y divide-zinc-100">{pages.map((page) => (
              <tr key={page.id.toString()}><td className="px-5 py-4"><div className="font-semibold">{page.title}</div><div className="text-xs text-zinc-500">/{page.slug}</div></td><td className="px-5 py-4">{page.pageType}</td><td className="px-5 py-4">{page.status}</td><td className="px-5 py-4">{page.author.name}</td></tr>
            ))}</tbody>
          </table></div>
        ) : <div className="p-10 text-center text-sm text-zinc-500">No pages yet.</div>}
      </div>
    </main>
  );
}
