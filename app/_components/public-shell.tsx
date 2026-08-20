import Link from "next/link";

import { prisma } from "@/lib/db/prisma";
import { PublicMobileNav } from "./public-mobile-nav";

function itemHref(item: {
  type: "PAGE" | "CATEGORY" | "CUSTOM_LINK";
  url: string | null;
  page: { slug: string; status: string } | null;
  category: { slug: string } | null;
}) {
  if (item.type === "PAGE" && item.page?.status === "PUBLISHED") {
    return `/${item.page.slug}`;
  }

  if (item.type === "CATEGORY" && item.category) {
    return `/category/${item.category.slug}`;
  }

  return item.url || "#";
}

export async function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [siteNameSetting, menus] = await Promise.all([
    prisma.setting.findUnique({
      where: { key: "site.name" },
    }),

    prisma.menu.findMany({
      where: {
        location: {
          in: ["TOP", "FOOTER", "SECONDARY"],
        },
      },

      include: {
        items: {
          where: {
            isEnabled: true,
          },

          orderBy: [
            { sortOrder: "asc" },
            { id: "asc" },
          ],

          include: {
            page: {
              select: {
                slug: true,
                status: true,
              },
            },

            category: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const siteName =
    typeof siteNameSetting?.value === "string"
      ? siteNameSetting.value
      : "SIRA Web";

  const topMenu = menus.find((menu) => menu.location === "TOP");
  const secondaryMenu = menus.find(
    (menu) => menu.location === "SECONDARY",
  );
  const footerMenu = menus.find(
    (menu) => menu.location === "FOOTER",
  );

  const topItems =
    topMenu?.items.map((item) => ({
      id: item.id.toString(),
      label: item.label,
      href: itemHref(item),
      openInNewTab: item.openInNewTab,
    })) ?? [];

  const secondaryItems =
    secondaryMenu?.items.map((item) => ({
      id: item.id.toString(),
      label: item.label,
      href: itemHref(item),
      openInNewTab: item.openInNewTab,
    })) ?? [];

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      {secondaryMenu?.items.length ? (
        <div className="hidden border-b border-zinc-800 bg-zinc-950 text-zinc-300 md:block">
          <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-end gap-4 px-4 text-xs sm:px-6 lg:px-8">
            {secondaryMenu.items.map((item) => (
              <Link
                key={item.id.toString()}
                href={itemHref(item)}
                target={item.openInNewTab ? "_blank" : undefined}
                className="transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-lg font-bold tracking-tight"
          >
            {siteName}
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            {topMenu?.items.map((item) => (
              <Link
                key={item.id.toString()}
                href={itemHref(item)}
                target={item.openInNewTab ? "_blank" : undefined}
                className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <PublicMobileNav
            siteName={siteName}
            topItems={topItems}
            secondaryItems={secondaryItems}
          />
        </div>
      </header>

      {children}

      <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {footerMenu?.items.length ? (
            <nav className="mb-6 flex flex-wrap gap-x-5 gap-y-2">
              {footerMenu.items.map((item) => (
                <Link
                  key={item.id.toString()}
                  href={itemHref(item)}
                  target={item.openInNewTab ? "_blank" : undefined}
                  className="text-sm transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}

          <div className="text-sm">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
