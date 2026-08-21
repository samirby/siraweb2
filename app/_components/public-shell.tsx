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
      data-card-style={siteSettings.layoutCardStyle}
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

      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/88 shadow-[0_8px_30px_rgba(0,0,0,0.035)] backdrop-blur-xl">
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
              className="sira-red-button px-4 py-2.5"
            >
              Bëhu Anëtar
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

      <footer
        data-footer-style={siteSettings.footerStyle}
        className="sira-footer text-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4 xl:gap-12">
            {siteSettings.footerShowBrand !== "false" ? (
              <section>
                <Link
                  href="/"
                  className="inline-flex items-center text-2xl font-black tracking-[0.28em] text-white"
                >
                  {siteName}
                </Link>

                <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
                  {siteSettings.footerBrandText ||
                    siteSettings.siteDescription ||
                    "Modern digital experiences, useful content and reliable services."}
                </p>

                {siteSettings.footerShowSocials !== "false" ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {[
                      ["Instagram", siteSettings.instagramUrl],
                      ["X", siteSettings.xUrl],
                      ["Facebook", siteSettings.facebookUrl],
                      ["LinkedIn", siteSettings.linkedinUrl],
                    ]
                      .filter(([, href]) => href)
                      .map(([label, href]) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grid h-10 min-w-10 place-items-center rounded-full border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white/85 transition hover:bg-white hover:text-zinc-950"
                        >
                          {label}
                        </a>
                      ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {siteSettings.footerShowQuickLinks !== "false" ? (
              <section>
                <h2 className="text-lg font-bold text-white">Quick Links</h2>
                <nav className="mt-5 grid gap-3">
                  {(footerMenu?.items.length
                    ? footerMenu.items
                    : topMenu?.items ?? []
                  ).map((item) => (
                    <Link
                      key={String(item.id)}
                      href={itemHref(item)}
                      target={item.openInNewTab ? "_blank" : undefined}
                      className="group flex items-center justify-between gap-3 text-sm text-white/75 transition hover:text-white"
                    >
                      <span>{item.label}</span>
                      <span className="text-white/35 transition group-hover:translate-x-1 group-hover:text-white">
                        →
                      </span>
                    </Link>
                  ))}
                </nav>
              </section>
            ) : null}

            <section className="space-y-8">
              {siteSettings.footerShowSocials !== "false" ? (
                <div>
                  <h2 className="text-lg font-bold text-white">Follow Us</h2>
                  <div className="mt-4 flex flex-wrap gap-x-2 gap-y-2 text-sm text-white/70">
                    {[
                      ["Instagram", siteSettings.instagramUrl],
                      ["X", siteSettings.xUrl],
                      ["Facebook", siteSettings.facebookUrl],
                      ["LinkedIn", siteSettings.linkedinUrl],
                    ]
                      .filter(([, href]) => href)
                      .map(([label, href], index, items) => (
                        <span key={label} className="inline-flex items-center gap-2">
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition hover:text-white"
                          >
                            {label}
                          </a>
                          {index < items.length - 1 ? (
                            <span className="text-white/30">•</span>
                          ) : null}
                        </span>
                      ))}
                  </div>
                </div>
              ) : null}

              {siteSettings.footerShowOffice !== "false" ? (
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {siteSettings.footerOfficeTitle || "Office"}
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/70">
                    {siteSettings.footerOfficeAddress ||
                      "Add office details from Admin → Design → Footer."}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="flex flex-col justify-between gap-8">
              {siteSettings.footerShowEmail !== "false" ? (
                <div>
                  <h2 className="text-lg font-bold text-white">Email</h2>
                  {siteSettings.contactEmail ? (
                    <a
                      href={`mailto:${siteSettings.contactEmail}`}
                      className="mt-3 block break-all text-sm text-white/75 transition hover:text-white"
                    >
                      {siteSettings.contactEmail}
                    </a>
                  ) : (
                    <p className="mt-3 text-sm text-white/55">
                      Add contact email in Settings.
                    </p>
                  )}
                </div>
              ) : null}

              {siteSettings.contactPhone ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                    Phone
                  </p>
                  <a
                    href={`tel:${siteSettings.contactPhone}`}
                    className="mt-2 block text-sm text-white/75 transition hover:text-white"
                  >
                    {siteSettings.contactPhone}
                  </a>
                </div>
              ) : null}
            </section>
          </div>
        </div>

        {siteSettings.footerShowCopyright !== "false" ? (
          <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-white/55 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
              <p>
                {siteSettings.footerCopyrightText ||
                  `© ${new Date().getFullYear()} ${siteName}. All Rights Reserved.`}
              </p>

              {siteSettings.footerCreditText ? (
                siteSettings.footerCreditUrl ? (
                  <a
                    href={siteSettings.footerCreditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-white"
                  >
                    {siteSettings.footerCreditText}
                  </a>
                ) : (
                  <p>{siteSettings.footerCreditText}</p>
                )
              ) : null}
            </div>
          </div>
        ) : null}
      </footer>
    </div>
  );
}
