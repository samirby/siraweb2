import type { Metadata } from "next";
import Link from "next/link";
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

const getCategory = cache(async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: {
          status: "PUBLISHED",
          OR: [
            { publishedAt: null },
            { publishedAt: { lte: new Date() } },
          ],
        },
        orderBy: {
          publishedAt: "desc",
        },
        include: {
          author: {
            select: {
              name: true,
            },
          },
          featuredMedia: true,
        },
      },
    },
  });
});

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  const [category, baseUrl] = await Promise.all([
    getCategory(slug),
    getSiteBaseUrl(),
  ]);

  if (!category) return {};

  const title = category.name;
  const description =
    category.description ||
    `Articles in ${category.name}`;

  const canonical = baseUrl
    ? `${baseUrl}/category/${category.slug}`
    : undefined;

  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
export default async function CategoryPublicPage({
  params,
}: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  return (
    <PublicShell>
      <main className="min-h-[70vh] bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <header className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Category
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-950">
              {category.name}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {category.posts.length} published article(s)
            </p>
          </header>

          {category.posts.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {category.posts.map((post) => (
                <article
                  key={post.id.toString()}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                >
                  {post.featuredMedia?.type === "IMAGE" ? (
                    <Link
                      href={`/posts/${post.slug}`}
                      className="relative block aspect-[16/9] overflow-hidden"
                    >
                      <Image
                        src={post.featuredMedia.url}
                        alt={post.featuredMedia.altText || post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </Link>
                  ) : null}

                  <div className="p-5">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-xl font-bold text-zinc-950 hover:underline"
                    >
                      {post.title}
                    </Link>

                    {post.excerpt ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">
                        {post.excerpt}
                      </p>
                    ) : null}

                    <div className="mt-4 text-xs text-zinc-400">
                      {post.author.name}
                      {post.publishedAt
                        ? ` · ${post.publishedAt.toLocaleDateString()}`
                        : ""}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500 shadow-sm">
              No published posts in this category yet.
            </div>
          )}
        </div>
      </main>
    </PublicShell>
  );
}
