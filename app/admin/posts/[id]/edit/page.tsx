import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import {
  deletePostAction,
  togglePostPublishAction,
  updatePostAction,
} from "@/app/admin/posts/actions";
import { PostForm } from "@/app/admin/posts/_components/post-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({
  params,
}: Props) {
  await requirePermission("posts.update");

  const { id: rawId } = await params;

  let id: bigint;

  try {
    id = BigInt(rawId);
  } catch {
    notFound();
  }

  const [post, categories, tags, media] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        gallery: {
          orderBy: { sortOrder: "asc" },
          select: {
            mediaId: true,
          },
        },
        tags: {
          select: {
            tagId: true,
          },
        },
      },
    }),

    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
      },
    }),

    prisma.media.findMany({
      where: { type: "IMAGE" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        url: true,
        originalName: true,
        altText: true,
        folder: true,
      },
      take: 500,
    }),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/posts"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
          >
            ← Posts
          </Link>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
            Edit Post
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            /posts/{post.slug}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {post.status === "PUBLISHED" ? (
            <Link
              href={`/posts/${post.slug}`}
              target="_blank"
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700"
            >
              View post
            </Link>
          ) : null}

          <form action={togglePostPublishAction}>
            <input type="hidden" name="id" value={post.id.toString()} />
            <button
              type="submit"
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700"
            >
              {post.status === "PUBLISHED"
                ? "Unpublish"
                : "Publish"}
            </button>
          </form>

          <form action={deletePostAction}>
            <input type="hidden" name="id" value={post.id.toString()} />
            <button
              type="submit"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <PostForm
        action={updatePostAction}
        submitLabel="Save changes"
        categories={categories.map((item) => ({
          id: item.id.toString(),
          name: item.name,
        }))}
        tags={tags.map((item) => ({
          id: item.id.toString(),
          name: item.name,
        }))}
        media={media.map((item) => ({
          ...item,
          id: item.id.toString(),
        }))}
        value={{
          id: post.id.toString(),
          title: post.title,
          slug: post.slug,
          status: post.status,
          categoryId: post.categoryId?.toString() ?? null,
          excerpt: post.excerpt,
          content: post.content,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          canonicalUrl: post.canonicalUrl,
          noIndex: post.noIndex,
          featuredMediaId:
            post.featuredMediaId?.toString() ?? null,
          secondaryMediaId:
            post.secondaryMediaId?.toString() ?? null,
          galleryMediaIds: post.gallery.map((item) =>
            item.mediaId.toString(),
          ),
          tagIds: post.tags.map((item) =>
            item.tagId.toString(),
          ),
        }}
      />
    </main>
  );
}
