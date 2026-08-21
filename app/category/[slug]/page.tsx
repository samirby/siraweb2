import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { PublicPostCard } from "@/app/_components/public/public-post-card";
import { PublicShell } from "@/app/_components/public-shell";
import { prisma } from "@/lib/db/prisma";
import { getSiteBaseUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const getCategory = cache(async (slug: string) => {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      posts: {
        where: {
          status: "PUBLISHED",
          OR: [{ publishedAt: null }, { publishedAt: { lte: new Date() } }],
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        include: {
          author: { select: { name: true } },
          category: true,
          featuredMedia: true,
        },
      },
    },
  });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [category, baseUrl] = await Promise.all([
    getCategory(slug),
    getSiteBaseUrl(),
  ]);

  if (!category) return {};

  const description =
    category.description || `Articles in ${category.name}`;

  return {
    title: category.name,
    description,
    alternates: baseUrl
      ? { canonical: `${baseUrl}/category/${category.slug}` }
      : undefined,
  };
}

export default async function CategoryPublicPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  return (
    <PublicShell>
      <main className="min-h-[70vh] bg-zinc-50">
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="public-eyebrow">Category</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-6xl">
              {category.name}
            </h1>
            {category.description ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
                {category.description}
              </p>
            ) : null}
            <p className="mt-4 text-sm font-medium text-zinc-500">
              {category.posts.length} published article{category.posts.length === 1 ? "" : "s"}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {category.posts.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {category.posts.map((post) => (
                <PublicPostCard key={post.id.toString()} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-zinc-300 bg-white p-12 text-center text-sm text-zinc-500">
              No published posts in this category yet.
            </div>
          )}
        </section>
      </main>
    </PublicShell>
  );
}
