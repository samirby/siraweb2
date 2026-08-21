import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import Image from "next/image";

import { PublicShell } from "@/app/_components/public-shell";
import { JsonLd } from "@/app/_components/seo/json-ld";
import { prisma } from "@/lib/db/prisma";
import { getSiteBaseUrl } from "@/lib/seo/site-url";
import { getSiteSettings } from "@/lib/settings/site-settings";
import { sanitizeRichHtml } from "@/lib/security/sanitize-rich-html";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

const getPublishedPost = cache(async (slug: string) => {
  return prisma.post.findFirst({
    where: {
      slug,
      status: "PUBLISHED",
      OR: [
        { publishedAt: null },
        { publishedAt: { lte: new Date() } },
      ],
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
      category: true,
      featuredMedia: true,
      secondaryMedia: true,
      gallery: {
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          media: true,
        },
      },
    },
  });
});

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const [post, baseUrl] = await Promise.all([
    getPublishedPost(slug),
    getSiteBaseUrl(),
  ]);

  if (!post) return {};

  const title = post.seoTitle || post.title;
  const description =
    post.seoDescription ||
    post.excerpt ||
    undefined;

  const canonical =
    post.canonicalUrl ||
    (baseUrl ? `${baseUrl}/posts/${post.slug}` : undefined);

  const image =
    post.featuredMedia?.type === "IMAGE"
      ? post.featuredMedia.url
      : undefined;

  return {
    title,
    description,
    alternates: canonical
      ? { canonical }
      : undefined,
    robots: post.noIndex
      ? {
          index: false,
          follow: true,
        }
      : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
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

export default async function PublicPost({
  params,
}: Props) {
  const { slug } = await params;

  const [post, settings, baseUrl] = await Promise.all([
    getPublishedPost(slug),
    getSiteSettings(),
    getSiteBaseUrl(),
  ]);

  if (!post) {
    notFound();
  }

  const [relatedPosts, adjacentPosts] = await Promise.all([
    prisma.post.findMany({
      where: {
        id: { not: post.id },
        status: "PUBLISHED",
        categoryId: post.categoryId,
        OR: [
          { publishedAt: null },
          { publishedAt: { lte: new Date() } },
        ],
      },
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      take: 3,
      include: {
        author: { select: { name: true } },
        category: true,
        featuredMedia: true,
      },
    }),
    prisma.post.findMany({
      where: {
        id: { not: post.id },
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
      take: 2,
      select: {
        slug: true,
        title: true,
      },
    }),
  ]);

  const canonical =
    post.canonicalUrl ||
    (baseUrl ? `${baseUrl}/posts/${post.slug}` : undefined);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description:
      post.seoDescription ||
      post.excerpt ||
      undefined,
    datePublished:
      post.publishedAt?.toISOString() ||
      post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: canonical
      ? {
          "@type": "WebPage",
          "@id": canonical,
        }
      : undefined,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: settings.siteName,
      url: settings.siteUrl || baseUrl || undefined,
      logo: settings.logoMediaId
        ? {
            "@type": "ImageObject",
            url: baseUrl
              ? `${baseUrl}/media/${settings.logoMediaId}`
              : `/media/${settings.logoMediaId}`,
          }
        : undefined,
    },
    image:
      post.featuredMedia?.type === "IMAGE"
        ? [post.featuredMedia.url]
        : undefined,
  };

  return (
    <PublicShell>
      <JsonLd data={articleSchema} />
      <main className="min-h-[70vh] bg-white">
        <article>
          <header className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            {post.category ? (
              <Link
                href={`/category/${post.category.slug}`}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 transition hover:text-zinc-950"
              >
                {post.category.name}
              </Link>
            ) : (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Article
              </p>
            )}

            <h1 className="mt-3 text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-zinc-950 sm:text-6xl">
              {post.title}
            </h1>

            <div className="mt-5 flex flex-wrap gap-2 text-sm text-zinc-500">
              <span>{post.author.name}</span>

              {post.publishedAt ? (
                <>
                  <span>·</span>
                  <span>
                    {post.publishedAt.toLocaleDateString()}
                  </span>
                </>
              ) : null}
            </div>

            {post.excerpt ? (
              <p className="mt-6 text-lg leading-8 text-zinc-600">
                {post.excerpt}
              </p>
            ) : null}
          </header>

          {post.featuredMedia?.type === "IMAGE" ? (
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[1.75rem] shadow-xl">
                <Image
                  src={post.featuredMedia.url}
                  alt={post.featuredMedia.altText || post.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 896px"
                  className="object-cover"
                />
              </div>
            </div>
          ) : null}

          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            {post.content ? (
              <div
                className="rich-post-content public-prose text-base leading-8 text-zinc-700"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichHtml(post.content),
                }}
              />
            ) : null}

            {post.secondaryMedia?.type === "IMAGE" ? (
              post.secondaryMedia.width && post.secondaryMedia.height ? (
                <Image
                  src={post.secondaryMedia.url}
                  alt={
                    post.secondaryMedia.altText ||
                    `${post.title} secondary image`
                  }
                  width={post.secondaryMedia.width}
                  height={post.secondaryMedia.height}
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="mt-10 h-auto w-full rounded-3xl object-cover"
                />
              ) : (
                <img
                  src={post.secondaryMedia.url}
                  alt={
                    post.secondaryMedia.altText ||
                    `${post.title} secondary image`
                  }
                  loading="lazy"
                  decoding="async"
                  className="mt-10 w-full rounded-3xl object-cover"
                />
              )
            ) : null}

            {canonical ? (
              <section className="mt-12 border-t border-zinc-200 pt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                  Share article
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="public-button-secondary"
                  >
                    Facebook
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="public-button-secondary"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={`https://x.com/intent/post?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="public-button-secondary"
                  >
                    X
                  </a>
                </div>
              </section>
            ) : null}

            {post.gallery.length ? (
              <section className="mt-14 border-t border-zinc-200 pt-10">
                <h2 className="text-2xl font-bold text-zinc-950">
                  Gallery
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {post.gallery.map((item) => (
                    <div
                      key={item.id.toString()}
                      className="relative aspect-square overflow-hidden rounded-2xl"
                    >
                      <Image
                        src={item.media.url}
                        alt={item.media.altText || post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            {relatedPosts.length ? (
              <section className="border-t border-zinc-200 pt-12">
                <div className="public-section-heading">
                  <div>
                    <p className="public-eyebrow">Keep reading</p>
                    <h2 className="public-section-title">
                      Related articles
                    </h2>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.map((item) => (
                    <article
                      key={item.id.toString()}
                      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        {item.category?.name ?? "Article"}
                      </p>
                      <Link
                        href={`/posts/${item.slug}`}
                        className="mt-2 block text-lg font-bold text-zinc-950 hover:underline"
                      >
                        {item.title}
                      </Link>
                      {item.excerpt ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                          {item.excerpt}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {adjacentPosts.length ? (
              <nav className="mt-10 grid gap-3 sm:grid-cols-2">
                {adjacentPosts.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/posts/${item.slug}`}
                    className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 transition hover:border-zinc-300 hover:bg-white"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Another article
                    </span>
                    <span className="mt-1 block font-bold text-zinc-950">
                      {item.title}
                    </span>
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </article>
      </main>
    </PublicShell>
  );
}
