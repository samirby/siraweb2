import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { createUserAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  await requirePermission("menus.manage");

  const roles = await prisma.role.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/admin/users"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
      >
        ← Users
      </Link>

      <div className="mt-3 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
          New User
        </h1>

        <form
          action={createUserAction}
          className="mt-6 space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
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
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Password
            </span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
            <span className="mt-1 block text-xs text-zinc-400">
              Minimum 8 characters.
            </span>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Role
              </span>
              <select
                name="roleId"
                required
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
              >
                <option value="">Choose role</option>
                {roles.map((role) => (
                  <option
                    key={role.id.toString()}
                    value={role.id.toString()}
                  >
                    {role.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Status
              </span>
              <select
                name="status"
                defaultValue="ACTIVE"
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Create user
          </button>
        </form>
      </div>
    </main>
  );
}
