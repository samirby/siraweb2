"use server";

import path from "node:path";
import { mkdir, rename, unlink } from "node:fs/promises";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import {
  getMediaLibraries,
  saveMediaLibraries,
} from "@/lib/media/libraries";
import {
  buildMediaRelativePath,
  normalizeMediaFolder,
  resolveMediaPath,
} from "@/lib/media/storage";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function movePhysicalMedia(
  media: {
    id: bigint;
    filename: string;
    path: string;
    folder: string | null;
    createdAt: Date;
  },
  destination: string,
) {
  const nextFolder = normalizeMediaFolder(destination);

  if (nextFolder === normalizeMediaFolder(media.folder)) {
    return {
      folder: nextFolder,
      path: media.path,
    };
  }

  const nextPath = buildMediaRelativePath({
    folder: nextFolder,
    filename: media.filename,
    date: media.createdAt,
  });

  const oldAbsolutePath = resolveMediaPath(media.path);
  const newAbsolutePath = resolveMediaPath(nextPath);

  await mkdir(path.dirname(newAbsolutePath), {
    recursive: true,
  });

  await rename(oldAbsolutePath, newAbsolutePath);

  try {
    await prisma.media.update({
      where: { id: media.id },
      data: {
        folder: nextFolder,
        path: nextPath,
      },
    });
  } catch (error) {
    await mkdir(path.dirname(oldAbsolutePath), {
      recursive: true,
    });
    await rename(newAbsolutePath, oldAbsolutePath).catch(
      () => undefined,
    );
    throw error;
  }

  return {
    folder: nextFolder,
    path: nextPath,
  };
}

export async function createLibraryAction(formData: FormData) {
  const user = await requirePermission("media.upload");

  const library = normalizeMediaFolder(
    text(formData, "library"),
  );

  const libraries = await getMediaLibraries();

  if (!libraries.includes(library)) {
    await saveMediaLibraries([...libraries, library]);
  }

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "media_library.create",
      entityType: "MediaLibrary",
      entityId: library,
      metadata: { library },
    },
  });

  revalidatePath("/admin/media");
  redirect(`/admin/media?library=${encodeURIComponent(library)}`);
}

export async function renameLibraryAction(formData: FormData) {
  const user = await requirePermission("media.upload");

  const from = normalizeMediaFolder(text(formData, "from"));
  const to = normalizeMediaFolder(text(formData, "to"));

  if (from === to) {
    redirect(`/admin/media?library=${encodeURIComponent(to)}`);
  }

  const libraries = await getMediaLibraries();

  if (libraries.includes(to)) {
    throw new Error("A library with this name already exists.");
  }

  const mediaItems = await prisma.media.findMany({
    where: { folder: from },
    orderBy: { id: "asc" },
  });

  for (const media of mediaItems) {
    await movePhysicalMedia(media, to);
  }

  await saveMediaLibraries(
    libraries.map((library) =>
      library === from ? to : library,
    ),
  );

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "media_library.rename",
      entityType: "MediaLibrary",
      entityId: to,
      metadata: { from, to },
    },
  });

  revalidatePath("/admin/media");
  redirect(`/admin/media?library=${encodeURIComponent(to)}`);
}

export async function deleteLibraryAction(formData: FormData) {
  const user = await requirePermission("media.delete");

  const library = normalizeMediaFolder(
    text(formData, "library"),
  );

  if (library === "misc") {
    throw new Error("The misc library cannot be deleted.");
  }

  const count = await prisma.media.count({
    where: { folder: library },
  });

  if (count > 0) {
    redirect(
      `/admin/media?library=${encodeURIComponent(
        library,
      )}&libraryNotEmpty=1`,
    );
  }

  const libraries = await getMediaLibraries();

  await saveMediaLibraries(
    libraries.filter((item) => item !== library),
  );

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "media_library.delete",
      entityType: "MediaLibrary",
      entityId: library,
      metadata: { library },
    },
  });

  revalidatePath("/admin/media");
  redirect("/admin/media");
}

export async function moveMediaAction(formData: FormData) {
  const user = await requirePermission("media.upload");

  const id = BigInt(text(formData, "id"));
  const destination = normalizeMediaFolder(
    text(formData, "destination"),
  );

  const media = await prisma.media.findUnique({
    where: { id },
  });

  if (!media) {
    redirect("/admin/media");
  }

  const result = await movePhysicalMedia(
    media,
    destination,
  );

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "media.move",
      entityType: "Media",
      entityId: id.toString(),
      metadata: {
        originalName: media.originalName,
        from: media.folder,
        to: result.folder,
      },
    },
  });

  revalidatePath("/admin/media");
  redirect(
    `/admin/media?library=${encodeURIComponent(
      destination,
    )}&moved=1`,
  );
}

export async function updateMediaAction(formData: FormData) {
  const user = await requirePermission("media.upload");
  const id = BigInt(text(formData, "id"));

  const media = await prisma.media.update({
    where: { id },
    data: {
      altText: text(formData, "altText").slice(0, 255) || null,
      caption: text(formData, "caption").slice(0, 500) || null,
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
  redirect(
    `/admin/media?library=${encodeURIComponent(
      normalizeMediaFolder(media.folder),
    )}&saved=1`,
  );
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

  const usage = {
    userAvatars: media._count.userAvatars,
    pageFeatured: media._count.pageFeatured,
    postFeatured: media._count.postFeatured,
    postSecondary: media._count.postSecondary,
    postGalleryItems: media._count.postGalleryItems,
  };

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
        forceDelete: true,
        detachedUsage: usage,
      },
    },
  });

  revalidatePath("/admin/media");
  redirect(
    `/admin/media?library=${encodeURIComponent(
      normalizeMediaFolder(media.folder),
    )}&deleted=1`,
  );
}
