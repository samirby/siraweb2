import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { createPostAction } from "../actions";
import { PostForm } from "../_components/post-form";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  await requirePermission("posts.create");

  const [categories, media] = await Promise.all([
    prisma.category.findMany({
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

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-6">
        <Link
          href="/admin/posts"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
        >
          ← Posts
        </Link>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
          Add New Post
        </h1>
      </div>

      <PostForm
        action={createPostAction}
        submitLabel="Create post"
        categories={categories.map((item) => ({
          id: item.id.toString(),
          name: item.name,
        }))}
        media={media.map((item) => ({
          ...item,
          id: item.id.toString(),
        }))}
      />
    </main>
  );
}
