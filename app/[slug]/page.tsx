import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Image from "next/image";

import { PublicShell } from "@/app/_components/public-shell";
import { prisma } from "@/lib/db/prisma";
import { getSiteBaseUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

const getPublishedPage = cache(async (slug: string) => {
  return prisma.page.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      OR: [
        { publishedAt: null },
        { publishedAt: { lte: new Date() } },
      ],
    },
    include: {
      featuredMedia: true,
    },
  });
});

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const [page, baseUrl] = await Promise.all([
    getPublishedPage(slug),
    getSiteBaseUrl(),
  ]);

  if (!page) return {};

  const title = page.seoTitle || page.title;
  const description =
    page.seoDescription ||
    page.excerpt ||
    undefined;

  const canonical =
    page.canonicalUrl ||
    (baseUrl ? `${baseUrl}/${page.slug}` : undefined);

  const image =
    page.featuredMedia?.type === "IMAGE"
      ? page.featuredMedia.url
      : undefined;

  return {
    title,
    description,
    alternates: canonical
      ? { canonical }
      : undefined,
    robots: page.noIndex
      ? {
          index: false,
          follow: true,
        }
      : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function PublicPage({
  params,
}: Props) {
  const { slug } = await params;
  const page = await getPublishedPage(slug);

  if (!page) {
    notFound();
  }

  const posts =
    page.pageType === "ARTICLES"
      ? await prisma.post.findMany({
          where: {
            status: "PUBLISHED",
            OR: [
              { publishedAt: null },
              { publishedAt: { lte: new Date() } },
            ],
          },
          orderBy: [
            { publishedAt: "desc" },
            { createdAt: "desc" },
          ],
          include: {
            category: true,
            featuredMedia: true,
          },
          take: 30,
        })
      : [];

  return (
    <PublicShell>
      <main className="min-h-[70vh]">
        <section className="border-b border-zinc-200 bg-zinc-50">
          <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              {page.pageType}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-6xl">
              {page.title}
            </h1>

            {page.excerpt ? (
              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600">
                {page.excerpt}
              </p>
            ) : null}
          </div>
        </section>

        {page.featuredMedia?.type === "IMAGE" ? (
          <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
            <div className="relative aspect-[16/8] overflow-hidden rounded-3xl">
              <Image
                src={page.featuredMedia.url}
                alt={page.featuredMedia.altText || page.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 960px"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        {page.pageType === "ARTICLES" ? (
          <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            {posts.length ? (
              <div
                className={
                  page.template === "ARTICLES_LIST"
                    ? "space-y-5"
                    : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                }
              >
                {posts.map((post) => (
                  <article
                    key={post.id.toString()}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                  >
                    {post.featuredMedia?.type === "IMAGE" ? (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Image
                          src={post.featuredMedia.url}
                          alt={post.featuredMedia.altText || post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    ) : null}

                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        {post.category?.name ?? "Article"}
                      </p>

                      <a
                        href={`/posts/${post.slug}`}
                        className="mt-2 block text-xl font-bold text-zinc-950 transition hover:text-zinc-600"
                      >
                        {post.title}
                      </a>

                      {post.excerpt ? (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-10 text-center text-sm text-zinc-500">
                No published articles yet.
              </div>
            )}
          </section>
        ) : (
          <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            {page.content ? (
              <div className="public-prose whitespace-pre-line text-base leading-8 text-zinc-700">
                {page.content}
              </div>
            ) : (
              <p className="text-zinc-500">
                This page does not have content yet.
              </p>
            )}
          </article>
        )}
      </main>
    </PublicShell>
  );
}
