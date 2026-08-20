"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

async function uniqueRoleSlug(base: string, currentId?: bigint) {
  const normalized = slugify(base) || "role";
  let candidate = normalized;
  let suffix = 2;

  while (true) {
    const existing = await prisma.role.findFirst({
      where: {
        slug: candidate,
        ...(currentId ? { id: { not: currentId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;

    candidate = `${normalized.slice(0, 90)}-${suffix}`;
    suffix += 1;
  }
}

export async function createRoleAction(formData: FormData) {
  const actor = await requirePermission("menus.manage");

  const name = text(formData, "name");
  const description = text(formData, "description");

  if (!name) throw new Error("Role name is required.");

  const slug = await uniqueRoleSlug(
    text(formData, "slug") || name,
  );

  const role = await prisma.role.create({
    data: {
      name,
      slug,
      description: description || null,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: actor.id,
      action: "role.create",
      entityType: "Role",
      entityId: role.id.toString(),
      metadata: {
        name: role.name,
        slug: role.slug,
      },
    },
  });

  revalidatePath("/admin/roles");
  redirect(`/admin/roles/${role.id.toString()}/edit?created=1`);
}

export async function updateRoleAction(formData: FormData) {
  const actor = await requirePermission("menus.manage");

  const id = BigInt(text(formData, "id"));
  const name = text(formData, "name");
  const description = text(formData, "description");

  if (!name) throw new Error("Role name is required.");

  const existing = await prisma.role.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!existing) redirect("/admin/roles");

  const slug = await uniqueRoleSlug(
    text(formData, "slug") || name,
    id,
  );

  const permissionIds = formData
    .getAll("permissionIds")
    .map((value) => String(value).trim())
    .filter(Boolean)
    .map((value) => BigInt(value));

  await prisma.$transaction(async (tx) => {
    await tx.role.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
      },
    });

    await tx.rolePermission.deleteMany({
      where: {
        roleId: id,
      },
    });

    if (permissionIds.length) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: id,
          permissionId,
        })),
      });
    }
  });

  await prisma.activityLog.create({
    data: {
      userId: actor.id,
      action: "role.update",
      entityType: "Role",
      entityId: id.toString(),
      metadata: {
        name,
        slug,
        permissions: permissionIds.length,
      },
    },
  });

  revalidatePath("/admin/roles");
  revalidatePath(`/admin/roles/${id.toString()}/edit`);
  redirect(`/admin/roles/${id.toString()}/edit?saved=1`);
}

export async function deleteRoleAction(formData: FormData) {
  const actor = await requirePermission("menus.manage");

  const id = BigInt(text(formData, "id"));

  const role = await prisma.role.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
  });

  if (!role) redirect("/admin/roles");

  if (role._count.users > 0) {
    redirect("/admin/roles?inUse=1");
  }

  await prisma.role.delete({
    where: { id },
  });

  await prisma.activityLog.create({
    data: {
      userId: actor.id,
      action: "role.delete",
      entityType: "Role",
      entityId: id.toString(),
      metadata: {
        name: role.name,
        slug: role.slug,
      },
    },
  });

  revalidatePath("/admin/roles");
  redirect("/admin/roles?deleted=1");
}

export async function bootstrapAccessPermissionsAction() {
  const actor = await requirePermission("menus.manage");

  const definitions = [
    {
      key: "users.manage",
      description: "Manage CMS users and account access.",
    },
    {
      key: "roles.manage",
      description: "Manage roles and permission assignments.",
    },
  ];

  const permissions = [];

  for (const item of definitions) {
    const permission = await prisma.permission.upsert({
      where: {
        key: item.key,
      },
      update: {
        description: item.description,
      },
      create: item,
    });

    permissions.push(permission);
  }

  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: actor.roleId,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: actor.roleId,
        permissionId: permission.id,
      },
    });
  }

  await prisma.activityLog.create({
    data: {
      userId: actor.id,
      action: "permissions.bootstrap",
      entityType: "Role",
      entityId: actor.roleId.toString(),
      metadata: {
        permissions: ["users.manage", "roles.manage"],
      },
    },
  });

  revalidatePath("/admin/roles");
  revalidatePath("/admin/users");
  redirect("/admin/roles?bootstrapped=1");
}
