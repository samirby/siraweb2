import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { createMenuAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewMenuPage() {
  await requirePermission("menus.manage");

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link
        href="/admin/menus"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
      >
        ← Menus
      </Link>

      <div className="mt-2 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
          New Menu
        </h1>

        <form
          action={createMenuAction}
          className="mt-6 space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Name
            </span>
            <input
              name="name"
              required
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Slug
            </span>
            <input
              name="slug"
              placeholder="generated-from-name"
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Location
            </span>
            <select
              name="location"
              defaultValue=""
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
            >
              <option value="">Custom / unassigned</option>
              <option value="TOP">Top Menu</option>
              <option value="FOOTER">Footer Menu</option>
              <option value="SECONDARY">Secondary Menu</option>
            </select>
          </label>

          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white"
          >
            Create menu
          </button>
        </form>
      </div>
    </main>
  );
}
