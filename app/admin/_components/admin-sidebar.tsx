"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { adminNavItems } from "./admin-nav-items";
import { AdminNavIcon } from "./admin-nav-icon";

export function AdminSidebar({
  permissions,
}: {
  permissions: string[];
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;

    return (
      window.localStorage.getItem("sira-admin-sidebar-collapsed") === "true"
    );
  });

  const visibleNavItems = adminNavItems.filter(
    (item) =>
      !("permission" in item) ||
      permissions.includes(item.permission),
  );

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sira-admin-sidebar-width",
      collapsed ? "5rem" : "16rem",
    );
  }, [collapsed]);

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(
        "sira-admin-sidebar-collapsed",
        String(next),
      );

      return next;
    });
  }

  return (
    <aside
      className={`sticky top-0 hidden h-dvh shrink-0 self-start flex-col overflow-y-auto overflow-x-hidden bg-zinc-950 text-white shadow-xl transition-[width] duration-200 lg:flex relative z-10 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col">
        <div
          className={`flex min-h-20 items-center border-b border-zinc-800 ${
            collapsed ? "justify-center px-3" : "justify-between gap-3 px-5"
          }`}
        >
          <Link href="/admin" className="min-w-0">
            {collapsed ? (
              <div
                className="grid h-10 w-10 place-items-center rounded-xl bg-white text-sm font-black tracking-tight text-zinc-950"
                title="SIRA CMS"
              >
                S
              </div>
            ) : (
              <>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
                  SIRA CMS
                </div>
                <div className="mt-1 truncate text-xl font-bold tracking-tight">
                  Administration
                </div>
              </>
            )}
          </Link>

          {!collapsed ? (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              ‹
            </button>
          ) : null}
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
          {visibleNavItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                title={collapsed ? item.label : undefined}
                className={`flex items-center rounded-xl text-sm font-medium transition ${
                  collapsed
                    ? "h-12 justify-center px-0"
                    : "gap-3 px-4 py-3"
                } ${
                  active
                    ? "bg-white text-zinc-950"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <AdminNavIcon name={item.label} className="h-5 w-5 shrink-0" />

                {!collapsed ? (
                  <span className="truncate">{item.label}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {collapsed ? (
          <div className="border-t border-zinc-800 p-3">
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="grid h-12 w-full place-items-center rounded-xl border border-zinc-800 bg-zinc-900 text-lg text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
