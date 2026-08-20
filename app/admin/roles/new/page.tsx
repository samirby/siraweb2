import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { createRoleAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewRolePage() {
  await requirePermission("roles.manage");

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/admin/roles"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
      >
        ← Roles
      </Link>

      <div className="mt-3 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
          New Role
        </h1>

        <form
          action={createRoleAction}
          className="mt-6 space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
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

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Description
            </span>
            <textarea
              name="description"
              rows={3}
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </label>

          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Create role
          </button>
        </form>
      </div>
    </main>
  );
}
