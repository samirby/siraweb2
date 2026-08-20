"use server";

import path from "node:path";
import { mkdir, rename, unlink } from "node:fs/promises";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import {
  buildMediaRelativePath,
  normalizeMediaFolder,
  resolveMediaPath,
} from "@/lib/media/storage";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateMediaAction(formData: FormData) {
  const user = await requirePermission("media.upload");
  const id = BigInt(text(formData, "id"));

  const existing = await prisma.media.findUnique({
    where: { id },
  });

  if (!existing) {
    redirect("/admin/media");
  }

  const nextFolder = normalizeMediaFolder(
    text(formData, "folder"),
  );

  let nextPath = existing.path;
  let moved = false;

  if (nextFolder !== normalizeMediaFolder(existing.folder)) {
    nextPath = buildMediaRelativePath({
      folder: nextFolder,
      filename: existing.filename,
      date: existing.createdAt,
    });

    const oldAbsolutePath = resolveMediaPath(existing.path);
    const newAbsolutePath = resolveMediaPath(nextPath);

    if (oldAbsolutePath !== newAbsolutePath) {
      await mkdir(path.dirname(newAbsolutePath), {
        recursive: true,
      });

      await rename(oldAbsolutePath, newAbsolutePath);
      moved = true;
    }
  }

  try {
    const media = await prisma.media.update({
      where: { id },
      data: {
        altText: text(formData, "altText").slice(0, 255) || null,
        caption: text(formData, "caption").slice(0, 500) || null,
        folder: nextFolder,
        path: nextPath,
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
          folder: media.folder,
          path: media.path,
        },
      },
    });
  } catch (error) {
    if (moved) {
      const movedPath = resolveMediaPath(nextPath);
      const originalPath = resolveMediaPath(existing.path);

      await mkdir(path.dirname(originalPath), {
        recursive: true,
      });

      await rename(movedPath, originalPath).catch(
        () => undefined,
      );
    }

    throw error;
  }

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

  await unlink(resolveMediaPath(media.path)).catch(
    () => undefined,
  );

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "media.delete",
      entityType: "Media",
      entityId: id.toString(),
      metadata: {
        originalName: media.originalName,
        folder: media.folder,
        path: media.path,
      },
    },
  });

  revalidatePath("/admin/media");
  redirect("/admin/media?deleted=1");
}
