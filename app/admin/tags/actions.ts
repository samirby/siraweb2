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

async function uniqueTagSlug(base: string, currentId?: bigint) {
  const normalized = slugify(base) || "tag";
  let candidate = normalized;
  let suffix = 2;

  while (true) {
    const existing = await prisma.tag.findFirst({
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

export async function createTagAction(formData: FormData) {
  const user = await requirePermission("posts.update");
  const name = text(formData, "name");

  if (!name) throw new Error("Tag name is required.");

  const slug = await uniqueTagSlug(text(formData, "slug") || name);

  const tag = await prisma.tag.create({
    data: { name, slug },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "tag.create",
      entityType: "Tag",
      entityId: tag.id.toString(),
      metadata: { name: tag.name, slug: tag.slug },
    },
  });

  revalidatePath("/admin/tags");
  revalidatePath("/admin/posts");
  redirect("/admin/tags?created=1");
}

export async function updateTagAction(formData: FormData) {
  const user = await requirePermission("posts.update");
  const id = BigInt(text(formData, "id"));
  const name = text(formData, "name");

  if (!name) throw new Error("Tag name is required.");

  const slug = await uniqueTagSlug(
    text(formData, "slug") || name,
    id,
  );

  const tag = await prisma.tag.update({
    where: { id },
    data: { name, slug },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "tag.update",
      entityType: "Tag",
      entityId: tag.id.toString(),
      metadata: { name: tag.name, slug: tag.slug },
    },
  });

  revalidatePath("/admin/tags");
  revalidatePath("/admin/posts");
  revalidatePath(`/tag/${tag.slug}`);
  redirect("/admin/tags?saved=1");
}

export async function deleteTagAction(formData: FormData) {
  const user = await requirePermission("posts.update");
  const id = BigInt(text(formData, "id"));

  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  if (!tag) redirect("/admin/tags");

  if (tag._count.posts > 0) {
    redirect("/admin/tags?inUse=1");
  }

  await prisma.tag.delete({ where: { id } });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "tag.delete",
      entityType: "Tag",
      entityId: id.toString(),
      metadata: { name: tag.name, slug: tag.slug },
    },
  });

  revalidatePath("/admin/tags");
  revalidatePath("/admin/posts");
  redirect("/admin/tags?deleted=1");
}
