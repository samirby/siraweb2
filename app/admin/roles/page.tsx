import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import {
  bootstrapAccessPermissionsAction,
  deleteRoleAction,
} from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    deleted?: string;
    inUse?: string;
    bootstrapped?: string;
  }>;
};

export default async function RolesPage({
  searchParams,
}: Props) {
  const actor = await requirePermission("menus.manage");
  const query = await searchParams;

  const [roles, accessPermissions] = await Promise.all([
    prisma.role.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            users: true,
            permissions: true,
          },
        },
      },
    }),

    prisma.permission.findMany({
      where: {
        key: {
          in: ["users.manage", "roles.manage"],
        },
      },
      select: {
        key: true,
        roles: {
          where: {
            roleId: actor.roleId,
          },
          select: {
            roleId: true,
          },
        },
      },
    }),
  ]);

  const hasUsersManage = accessPermissions.some(
    (item) =>
      item.key === "users.manage" &&
      item.roles.length > 0,
  );

  const hasRolesManage = accessPermissions.some(
    (item) =>
      item.key === "roles.manage" &&
      item.roles.length > 0,
  );

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            Access
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
            Roles & Permissions
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            Control what each CMS role can access and manage.
          </p>
        </div>

        <Link
          href="/admin/roles/new"
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white"
        >
          New role
        </Link>
      </div>

      {query.deleted === "1" ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Role deleted successfully.
        </div>
      ) : null}

      {query.inUse === "1" ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          This role is assigned to users. Reassign them before deleting it.
        </div>
      ) : null}

      {query.bootstrapped === "1" ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Dedicated Users/Roles permissions were added to your current role.
        </div>
      ) : null}

      {!hasUsersManage || !hasRolesManage ? (
        <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="text-sm font-bold text-blue-950">
            Initialize dedicated access permissions
          </h2>

          <p className="mt-1 text-sm leading-6 text-blue-800">
            This safely creates users.manage and roles.manage and grants them to your current role. Existing permissions are not removed.
          </p>

          <form
            action={bootstrapAccessPermissionsAction}
            className="mt-3"
          >
            <button
              type="submit"
              className="rounded-xl bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Initialize permissions
            </button>
          </form>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Users</th>
                <th className="px-5 py-3">Permissions</th>
                <th className="px-5 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {roles.map((role) => (
                <tr
                  key={role.id.toString()}
                  className="hover:bg-zinc-50"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-zinc-950">
                      {role.name}
                    </p>
                    {role.description ? (
                      <p className="mt-1 max-w-md text-xs text-zinc-500">
                        {role.description}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-5 py-4 text-zinc-500">
                    {role.slug}
                  </td>

                  <td className="px-5 py-4 text-zinc-600">
                    {role._count.users}
                  </td>

                  <td className="px-5 py-4 text-zinc-600">
                    {role._count.permissions}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/roles/${role.id.toString()}/edit`}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700"
                      >
                        Edit
                      </Link>

                      <form action={deleteRoleAction}>
                        <input
                          type="hidden"
                          name="id"
                          value={role.id.toString()}
                        />

                        <button
                          type="submit"
                          disabled={role._count.users > 0}
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
      </div>
    </main>
  );
}
