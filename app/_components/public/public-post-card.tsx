import Image from "next/image";
import Link from "next/link";

type PostCardProps = {
  post: {
    slug: string;
    title: string;
    excerpt: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    author?: { name: string } | null;
    category?: { name: string; slug: string } | null;
    featuredMedia?: {
      type: string;
      url: string;
      altText: string | null;
    } | null;
  };
  compact?: boolean;
};

export function PublicPostCard({ post, compact = false }: PostCardProps) {
  const date = post.publishedAt ?? post.createdAt;

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      {post.featuredMedia?.type === "IMAGE" ? (
        <Link
          href={`/posts/${post.slug}`}
          className={`relative block overflow-hidden ${
            compact ? "aspect-[16/10]" : "aspect-[16/9]"
          }`}
        >
          <Image
            src={post.featuredMedia.url}
            alt={post.featuredMedia.altText || post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>
      ) : (
        <div
          className={`bg-gradient-to-br from-zinc-100 to-zinc-200 ${
            compact ? "aspect-[16/10]" : "aspect-[16/9]"
          }`}
        />
      )}

      <div className={compact ? "p-5" : "p-6"}>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          {post.category ? (
            <Link
              href={`/category/${post.category.slug}`}
              className="rounded-full bg-zinc-100 px-2.5 py-1 font-semibold text-zinc-700 transition hover:bg-zinc-200"
            >
              {post.category.name}
            </Link>
          ) : (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-semibold text-zinc-600">
              Article
            </span>
          )}

          <time dateTime={date.toISOString()}>
            {date.toLocaleDateString()}
          </time>
        </div>

        <Link
          href={`/posts/${post.slug}`}
          className="mt-4 block text-xl font-bold leading-tight tracking-tight text-zinc-950 transition group-hover:text-zinc-700"
        >
          {post.title}
        </Link>

        {post.excerpt ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600">
            {post.excerpt}
          </p>
        ) : null}

        {post.author?.name ? (
          <p className="mt-4 text-xs font-medium text-zinc-400">
            By {post.author.name}
          </p>
        ) : null}
      </div>
    </article>
  );
}
