import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { toggleUserStatusAction } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    created?: string;
    saved?: string;
    statusChanged?: string;
    selfProtected?: string;
  }>;
};

export default async function UsersAdminPage({
  searchParams,
}: Props) {
  const actor = await requirePermission("menus.manage");
  const query = await searchParams;

  const users = await prisma.user.findMany({
    orderBy: [
      { status: "asc" },
      { createdAt: "asc" },
    ],
    include: {
      role: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            Access
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
            Users
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            Manage CMS accounts, roles and account status.
          </p>
        </div>

        <Link
          href="/admin/users/new"
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white"
        >
          New user
        </Link>
      </div>

      {query.created === "1" ||
      query.saved === "1" ||
      query.statusChanged === "1" ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          User changes saved successfully.
        </div>
      ) : null}

      {query.selfProtected === "1" ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Your own logged-in account cannot be deactivated.
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last login</th>
                <th className="px-5 py-3">Created</th>
                <th className="px-5 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {users.map((user) => {
                const isSelf = user.id === actor.id;

                return (
                  <tr
                    key={user.id.toString()}
                    className="hover:bg-zinc-50"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-zinc-950">
                        {user.name}
                        {isSelf ? (
                          <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                            You
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-1 text-xs text-zinc-500">
                        {user.email}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-zinc-700">
                      {user.role.name}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          user.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : user.status === "SUSPENDED"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-zinc-500">
                      {user.lastLoginAt
                        ? user.lastLoginAt.toLocaleString()
                        : "Never"}
                    </td>

                    <td className="px-5 py-4 text-xs text-zinc-500">
                      {user.createdAt.toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/users/${user.id.toString()}/edit`}
                          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700"
                        >
                          Edit
                        </Link>

                        <form action={toggleUserStatusAction}>
                          <input
                            type="hidden"
                            name="id"
                            value={user.id.toString()}
                          />

                          <button
                            type="submit"
                            disabled={isSelf}
                            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {user.status === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
