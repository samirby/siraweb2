import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { updateUserAction } from "@/app/admin/users/actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({
  params,
}: Props) {
  const actor = await requirePermission("menus.manage");
  const { id: rawId } = await params;

  let id: bigint;

  try {
    id = BigInt(rawId);
  } catch {
    notFound();
  }

  const [user, roles] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    }),

    prisma.role.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (!user) {
    notFound();
  }

  const isSelf = user.id === actor.id;

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/admin/users"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
      >
        ← Users
      </Link>

      <div className="mt-3 max-w-2xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
              Edit User
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Last login:{" "}
              {user.lastLoginAt
                ? user.lastLoginAt.toLocaleString()
                : "Never"}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              user.status === "ACTIVE"
                ? "bg-emerald-50 text-emerald-700"
                : user.status === "SUSPENDED"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {user.status}
          </span>
        </div>

        {isSelf ? (
          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            This is your current account. Email, role and status are protected while you are logged in.
          </div>
        ) : null}

        <form
          action={updateUserAction}
          className="mt-6 space-y-5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <input
            type="hidden"
            name="id"
            value={user.id.toString()}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Name
              </span>
              <input
                name="name"
                required
                defaultValue={user.name}
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
                disabled={isSelf}
                defaultValue={user.email}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 disabled:bg-zinc-100 disabled:text-zinc-500"
              />

              {isSelf ? (
                <input
                  type="hidden"
                  name="email"
                  value={user.email}
                />
              ) : null}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Role
              </span>

              <select
                name="roleId"
                defaultValue={user.roleId.toString()}
                disabled={isSelf}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 disabled:bg-zinc-100 disabled:text-zinc-500"
              >
                {roles.map((role) => (
                  <option
                    key={role.id.toString()}
                    value={role.id.toString()}
                  >
                    {role.name}
                  </option>
                ))}
              </select>

              {isSelf ? (
                <input
                  type="hidden"
                  name="roleId"
                  value={user.roleId.toString()}
                />
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Status
              </span>

              <select
                name="status"
                defaultValue={isSelf ? "ACTIVE" : user.status}
                disabled={isSelf}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 disabled:bg-zinc-100 disabled:text-zinc-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              {isSelf ? (
                <input
                  type="hidden"
                  name="status"
                  value="ACTIVE"
                />
              ) : null}
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              New password
            </span>
            <input
              name="password"
              type="password"
              minLength={8}
              autoComplete="new-password"
              placeholder="Leave empty to keep current password"
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </label>

          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Save user
          </button>
        </form>
      </div>
    </main>
  );
}
