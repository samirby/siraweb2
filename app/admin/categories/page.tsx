import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { deleteCategoryAction } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    created?: string;
    saved?: string;
    deleted?: string;
    inUse?: string;
  }>;
};

export default async function CategoriesPage({
  searchParams,
}: Props) {
  await requirePermission("posts.view");

  const query = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      _count: {
        select: {
          posts: true,
          menuItems: true,
        },
      },
    },
  });

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            Content
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
            Categories
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Organize posts into public categories.
          </p>
        </div>

        <Link
          href="/admin/categories/new"
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white"
        >
          New category
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
          This category is in use by posts or menus. Move those items first.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {categories.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Posts</th>
                  <th className="px-5 py-3">Menu usage</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {categories.map((category) => (
                  <tr
                    key={category.id.toString()}
                    className="hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4 font-semibold text-zinc-950">
                      {category.name}
                    </td>

                    <td className="px-5 py-4 text-zinc-500">
                      /category/{category.slug}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {category._count.posts}
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {category._count.menuItems}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/category/${category.slug}`}
                          target="_blank"
                          className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                        >
                          View
                        </Link>

                        <Link
                          href={`/admin/categories/${category.id.toString()}/edit`}
                          className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                        >
                          Edit
                        </Link>

                        <form action={deleteCategoryAction}>
                          <input
                            type="hidden"
                            name="id"
                            value={category.id.toString()}
                          />
                          <button
                            type="submit"
                            disabled={
                              category._count.posts > 0 ||
                              category._count.menuItems > 0
                            }
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
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
              No categories yet
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Create the first category for your posts.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
