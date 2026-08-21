import type { CSSProperties } from "react";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import Image from "next/image";

import { prisma } from "@/lib/db/prisma";
import { getSiteSettings } from "@/lib/settings/site-settings";
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


const getPublicMenus = unstable_cache(
  async () => {
    const menus = await prisma.menu.findMany({
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
    });

    return menus.map((menu) => ({
      ...menu,
      id: menu.id.toString(),
      items: menu.items.map((item) => ({
        ...item,
        id: item.id.toString(),
        menuId: item.menuId.toString(),
        parentId: item.parentId?.toString() ?? null,
        pageId: item.pageId?.toString() ?? null,
        categoryId: item.categoryId?.toString() ?? null,
      })),
    }));
  },
  ["sira-public-menus"],
  {
    revalidate: 60,
    tags: ["public-menus"],
  },
);

export async function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [siteSettings, menus] = await Promise.all([
    getSiteSettings(),

    getPublicMenus(),
  ]);

  const siteName = siteSettings.siteName;

  const themeStyle = {
    "--sira-primary": siteSettings.designPrimaryColor,
    "--sira-secondary": siteSettings.designSecondaryColor,
    "--sira-background": siteSettings.designBackgroundColor,
    "--sira-text": siteSettings.designTextColor,
    "--sira-heading-font": siteSettings.designHeadingFont,
    "--sira-body-font": siteSettings.designBodyFont,
    "--sira-radius": siteSettings.designBorderRadius,
    "--sira-container": siteSettings.designContainerWidth,
  } as CSSProperties;

  const topMenu = menus.find((menu) => menu.location === "TOP");
  const secondaryMenu = menus.find(
    (menu) => menu.location === "SECONDARY",
  );
  const footerMenu = menus.find(
    (menu) => menu.location === "FOOTER",
  );

  const topItems =
    topMenu?.items.map((item) => ({
      id: String(item.id),
      label: item.label,
      href: itemHref(item),
      openInNewTab: item.openInNewTab,
    })) ?? [];

  const secondaryItems =
    secondaryMenu?.items.map((item) => ({
      id: String(item.id),
      label: item.label,
      href: itemHref(item),
      openInNewTab: item.openInNewTab,
    })) ?? [];

  return (
    <div
      style={themeStyle}
      className="sira-public min-h-screen selection:bg-zinc-950 selection:text-white"
    >
      {secondaryMenu?.items.length ? (
        <div className="hidden border-b border-zinc-800 bg-zinc-950 text-zinc-300 md:block">
          <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-end gap-4 px-4 text-xs sm:px-6 lg:px-8">
            {secondaryMenu.items.map((item) => (
              <Link
                key={String(item.id)}
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

      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex min-w-0 items-center"
            aria-label={siteName}
          >
            {siteSettings.logoMediaId ? (
              <Image
                src={`/media/${siteSettings.logoMediaId}`}
                alt={siteName}
                width={220}
                height={40}
                sizes="220px"
                className="h-10 w-auto max-w-[220px] object-contain"
              />
            ) : (
              <span className="text-lg font-bold tracking-tight">
                {siteName}
              </span>
            )}
          </Link>

          <div className="hidden items-center gap-5 md:flex">
            <nav className="flex items-center gap-5">
              {topMenu?.items.map((item) => (
                <Link
                  key={String(item.id)}
                  href={itemHref(item)}
                  target={item.openInNewTab ? "_blank" : undefined}
                  className="text-sm font-semibold text-zinc-600 transition hover:text-zinc-950"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/contact"
              className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
            >
              Contact
            </Link>
          </div>

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
                  key={String(item.id)}
                  href={itemHref(item)}
                  target={item.openInNewTab ? "_blank" : undefined}
                  className="text-sm transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}

          <div className="flex flex-col gap-4 border-t border-zinc-800 pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm">
                © {new Date().getFullYear()} {siteName}. {siteSettings.footerText}
              </div>

              {siteSettings.contactEmail || siteSettings.contactPhone ? (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                  {siteSettings.contactEmail ? (
                    <a href={`mailto:${siteSettings.contactEmail}`} className="hover:text-white">
                      {siteSettings.contactEmail}
                    </a>
                  ) : null}
                  {siteSettings.contactPhone ? (
                    <a href={`tel:${siteSettings.contactPhone}`} className="hover:text-white">
                      {siteSettings.contactPhone}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3 text-xs">
              {[
                ["Facebook", siteSettings.facebookUrl],
                ["Instagram", siteSettings.instagramUrl],
                ["LinkedIn", siteSettings.linkedinUrl],
                ["X", siteSettings.xUrl],
              ]
                .filter(([, href]) => href)
                .map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    {label}
                  </a>
                ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
