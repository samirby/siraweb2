import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [pages, posts, media, messages, users, publishedPages, publishedPosts] = await Promise.all([
    prisma.page.count(),
    prisma.post.count(),
    prisma.media.count(),
    prisma.contactMessage.count(),
    prisma.user.count(),
    prisma.page.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
  ]);

  const cards = [
    ["Pages", pages, `${publishedPages} published`, "/admin/pages"],
    ["Posts", posts, `${publishedPosts} published`, "/admin/posts"],
    ["Media", media, "library items", "/admin/media"],
    ["Messages", messages, "contact messages", "/admin/messages"],
    ["Users", users, "CMS users", "/admin/users"],
  ] as const;

  return (
    <main className="px-5 py-8 sm:px-7 lg:px-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-zinc-500">Overview</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-600">Manage content, media, navigation, users and settings.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, note, href]) => (
          <Link key={label} href={href} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            <p className="mt-3 text-4xl font-bold text-zinc-950">{value}</p>
            <p className="mt-2 text-xs text-zinc-500">{note}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
