"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminNavItems } from "./admin-nav-items";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onResize() {
      if (window.innerWidth >= 1024) setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="admin-mobile-drawer"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-950 lg:hidden"
      >
        <span className="relative block h-5 w-5">
          <span className={`absolute left-0 top-1 block h-0.5 w-5 bg-current transition ${open ? "translate-y-1.5 rotate-45" : ""}`} />
          <span className={`absolute left-0 top-[9px] block h-0.5 w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
          <span className={`absolute left-0 top-4 block h-0.5 w-5 bg-current transition ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
        </span>
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close navigation overlay"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          />

          <aside
            id="admin-mobile-drawer"
            className="fixed inset-y-0 left-0 z-50 w-[min(86vw,320px)] overflow-y-auto bg-zinc-950 text-white shadow-2xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-5">
              <Link href="/admin" onClick={() => setOpen(false)}>
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
                  SIRA CMS
                </div>
                <div className="mt-1 text-xl font-bold tracking-tight">
                  Administration
                </div>
              </Link>

              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-zinc-700 text-xl text-zinc-300"
              >
                ×
              </button>
            </div>

            <nav className="space-y-1 p-3">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </>
      ) : null}
    </>
  );
}
