import Link from "next/link";

import { PublicShell } from "@/app/_components/public-shell";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 12;

function safePage(value?: string) {
  const page = Number(value ?? "1");
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

export default async function PublicPostsPage({
  searchParams,
}: Props) {
  const query = await searchParams;

  const q = (query.q ?? "").trim();
  const category = (query.category ?? "").trim();
  const tag = (query.tag ?? "").trim();
  const currentPage = safePage(query.page);

  const where = {
    status: "PUBLISHED" as const,
    AND: [
      {
        OR: [
          { publishedAt: null },
          { publishedAt: { lte: new Date() } },
        ],
      },
      ...(q
        ? [
            {
              OR: [
                { title: { contains: q } },
                { excerpt: { contains: q } },
              ],
            },
          ]
        : []),
      ...(category
        ? [
            {
              category: {
                slug: category,
              },
            },
          ]
        : []),
      ...(tag
        ? [
            {
              tags: {
                some: {
                  tag: {
                    slug: tag,
                  },
                },
              },
            },
          ]
        : []),
    ],
  };

  const [posts, total, categories, tags] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" },
      ],
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        author: {
          select: {
            name: true,
          },
        },
        category: true,
        featuredMedia: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }),

    prisma.post.count({ where }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        name: true,
        slug: true,
      },
    }),

    prisma.tag.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        name: true,
        slug: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();

    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    const suffix = params.toString();

    return suffix ? `/posts?${suffix}` : "/posts";
  }

  return (
    <PublicShell>
      <main className="min-h-[70vh] bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Articles
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
              Posts
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
              Browse published articles by category, tag or search.
            </p>
          </header>

          <form
            method="get"
            className="mb-8 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_220px_auto]"
          >
            <input
              name="q"
              defaultValue={q}
              placeholder="Search posts..."
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
            />

            <select
              name="category"
              defaultValue={category}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm"
            >
              <option value="">All categories</option>

              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>

            <select
              name="tag"
              defaultValue={tag}
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm"
            >
              <option value="">All tags</option>

              {tags.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Filter
            </button>
          </form>

          {(q || category || tag) ? (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">
                {total} result(s)
              </p>

              <Link
                href="/posts"
                className="text-sm font-semibold text-zinc-700 hover:text-zinc-950"
              >
                Clear filters
              </Link>
            </div>
          ) : null}

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
                  ) : (
                    <div className="aspect-[16/9] bg-zinc-100" />
                  )}

                  <div className="p-5">
                    <div className="flex flex-wrap gap-2">
                      {post.category ? (
                        <Link
                          href={`/category/${post.category.slug}`}
                          className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-700"
                        >
                          {post.category.name}
                        </Link>
                      ) : null}

                      {post.tags.slice(0, 3).map((item) => (
                        <Link
                          key={item.tag.id.toString()}
                          href={`/tag/${item.tag.slug}`}
                          className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-500"
                        >
                          #{item.tag.name}
                        </Link>
                      ))}
                    </div>

                    <Link
                      href={`/posts/${post.slug}`}
                      className="mt-4 block text-xl font-bold tracking-tight text-zinc-950 hover:underline"
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
            <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
              <h2 className="text-lg font-bold text-zinc-950">
                No posts found
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Try changing the search or filters.
              </p>
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="mt-8 flex items-center justify-center gap-2">
              {currentPage > 1 ? (
                <Link
                  href={buildHref(currentPage - 1)}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700"
                >
                  Previous
                </Link>
              ) : null}

              <span className="px-3 text-sm text-zinc-500">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={buildHref(currentPage + 1)}
                  className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700"
                >
                  Next
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      </main>
    </PublicShell>
  );
}
