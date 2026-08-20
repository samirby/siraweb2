import Link from "next/link";
import { prisma } from "@/lib/db/prisma";

export async function PublicShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [siteNameSetting, menu] = await Promise.all([
    prisma.setting.findUnique({
      where: { key: "site.name" },
    }),
    prisma.menu.findFirst({
      where: { location: "TOP" },
      include: {
        items: {
          where: { isEnabled: true },
          orderBy: { sortOrder: "asc" },
          include: {
            page: {
              select: {
                slug: true,
                status: true,
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

  return (
    <div className="min-h-screen bg-white text-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-lg font-bold tracking-tight">
            {siteName}
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            {menu?.items.map((item) => {
              const href =
                item.type === "PAGE" && item.page?.status === "PUBLISHED"
                  ? `/${item.page.slug}`
                  : item.url || "#";

              return (
                <Link
                  key={item.id.toString()}
                  href={href}
                  target={item.openInNewTab ? "_blank" : undefined}
                  className="text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {children}

      <footer className="border-t border-zinc-200 bg-zinc-950 text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm sm:px-6 lg:px-8">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
