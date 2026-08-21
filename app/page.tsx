import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PublicPostCard } from "@/app/_components/public/public-post-card";
import { PublicShell } from "@/app/_components/public-shell";
import { prisma } from "@/lib/db/prisma";
import { getSiteSettings } from "@/lib/settings/site-settings";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: settings.seoDefaultTitle || settings.siteName,
    description:
      settings.seoDefaultDescription ||
      settings.siteDescription ||
      undefined,
  };
}

export default async function Home() {
  const now = new Date();

  const [settings, posts, services, categories] = await Promise.all([
    getSiteSettings(),
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
      include: {
        author: { select: { name: true } },
        category: true,
        featuredMedia: true,
      },
    }),
    prisma.page.findMany({
      where: {
        status: "PUBLISHED",
        pageType: "SERVICE",
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { featuredMedia: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      take: 8,
      include: {
        _count: { select: { posts: true } },
      },
    }),
  ]);

  const leadPost = posts[0] ?? null;
  const latestPosts = posts.slice(0, 3);

  return (
    <PublicShell>
      <main>
        <section className="relative overflow-hidden bg-zinc-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_34%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:py-28">
            <div>
              <p className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                {settings.siteName}
              </p>

              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
                {settings.siteDescription ||
                  "Modern solutions, useful content and a better digital experience."}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8">
                Explore our services, latest articles and practical resources.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/contact" className="public-button-light">
                  Contact us
                </Link>
                <Link href="/posts" className="public-button-dark-outline">
                  Explore articles
                </Link>
              </div>
            </div>

            <div className="relative">
              {leadPost?.featuredMedia?.type === "IMAGE" ? (
                <Link
                  href={`/posts/${leadPost.slug}`}
                  className="relative block aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl"
                >
                  <Image
                    src={leadPost.featuredMedia.url}
                    alt={leadPost.featuredMedia.altText || leadPost.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 pt-20">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">
                      Latest story
                    </p>
                    <h2 className="mt-2 text-2xl font-bold leading-tight">
                      {leadPost.title}
                    </h2>
                  </div>
                </Link>
              ) : (
                <div className="grid aspect-[4/3] place-items-center rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center">
                  <div>
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white text-2xl font-black text-zinc-950">
                      S
                    </div>
                    <p className="mt-5 text-sm leading-6 text-zinc-400">
                      Publish a featured article to automatically populate this visual.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
            {[
              ["Professional", "Clear structure, quality content and polished presentation."],
              ["Responsive", "Designed to work naturally across desktop, tablet and mobile."],
              ["Built to grow", "Pages, posts, media and menus are managed from the CMS."],
            ].map(([title, description], index) => (
              <div key={title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-zinc-950 text-sm font-bold text-white">
                  0{index + 1}
                </span>
                <div>
                  <h2 className="font-bold text-zinc-950">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {services.length ? (
          <section className="bg-zinc-50">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
              <div className="public-section-heading">
                <div>
                  <p className="public-eyebrow">Services</p>
                  <h2 className="public-section-title">What we can help you with</h2>
                </div>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <Link
                    key={service.id.toString()}
                    href={`/${service.slug}`}
                    className="group overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    {service.featuredMedia?.type === "IMAGE" ? (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={service.featuredMedia.url}
                          alt={service.featuredMedia.altText || service.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : null}

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-zinc-950">{service.title}</h3>
                      {service.excerpt ? (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
                          {service.excerpt}
                        </p>
                      ) : null}
                      <span className="mt-5 inline-block text-sm font-semibold text-zinc-950">
                        Learn more →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {categories.length ? (
          <section className="border-y border-zinc-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <p className="public-eyebrow">Explore</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <Link
                    key={category.id.toString()}
                    href={`/category/${category.slug}`}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
                  >
                    {category.name}
                    <span className="ml-2 text-xs opacity-60">
                      {category._count.posts}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="public-section-heading">
              <div>
                <p className="public-eyebrow">Latest</p>
                <h2 className="public-section-title">Latest articles</h2>
              </div>
              <Link href="/posts" className="public-button-secondary">
                View all posts
              </Link>
            </div>

            {latestPosts.length ? (
              <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latestPosts.map((post) => (
                  <PublicPostCard key={post.id.toString()} post={post} />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center text-sm text-zinc-500">
                Published posts will appear here automatically.
              </div>
            )}
          </div>
        </section>

        <section className="bg-zinc-950 text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                Get in touch
              </p>
              <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Have a question or a project in mind?
              </h2>
            </div>
            <Link href="/contact" className="public-button-light shrink-0">
              Contact us
            </Link>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
