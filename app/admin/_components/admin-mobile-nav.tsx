"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { adminNavItems } from "./admin-nav-items";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

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
    const previousOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const overlay = open ? (
    <div className="fixed inset-0 z-[9999] lg:hidden">
      <button
        type="button"
        aria-label="Close navigation overlay"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
      />

      <aside
        id="admin-mobile-drawer"
        className="absolute inset-y-0 left-0 z-[10000] flex w-[88vw] max-w-[340px] flex-col overflow-hidden border-r border-zinc-800 bg-zinc-950 text-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-800 px-5 py-5">
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="min-w-0"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-400">
              SIRA CMS
            </div>
            <div className="mt-1 truncate text-xl font-bold tracking-tight">
              Administration
            </div>
          </Link>

          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-zinc-700 bg-zinc-900 text-xl text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
          >
            ×
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-3">
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
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="admin-mobile-drawer"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-950 shadow-sm lg:hidden"
      >
        <span className="relative block h-5 w-5">
          <span
            className={`absolute left-0 top-1 block h-0.5 w-5 bg-current transition ${
              open ? "translate-y-1.5 rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-[9px] block h-0.5 w-5 bg-current transition ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-4 block h-0.5 w-5 bg-current transition ${
              open ? "-translate-y-1.5 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
