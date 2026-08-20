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
    .slice(0, 191);
}

async function uniqueCategorySlug(base: string, currentId?: bigint) {
  const normalized = slugify(base) || "category";
  let candidate = normalized;
  let suffix = 2;

  while (true) {
    const existing = await prisma.category.findFirst({
      where: {
        slug: candidate,
        ...(currentId ? { id: { not: currentId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;

    candidate = `${normalized.slice(0, 180)}-${suffix}`;
    suffix += 1;
  }
}

export async function createCategoryAction(formData: FormData) {
  const user = await requirePermission("categories.manage");

  const name = text(formData, "name");

  if (!name) {
    throw new Error("Category name is required.");
  }

  const slug = await uniqueCategorySlug(
    text(formData, "slug") || name,
  );

  const category = await prisma.category.create({
    data: {
      name,
      slug,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "category.create",
      entityType: "Category",
      entityId: category.id.toString(),
      metadata: {
        name: category.name,
        slug: category.slug,
      },
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/posts");
  redirect("/admin/categories?created=1");
}

export async function updateCategoryAction(formData: FormData) {
  const user = await requirePermission("categories.manage");

  const id = BigInt(text(formData, "id"));
  const name = text(formData, "name");

  if (!name) {
    throw new Error("Category name is required.");
  }

  const slug = await uniqueCategorySlug(
    text(formData, "slug") || name,
    id,
  );

  const category = await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "category.update",
      entityType: "Category",
      entityId: category.id.toString(),
      metadata: {
        name: category.name,
        slug: category.slug,
      },
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/posts");
  revalidatePath(`/category/${category.slug}`);
  redirect("/admin/categories?saved=1");
}

export async function deleteCategoryAction(formData: FormData) {
  const user = await requirePermission("categories.manage");

  const id = BigInt(text(formData, "id"));

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
    redirect("/admin/categories");
  }

  if (category._count.posts > 0 || category._count.menuItems > 0) {
    redirect("/admin/categories?inUse=1");
  }

  await prisma.category.delete({
    where: { id },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "category.delete",
      entityType: "Category",
      entityId: id.toString(),
      metadata: {
        name: category.name,
        slug: category.slug,
      },
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/admin/posts");
  redirect("/admin/categories?deleted=1");
}
