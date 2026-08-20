#!/usr/bin/env bash
set -euo pipefail

echo "=== SIRA Web v2 — Admin CMS Phase 1 ==="

mkdir -p app/admin/_components app/admin/pages app/admin/posts app/admin/media app/admin/menus app/admin/users app/admin/settings app/admin/messages

cat > app/admin/_components/admin-sidebar.tsx <<'EOF'
import Link from "next/link";

const items = [
  ["/admin", "Dashboard"],
  ["/admin/pages", "Pages"],
  ["/admin/posts", "Posts"],
  ["/admin/media", "Media"],
  ["/admin/menus", "Menus"],
  ["/admin/users", "Users"],
  ["/admin/messages", "Messages"],
  ["/admin/settings", "Settings"],
] as const;

export function AdminSidebar() {
  return (
    <aside className="w-full border-b border-zinc-200 bg-zinc-950 text-white lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:border-zinc-800">
      <div className="px-5 py-5">
        <Link href="/admin">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">SIRA CMS</div>
          <div className="mt-1 text-xl font-bold tracking-tight">Administration</div>
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:block lg:space-y-1 lg:overflow-visible">
        {items.map(([href, label]) => (
          <Link key={href} href={href} className="whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white lg:block">
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
EOF

cat > app/admin/_components/admin-header.tsx <<'EOF'
import { signOut } from "@/auth";

export function AdminHeader({ name, email }: { name?: string | null; email?: string | null }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="flex min-h-16 items-center justify-between gap-4 px-5 sm:px-7">
        <div>
          <p className="text-sm font-semibold text-zinc-950">{name ?? "Administrator"}</p>
          <p className="text-xs text-zinc-500">{email ?? ""}</p>
        </div>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
          <button type="submit" className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
EOF

cat > app/admin/layout.tsx <<'EOF'
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
EOF

cat > app/admin/page.tsx <<'EOF'
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
EOF

cat > app/admin/pages/page.tsx <<'EOF'
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
EOF

cat > app/admin/posts/page.tsx <<'EOF'
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
EOF

cat > app/admin/media/page.tsx <<'EOF'
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
EOF

cat > app/admin/menus/page.tsx <<'EOF'
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
EOF

cat > app/admin/users/page.tsx <<'EOF'
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
EOF

cat > app/admin/messages/page.tsx <<'EOF'
import { prisma } from "@/lib/db/prisma";
export const dynamic = "force-dynamic";

export default async function MessagesAdminPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <main className="px-5 py-8 sm:px-7 lg:px-10">
      <p className="text-sm font-medium text-zinc-500">Inbox</p><h1 className="mt-1 text-3xl font-bold text-zinc-950">Messages</h1>
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {messages.length ? <div className="divide-y divide-zinc-100">{messages.map((m) => <article key={m.id.toString()} className="p-5"><div className="flex justify-between gap-3"><div><h2 className="font-semibold">{m.subject ?? "Contact message"}</h2><p className="text-sm text-zinc-500">{m.name} · {m.email}</p></div><span className="text-xs font-semibold text-zinc-500">{m.status}</span></div><p className="mt-3 text-sm text-zinc-700">{m.message}</p></article>)}</div> : <div className="p-10 text-center text-sm text-zinc-500">No messages yet.</div>}
      </div>
    </main>
  );
}
EOF

cat > app/admin/settings/page.tsx <<'EOF'
import { prisma } from "@/lib/db/prisma";
export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  const settings = await prisma.setting.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
  return (
    <main className="px-5 py-8 sm:px-7 lg:px-10">
      <p className="text-sm font-medium text-zinc-500">System</p><h1 className="mt-1 text-3xl font-bold text-zinc-950">Settings</h1>
      <div className="mt-6 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white shadow-sm">{settings.map((s) => <div key={s.id.toString()} className="px-5 py-4"><div className="flex justify-between gap-3"><div><p className="font-semibold">{s.key}</p><p className="text-xs uppercase text-zinc-400">{s.group}</p></div><span className="text-xs text-zinc-500">{s.isPublic ? "Public" : "Private"}</span></div><pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600">{JSON.stringify(s.value)}</pre></div>)}</div>
    </main>
  );
}
EOF

echo
echo "=== Type check ==="
npx tsc --noEmit

echo
echo "=== Build ==="
npm run build

echo
echo "=== Git status ==="
git status --short

echo
echo "DONE — review locally before commit/push."
