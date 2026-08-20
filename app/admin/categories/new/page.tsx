import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { createCategoryAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  await requirePermission("posts.update");

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
          New Category
        </h1>

        <form
          action={createCategoryAction}
          className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Name
            </span>
            <input
              name="name"
              required
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Slug
            </span>
            <input
              name="slug"
              placeholder="generated-from-name"
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </label>

          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white"
          >
            Create category
          </button>
        </form>
      </div>
    </main>
  );
}
