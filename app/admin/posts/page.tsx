import { prisma } from "@/lib/db/prisma";
export const dynamic = "force-dynamic";

export default async function PostsAdminPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: { author: { select: { name: true } }, category: { select: { name: true } } },
    take: 100,
  });

  return (
    <main className="px-5 py-8 sm:px-7 lg:px-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-zinc-500">Content</p><h1 className="mt-1 text-3xl font-bold text-zinc-950">Posts</h1></div>
        <button className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">New post</button>
      </div>
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {posts.length ? (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500"><tr><th className="px-5 py-3">Title</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Author</th></tr></thead>
            <tbody className="divide-y divide-zinc-100">{posts.map((post) => (
              <tr key={post.id.toString()}><td className="px-5 py-4"><div className="font-semibold">{post.title}</div><div className="text-xs text-zinc-500">/{post.slug}</div></td><td className="px-5 py-4">{post.category?.name ?? "Uncategorized"}</td><td className="px-5 py-4">{post.status}</td><td className="px-5 py-4">{post.author.name}</td></tr>
            ))}</tbody>
          </table></div>
        ) : <div className="p-10 text-center text-sm text-zinc-500">No posts yet.</div>}
      </div>
    </main>
  );
}
