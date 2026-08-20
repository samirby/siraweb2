import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import {
  deleteCategoryAction,
  updateCategoryAction,
} from "@/app/admin/categories/actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCategoryPage({
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

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
          menuItems: true,
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const inUse =
    category._count.posts > 0 ||
    category._count.menuItems > 0;

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/admin/categories"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
      >
        ← Categories
      </Link>

      <div className="mt-3 max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
          Edit Category
        </h1>

        <form
          action={updateCategoryAction}
          className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <input
            type="hidden"
            name="id"
            value={category.id.toString()}
          />

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Name
            </span>
            <input
              name="name"
              required
              defaultValue={category.name}
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Slug
            </span>
            <input
              name="slug"
              defaultValue={category.slug}
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white"
            >
              Save category
            </button>

            <Link
              href={`/category/${category.slug}`}
              target="_blank"
              className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700"
            >
              View category
            </Link>
          </div>
        </form>

        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-600">
            {category._count.posts} posts ·{" "}
            {category._count.menuItems} menu items
          </p>

          <form action={deleteCategoryAction} className="mt-4">
            <input
              type="hidden"
              name="id"
              value={category.id.toString()}
            />
            <button
              type="submit"
              disabled={inUse}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Delete category
            </button>
          </form>

          {inUse ? (
            <p className="mt-2 text-xs text-zinc-400">
              Move its posts/menu items before deleting.
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
