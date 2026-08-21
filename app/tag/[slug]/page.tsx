import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { PublicPostCard } from "@/app/_components/public/public-post-card";
import { PublicShell } from "@/app/_components/public-shell";
import { prisma } from "@/lib/db/prisma";
import { getSiteBaseUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const getTag = cache(async (slug: string) => {
  return prisma.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        include: {
          post: {
            include: {
              author: { select: { name: true } },
              category: true,
              featuredMedia: true,
            },
          },
        },
      },
    },
  });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [tag, baseUrl] = await Promise.all([
    getTag(slug),
    getSiteBaseUrl(),
  ]);

  if (!tag) return {};

  return {
    title: tag.name,
    description: `Articles tagged ${tag.name}`,
    alternates: baseUrl
      ? { canonical: `${baseUrl}/tag/${tag.slug}` }
      : undefined,
  };
}

export default async function PublicTagPage({ params }: Props) {
  const { slug } = await params;
  const tag = await getTag(slug);

  if (!tag) notFound();

  const now = new Date();
  const posts = tag.posts
    .map((item) => item.post)
    .filter(
      (post) =>
        post.status === "PUBLISHED" &&
        (!post.publishedAt || post.publishedAt <= now),
    )
    .sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? b.createdAt.getTime()) -
        (a.publishedAt?.getTime() ?? a.createdAt.getTime()),
    );

  return (
    <PublicShell>
      <main className="min-h-[70vh] bg-zinc-50">
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="public-eyebrow">Tag</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-6xl">
              #{tag.name}
            </h1>
            <p className="mt-4 text-sm font-medium text-zinc-500">
              {posts.length} published article{posts.length === 1 ? "" : "s"}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {posts.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <PublicPostCard key={post.id.toString()} post={post} />
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-zinc-300 bg-white p-12 text-center text-sm text-zinc-500">
              No published posts with this tag yet.
            </div>
          )}
        </section>
      </main>
    </PublicShell>
  );
}
