"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type MobileItem = {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
};

type Props = {
  siteName: string;
  topItems: MobileItem[];
  secondaryItems: MobileItem[];
};

export function PublicMobileNav({
  siteName,
  topItems,
  secondaryItems,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onResize() {
      if (window.innerWidth >= 768) setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [open]);

  const drawer = mounted
    ? createPortal(
        <div
          className={`fixed inset-0 z-[9999] transition-[visibility] duration-200 md:hidden ${
            open ? "visible" : "invisible"
          }`}
          aria-hidden={!open}
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className={`absolute inset-0 bg-black/55 backdrop-blur-[1px] transition-opacity duration-200 ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />

          <aside
            className={`absolute inset-y-0 right-0 z-[10000] flex w-[86vw] max-w-[340px] flex-col bg-white shadow-2xl transition-[transform,opacity] duration-200 ease-out ${
              open
                ? "translate-x-0 opacity-100"
                : "translate-x-4 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-5">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="font-bold tracking-tight text-zinc-950"
              >
                {siteName}
              </Link>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-xl border border-zinc-300 text-xl text-zinc-700"
              >
                ×
              </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1">
                {topItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    target={item.openInNewTab ? "_blank" : undefined}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {secondaryItems.length ? (
                <div className="mt-6 border-t border-zinc-200 pt-4">
                  <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                    More
                  </p>

                  <div className="space-y-1">
                    {secondaryItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        target={item.openInNewTab ? "_blank" : undefined}
                        onClick={() => setOpen(false)}
                        className="block rounded-xl px-4 py-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-950"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </nav>
          </aside>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 bg-white text-zinc-950 shadow-sm md:hidden"
      >
        <span className="relative block h-5 w-5">
          <span
            className={`absolute left-0 top-1 block h-0.5 w-5 bg-current transition duration-200 ${
              open ? "translate-y-1.5 rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-[9px] block h-0.5 w-5 bg-current transition duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-4 block h-0.5 w-5 bg-current transition duration-200 ${
              open ? "-translate-y-1.5 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {drawer}
    </>
  );
}
