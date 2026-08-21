import type { Metadata } from "next";
import Link from "next/link";

import { PublicPostCard } from "@/app/_components/public/public-post-card";
import { PublicShell } from "@/app/_components/public-shell";
import { prisma } from "@/lib/db/prisma";
import { getSiteBaseUrl } from "@/lib/seo/site-url";

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

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLocaleLowerCase();
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = await searchParams;
  const baseUrl = await getSiteBaseUrl();

  const hasFilters =
    Boolean((query.q ?? "").trim()) ||
    Boolean((query.category ?? "").trim()) ||
    Boolean((query.tag ?? "").trim()) ||
    safePage(query.page) > 1;

  const canonical = baseUrl ? `${baseUrl}/posts` : undefined;

  return {
    title: "Posts",
    description: "Browse published articles.",
    alternates: canonical ? { canonical } : undefined,
    robots: hasFilters ? { index: false, follow: true } : undefined,
  };
}

export default async function PublicPostsPage({ searchParams }: Props) {
  const query = await searchParams;
  const q = (query.q ?? "").trim();
  const category = (query.category ?? "").trim();
  const tag = (query.tag ?? "").trim();
  const requestedPage = safePage(query.page);
  const now = new Date();

  const [allPublishedPosts, categories, tags] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      include: {
        author: { select: { name: true } },
        category: true,
        featuredMedia: true,
        tags: { include: { tag: true } },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

  const normalizedQ = normalize(q);
  const normalizedCategory = normalize(category);
  const normalizedTag = normalize(tag);

  const filteredPosts = allPublishedPosts.filter((post) => {
    if (
      normalizedCategory &&
      normalize(post.category?.slug) !== normalizedCategory
    ) {
      return false;
    }

    if (
      normalizedTag &&
      !post.tags.some((item) => normalize(item.tag.slug) === normalizedTag)
    ) {
      return false;
    }

    if (normalizedQ) {
      const values = [
        post.title,
        post.excerpt,
        post.category?.name,
        post.category?.slug,
        ...post.tags.flatMap((item) => [item.tag.name, item.tag.slug]),
      ]
        .map(normalize)
        .filter(Boolean);

      if (!values.some((item) => item.includes(normalizedQ))) {
        return false;
      }
    }

    return true;
  });

  const total = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const posts = filteredPosts.slice(start, start + PAGE_SIZE);

  function buildHref(nextPage: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    if (nextPage > 1) params.set("page", String(nextPage));

    const suffix = params.toString();
    return suffix ? `/posts?${suffix}` : "/posts";
  }

  return (
    <PublicShell>
      <main className="min-h-[70vh] bg-zinc-50">
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="public-eyebrow">Articles</p>
            <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-zinc-950 sm:text-6xl">
                  Posts
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-600">
                  Search and explore articles by topic, category or tag.
                </p>
              </div>
              <p className="text-sm font-medium text-zinc-500">
                {total} article{total === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <form
            method="get"
            className="grid gap-3 rounded-[1.5rem] border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_220px_220px_auto]"
          >
            <input name="q" defaultValue={q} placeholder="Search articles..." className="public-input" />
            <select name="category" defaultValue={category} className="public-input">
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <select name="tag" defaultValue={tag} className="public-input">
              <option value="">All tags</option>
              {tags.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
            <button type="submit" className="public-button-primary">Search</button>
          </form>

          {q || category || tag ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">
                Showing {total} matching result{total === 1 ? "" : "s"}
              </p>
              <Link href="/posts" className="text-sm font-semibold text-zinc-800 hover:underline">
                Clear filters
              </Link>
            </div>
          ) : null}

          {posts.length ? (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <PublicPostCard key={post.id.toString()} post={post} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border border-dashed border-zinc-300 bg-white p-12 text-center">
              <h2 className="text-lg font-bold text-zinc-950">No posts found</h2>
              <p className="mt-2 text-sm text-zinc-500">Try changing your search or filters.</p>
            </div>
          )}

          {totalPages > 1 ? (
            <nav className="mt-10 flex items-center justify-center gap-2">
              {currentPage > 1 ? (
                <Link href={buildHref(currentPage - 1)} className="public-button-secondary">
                  Previous
                </Link>
              ) : null}
              <span className="px-4 text-sm font-medium text-zinc-500">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Link href={buildHref(currentPage + 1)} className="public-button-secondary">
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
