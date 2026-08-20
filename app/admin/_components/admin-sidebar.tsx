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
