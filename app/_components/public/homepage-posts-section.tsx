import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/db/prisma";
import { getSiteSettings } from "@/lib/settings/site-settings";

function clampCount(value: string) {
  const parsed = Number.parseInt(value || "4", 10);
  if (!Number.isFinite(parsed)) return 4;
  return Math.min(12, Math.max(1, parsed));
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\\s+/g, " ")
    .trim();
}

function firstSentences(value: string, count: number) {
  const clean = stripHtml(value);
  if (!clean) return "";

  const sentences =
    clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()) ?? [];

  return sentences.slice(0, count).join(" ");
}

export async function HomepagePostsSection() {
  const settings = await getSiteSettings();

  if (
    settings.layoutShowLatestPosts === "false" ||
    settings.homePostsEnabled === "false"
  ) {
    return null;
  }

  const now = new Date();
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { publishedAt: null },
        { publishedAt: { lte: now } },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50,
    include: {
      author: { select: { name: true } },
      category: true,
      featuredMedia: true,
    },
  });

  const visiblePosts = posts
    .sort((a, b) => {
      const aDate = (a.publishedAt ?? a.createdAt).getTime();
      const bDate = (b.publishedAt ?? b.createdAt).getTime();
      return bDate - aDate;
    })
    .slice(0, clampCount(settings.homePostsCount));

  const gridClass =
    settings.homePostsLayout === "grid2"
      ? "md:grid-cols-2"
      : settings.homePostsLayout === "list"
        ? "grid-cols-1"
        : "md:grid-cols-2 xl:grid-cols-4";

  return (
    <section className="sira-home-posts">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="sira-home-posts-eyebrow">
              {settings.homePostsEyebrow || "Latest Articles"}
            </p>

            <h2 className="sira-home-posts-title">
              {settings.homePostsTitle ||
                "Fresh software news and trends"}
            </h2>

            {settings.homePostsSubtitle ? (
              <p className="sira-home-posts-subtitle">
                {settings.homePostsSubtitle}
              </p>
            ) : null}
          </div>

          <Link href="/posts" className="sira-home-posts-cta">
            <span>{settings.homePostsButtonText || "View all articles"}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {visiblePosts.length ? (
          <div className={`mt-10 grid gap-5 ${gridClass}`}>
            {visiblePosts.map((post) => {
              const date = post.publishedAt ?? post.createdAt;
              const previewText = post.excerpt?.trim() || "";

              return (
                <article
                  key={post.id.toString()}
                  className="sira-home-post-card group"
                >
                  {post.featuredMedia?.type === "IMAGE" ? (
                    <Link
                      href={`/posts/${post.slug}`}
                      className="relative block aspect-[16/12] overflow-hidden"
                    >
                      <Image
                        src={post.featuredMedia.url}
                        alt={post.featuredMedia.altText || post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.035]"
                      />
                    </Link>
                  ) : (
                    <div className="aspect-[16/12] bg-white/5" />
                  )}

                  <div className="flex min-h-[290px] flex-col p-5">
                    {settings.homePostsShowCategory !== "false" ? (
                      <p className="sira-home-post-category">
                        {post.category?.name || "Article"}
                      </p>
                    ) : null}

                    <Link
                      href={`/posts/${post.slug}`}
                      className="mt-3 block text-xl font-bold leading-tight tracking-[-0.025em] text-white transition hover:text-pink-300"
                    >
                      {post.title}
                    </Link>

                    <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/58">
                      {settings.homePostsShowAuthor !== "false" ? (
                        <span>{post.author.name}</span>
                      ) : null}

                      {settings.homePostsShowAuthor !== "false" &&
                      settings.homePostsShowDate !== "false" ? (
                        <span>•</span>
                      ) : null}

                      {settings.homePostsShowDate !== "false" ? (
                        <time dateTime={date.toISOString()}>
                          {date.toLocaleDateString()}
                        </time>
                      ) : null}
                    </div>

                    {settings.homePostsShowExcerpt !== "false" &&
                    previewText ? (
                      <p className="mt-5 text-sm leading-6 text-white/72">
                        {previewText}
                      </p>
                    ) : null}

                    <Link
                      href={`/posts/${post.slug}`}
                      className="mt-auto pt-6 text-sm font-semibold text-pink-300 transition hover:text-pink-200"
                    >
                      Read more <span className="ml-2">→</span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-sm text-white/60">
            Published posts will appear here automatically.
          </div>
        )}
      </div>
    </section>
  );
}
