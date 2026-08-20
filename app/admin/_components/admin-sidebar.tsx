import Link from "next/link";
import { adminNavItems } from "./admin-nav-items";

export function AdminSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 text-white lg:block">
      <div className="border-b border-zinc-800 px-5 py-5">
        <Link href="/admin" className="block">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
            SIRA CMS
          </div>
          <div className="mt-1 text-xl font-bold tracking-tight">
            Administration
          </div>
        </Link>
      </div>

      <nav className="space-y-1 p-3">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
