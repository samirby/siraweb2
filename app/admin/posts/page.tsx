import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import {
  deletePostAction,
  togglePostPublishAction,
} from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    created?: string;
    saved?: string;
    deleted?: string;
  }>;
};

export default async function PostsAdminPage({
  searchParams,
}: Props) {
  await requirePermission("posts.view");

  const query = await searchParams;

  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      author: {
        select: {
          name: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
    take: 100,
  });

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            Content
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
            Posts
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            Create, publish and manage articles.
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white"
        >
          New post
        </Link>
      </div>

      {query.created === "1" ||
      query.saved === "1" ||
      query.deleted === "1" ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Changes saved successfully.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {posts.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Author</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {posts.map((post) => (
                  <tr
                    key={post.id.toString()}
                    className="hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/posts/${post.id.toString()}/edit`}
                        className="font-semibold text-zinc-950 hover:underline"
                      >
                        {post.title}
                      </Link>
                      <div className="mt-0.5 text-xs text-zinc-500">
                        /posts/{post.slug}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {post.category?.name ?? "Uncategorized"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          post.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700"
                            : post.status === "ARCHIVED"
                              ? "bg-zinc-200 text-zinc-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {post.author.name}
                    </td>

                    <td className="px-5 py-4 text-zinc-500">
                      {post.updatedAt.toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {post.status === "PUBLISHED" ? (
                          <Link
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                          >
                            View
                          </Link>
                        ) : null}

                        <Link
                          href={`/admin/posts/${post.id.toString()}/edit`}
                          className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                        >
                          Edit
                        </Link>

                        <form action={togglePostPublishAction}>
                          <input
                            type="hidden"
                            name="id"
                            value={post.id.toString()}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                          >
                            {post.status === "PUBLISHED"
                              ? "Unpublish"
                              : "Publish"}
                          </button>
                        </form>

                        <form action={deletePostAction}>
                          <input
                            type="hidden"
                            name="id"
                            value={post.id.toString()}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <h2 className="text-lg font-bold text-zinc-950">
              No posts yet
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Create the first article for your site.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
