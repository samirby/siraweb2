import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

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
          <header className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              {post.category?.name ?? "Article"}
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-6xl">
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
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <img
                src={post.featuredMedia.url}
                alt={post.featuredMedia.altText || post.title}
                className="aspect-[16/9] w-full rounded-3xl object-cover"
              />
            </div>
          ) : null}

          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            {post.content ? (
              <div
                className="rich-post-content text-base leading-8 text-zinc-700"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichHtml(post.content),
                }}
              />
            ) : null}

            {post.secondaryMedia?.type === "IMAGE" ? (
              <img
                src={post.secondaryMedia.url}
                alt={
                  post.secondaryMedia.altText ||
                  `${post.title} secondary image`
                }
                className="mt-10 w-full rounded-3xl object-cover"
              />
            ) : null}

            {post.gallery.length ? (
              <section className="mt-14 border-t border-zinc-200 pt-10">
                <h2 className="text-2xl font-bold text-zinc-950">
                  Gallery
                </h2>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {post.gallery.map((item) => (
                    <img
                      key={item.id.toString()}
                      src={item.media.url}
                      alt={item.media.altText || post.title}
                      className="aspect-square w-full rounded-2xl object-cover"
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </article>
      </main>
    </PublicShell>
  );
}
