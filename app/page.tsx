import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { HomepagePostsSection } from "@/app/_components/public/homepage-posts-section";
import { PublicShell } from "@/app/_components/public-shell";
import { prisma } from "@/lib/db/prisma";
import { getSiteSettings } from "@/lib/settings/site-settings";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title:
      settings.seoDefaultTitle ||
      settings.siteName ||
      "Shoqata e Mjekëve Shqiptarë Austri",
    description:
      settings.seoDefaultDescription ||
      settings.siteDescription ||
      "Shoqata e Mjekëve Shqiptarë Austri.",
  };
}

export default async function Home() {
  const now = new Date();

  const [settings, visualPosts] = await Promise.all([
    getSiteSettings(),
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
        featuredMediaId: { not: null },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        featuredMedia: true,
      },
    }),
  ]);

  const heroMedia =
    visualPosts.find((post) => post.featuredMedia?.type === "IMAGE")
      ?.featuredMedia ?? null;

  const welcomeMedia =
    visualPosts.find(
      (post) =>
        post.featuredMedia?.type === "IMAGE" &&
        post.featuredMedia.id !== heroMedia?.id,
    )?.featuredMedia ?? heroMedia;

  return (
    <PublicShell>
      <main className="bg-[#fbfaf7]">
        <section className="sira-doctors-hero">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8 lg:py-20">
            <div className="order-2 lg:order-1">
              <p className="sira-doctors-eyebrow">
                Shoqata e Mjekëve Shqiptarë Austri
              </p>

              <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.03] tracking-[-0.04em] text-zinc-950 sm:text-6xl lg:text-7xl">
                Bashkë për shëndetin, dijen dhe komunitetin
              </h1>

              <div className="mt-6 h-[2px] w-16 bg-red-600" />

              <p className="mt-6 max-w-xl text-base leading-8 text-zinc-600 sm:text-lg">
                Ne bashkojmë mjekët shqiptarë në Austri për të promovuar
                shkencën mjekësore, zhvillimin profesional, bashkëpunimin dhe
                kontributin në shëndetin e shoqërisë.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="sira-red-button">
                  Mëso më shumë <span aria-hidden="true">→</span>
                </Link>

                <Link href="/posts" className="sira-outline-button">
                  Shiko artikujt
                </Link>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  ["Komunitet i Bashkuar", "Mjekë shqiptarë në Austri"],
                  ["Zhvillim Profesional", "Trajnime & konferenca"],
                  ["Kontribut në Shoqëri", "Shëndet, edukim, humanizëm"],
                ].map(([title, description]) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-red-200 bg-red-50 text-red-600">
                      +
                    </span>
                    <div>
                      <p className="text-xs font-bold text-zinc-950">{title}</p>
                      <p className="mt-1 text-[11px] leading-5 text-zinc-500">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#eee9e2] shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
                {heroMedia?.type === "IMAGE" ? (
                  <Image
                    src={heroMedia.url}
                    alt={
                      heroMedia.altText ||
                      "Shoqata e Mjekëve Shqiptarë Austri"
                    }
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 52vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center p-8 text-center">
                    <div>
                      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white text-3xl font-black text-red-600 shadow-sm">
                        +
                      </div>
                      <p className="mt-5 text-sm leading-6 text-zinc-500">
                        Shto një imazh featured në një postim për ta përdorur si
                        vizual të Hero Section.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-black/5 bg-[#f5f0e8]">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8 lg:py-24">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
              {welcomeMedia?.type === "IMAGE" ? (
                <Image
                  src={welcomeMedia.url}
                  alt={welcomeMedia.altText || "Mirë se vini"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(220,38,38,0.12),transparent_26%),linear-gradient(135deg,#fff,#efe8de)]" />
              )}
            </div>

            <div className="lg:pl-6">
              <p className="sira-doctors-eyebrow">Mirë se vini</p>

              <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight tracking-[-0.035em] text-zinc-950 sm:text-5xl">
                Mirë se vini në Shoqatën e Mjekëve Shqiptarë Austri
              </h2>

              <div className="mt-6 h-[2px] w-16 bg-red-600" />

              <div className="mt-7 max-w-2xl space-y-5 text-base leading-8 text-zinc-600">
                <p>
                  Shoqata jonë është një organizatë jofitimprurëse që synon të
                  forcojë lidhjet mes mjekëve shqiptarë në Austri, të nxisë
                  bashkëpunimin profesional dhe të kontribuojë në avancimin e
                  kujdesit shëndetësor.
                </p>

                <p>
                  Përmes aktiviteteve shkencore, edukative dhe humanitare,
                  synojmë të jemi një zë i fuqishëm dhe një pikë referimi për
                  komunitetin dhe shoqërinë.
                </p>
              </div>

              <Link href="/contact" className="sira-outline-button mt-8">
                Më shumë rreth nesh <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        <HomepagePostsSection />

        <section className="bg-[#fbfaf7]">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
            <div className="sira-membership-cta">
              <div className="flex items-start gap-5">
                <div className="hidden h-16 w-16 shrink-0 place-items-center rounded-full border border-red-200 bg-red-50 text-2xl font-black text-red-600 sm:grid">
                  +
                </div>

                <div>
                  <p className="sira-doctors-eyebrow">Anëtarësia</p>
                  <h2 className="mt-2 max-w-2xl text-3xl font-black tracking-[-0.035em] text-zinc-950 sm:text-4xl">
                    Bëhu pjesë e komunitetit tonë
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-600 sm:text-base">
                    Bashkohu me ne dhe përfito nga aktivitetet, trajnimet,
                    konferencat dhe mundësitë ekskluzive për anëtarët.
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <Link href="/contact" className="sira-red-button">
                  Bëhu anëtar tani <span aria-hidden="true">→</span>
                </Link>
                <p className="mt-3 text-xs text-zinc-500">
                  Anëtarësimi është i hapur për profesionistët e interesuar.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
