import { prisma } from "@/lib/db/prisma";
export const dynamic = "force-dynamic";

export default async function MediaAdminPage() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <main className="px-5 py-8 sm:px-7 lg:px-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-zinc-500">Library</p><h1 className="mt-1 text-3xl font-bold text-zinc-950">Media</h1></div>
        <button className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">Upload media</button>
      </div>
      {media.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((item) => <article key={item.id.toString()} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"><p className="truncate font-semibold">{item.originalName}</p><p className="mt-1 text-xs text-zinc-500">{item.type} · {item.mimeType}</p></article>)}
        </div>
      ) : <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500 shadow-sm">Media library is empty.</div>}
    </main>
  );
}
