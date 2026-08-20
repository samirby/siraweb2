import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { updateRoleAction } from "@/app/admin/roles/actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    created?: string;
    saved?: string;
  }>;
};

function groupName(key: string) {
  const [group] = key.split(".");
  return group || "other";
}

export default async function EditRolePage({
  params,
  searchParams,
}: Props) {
  await requirePermission("roles.manage");

  const { id: rawId } = await params;
  const query = await searchParams;

  let id: bigint;

  try {
    id = BigInt(rawId);
  } catch {
    notFound();
  }

  const [role, permissions] = await Promise.all([
    prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          select: {
            permissionId: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    }),

    prisma.permission.findMany({
      orderBy: {
        key: "asc",
      },
    }),
  ]);

  if (!role) notFound();

  const selected = new Set(
    role.permissions.map((item) =>
      item.permissionId.toString(),
    ),
  );

  const groups = new Map<
    string,
    typeof permissions
  >();

  for (const permission of permissions) {
    const group = groupName(permission.key);
    const items = groups.get(group) ?? [];
    items.push(permission);
    groups.set(group, items);
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <Link
        href="/admin/roles"
        className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
      >
        ← Roles
      </Link>

      <div className="mt-3 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
          Edit Role
        </h1>

        {query.created === "1" ||
        query.saved === "1" ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            Role saved successfully.
          </div>
        ) : null}

        <form
          action={updateRoleAction}
          className="mt-6 space-y-5"
        >
          <input
            type="hidden"
            name="id"
            value={role.id.toString()}
          />

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-zinc-800">
                  Name
                </span>
                <input
                  name="name"
                  required
                  defaultValue={role.name}
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-zinc-800">
                  Slug
                </span>
                <input
                  name="slug"
                  defaultValue={role.slug}
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-sm font-semibold text-zinc-800">
                Description
              </span>
              <textarea
                name="description"
                rows={3}
                defaultValue={role.description ?? ""}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </label>

            <p className="mt-4 text-xs text-zinc-400">
              {role._count.users} user(s) currently use this role.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-lg font-bold text-zinc-950">
                Permission matrix
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Select exactly what this role is allowed to do.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {Array.from(groups.entries()).map(
                ([group, items]) => (
                  <div
                    key={group}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                  >
                    <h3 className="text-sm font-bold capitalize text-zinc-950">
                      {group}
                    </h3>

                    <div className="mt-3 space-y-2">
                      {items.map((permission) => (
                        <label
                          key={permission.id.toString()}
                          className="flex items-start gap-3 rounded-lg bg-white px-3 py-2.5"
                        >
                          <input
                            type="checkbox"
                            name="permissionIds"
                            value={permission.id.toString()}
                            defaultChecked={selected.has(
                              permission.id.toString(),
                            )}
                            className="mt-1"
                          />

                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-zinc-800">
                              {permission.key}
                            </span>

                            {permission.description ? (
                              <span className="mt-0.5 block text-xs leading-5 text-zinc-500">
                                {permission.description}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>

          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Save role & permissions
          </button>
        </form>
      </div>
    </main>
  );
}
