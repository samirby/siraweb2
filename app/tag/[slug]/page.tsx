import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PublicShell } from "@/app/_components/public-shell";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getTag(slug: string) {
  return prisma.tag.findUnique({
    where: { slug },
    include: {
      posts: {
        include: {
          post: {
            include: {
              author: { select: { name: true } },
              featuredMedia: true,
            },
          },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);

  if (!tag) return {};

  return {
    title: tag.name,
    description: `Articles tagged ${tag.name}`,
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
        (b.publishedAt?.getTime() ?? 0) -
        (a.publishedAt?.getTime() ?? 0),
    );

  return (
    <PublicShell>
      <main className="min-h-[70vh] bg-zinc-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <header className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Tag
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-950">
              {tag.name}
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {posts.length} published article(s)
            </p>
          </header>

          {posts.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id.toString()}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                >
                  {post.featuredMedia?.type === "IMAGE" ? (
                    <Link href={`/posts/${post.slug}`}>
                      <img
                        src={post.featuredMedia.url}
                        alt={post.featuredMedia.altText || post.title}
                        className="aspect-[16/9] w-full object-cover"
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
              No published posts with this tag yet.
            </div>
          )}
        </div>
      </main>
    </PublicShell>
  );
}
