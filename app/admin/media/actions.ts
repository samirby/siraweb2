"use server";

import { unlink } from "node:fs/promises";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { resolveMediaPath } from "@/lib/media/storage";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateMediaAction(formData: FormData) {
  const user = await requirePermission("media.upload");
  const id = BigInt(text(formData, "id"));

  const media = await prisma.media.update({
    where: { id },
    data: {
      altText: text(formData, "altText").slice(0, 255) || null,
      caption: text(formData, "caption").slice(0, 500) || null,
      folder: text(formData, "folder").slice(0, 255) || null,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "media.update",
      entityType: "Media",
      entityId: media.id.toString(),
      metadata: {
        originalName: media.originalName,
      },
    },
  });

  revalidatePath("/admin/media");
  redirect("/admin/media?saved=1");
}

export async function deleteMediaAction(formData: FormData) {
  const user = await requirePermission("media.delete");
  const id = BigInt(text(formData, "id"));

  const media = await prisma.media.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          userAvatars: true,
          pageFeatured: true,
          postFeatured: true,
          postSecondary: true,
          postGalleryItems: true,
        },
      },
    },
  });

  if (!media) {
    redirect("/admin/media");
  }

  const usageCount =
    media._count.userAvatars +
    media._count.pageFeatured +
    media._count.postFeatured +
    media._count.postSecondary +
    media._count.postGalleryItems;

  if (usageCount > 0) {
    redirect("/admin/media?inUse=1");
  }

  await prisma.media.delete({
    where: { id },
  });

  await unlink(resolveMediaPath(media.path)).catch(() => undefined);

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "media.delete",
      entityType: "Media",
      entityId: id.toString(),
      metadata: {
        originalName: media.originalName,
      },
    },
  });

  revalidatePath("/admin/media");
  redirect("/admin/media?deleted=1");
}
