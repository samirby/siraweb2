import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { deleteTagAction } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    created?: string;
    saved?: string;
    deleted?: string;
    inUse?: string;
  }>;
};

export default async function TagsPage({ searchParams }: Props) {
  await requirePermission("posts.view");

  const query = await searchParams;

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">Content</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
            Tags
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Add flexible labels to organize related posts.
          </p>
        </div>

        <Link
          href="/admin/tags/new"
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white"
        >
          New tag
        </Link>
      </div>

      {query.created === "1" ||
      query.saved === "1" ||
      query.deleted === "1" ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Changes saved successfully.
        </div>
      ) : null}

      {query.inUse === "1" ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          This tag is currently used by posts. Remove it first.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {tags.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Posts</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {tags.map((tag) => (
                  <tr key={tag.id.toString()} className="hover:bg-zinc-50">
                    <td className="px-5 py-4 font-semibold text-zinc-950">
                      {tag.name}
                    </td>
                    <td className="px-5 py-4 text-zinc-500">
                      /tag/{tag.slug}
                    </td>
                    <td className="px-5 py-4 text-zinc-600">
                      {tag._count.posts}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/tag/${tag.slug}`}
                          target="_blank"
                          className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/tags/${tag.id.toString()}/edit`}
                          className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                        >
                          Edit
                        </Link>
                        <form action={deleteTagAction}>
                          <input
                            type="hidden"
                            name="id"
                            value={tag.id.toString()}
                          />
                          <button
                            type="submit"
                            disabled={tag._count.posts > 0}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40"
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
          <div className="p-12 text-center text-sm text-zinc-500">
            No tags yet.
          </div>
        )}
      </div>
    </main>
  );
}
