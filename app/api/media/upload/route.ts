import crypto from "node:crypto";
import path from "node:path";
import { mkdir, unlink, writeFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { getApiUserWithPermission } from "@/lib/auth/api-user";
import { prisma } from "@/lib/db/prisma";
import { getMediaStorageRoot } from "@/lib/media/storage";
import {
  ALLOWED_MEDIA_MIME_TYPES,
  isAllowedMediaMimeType,
  MAX_MEDIA_FILE_SIZE,
} from "@/lib/media/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanText(value: FormDataEntryValue | null, maxLength: number) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

export async function POST(request: Request) {
  const user = await getApiUserWithPermission("media.upload");

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart form data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Please select an image." },
      { status: 400 },
    );
  }

  if (file.size <= 0) {
    return NextResponse.json(
      { error: "The selected file is empty." },
      { status: 400 },
    );
  }

  if (file.size > MAX_MEDIA_FILE_SIZE) {
    return NextResponse.json(
      { error: "Maximum file size is 10 MB." },
      { status: 413 },
    );
  }

  if (!isAllowedMediaMimeType(file.type)) {
    return NextResponse.json(
      {
        error:
          "Unsupported image type. Allowed: JPEG, PNG, WebP, GIF and AVIF.",
      },
      { status: 415 },
    );
  }

  const extension = ALLOWED_MEDIA_MIME_TYPES.get(file.type)!;
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const filename = `${crypto.randomUUID()}.${extension}`;
  const relativePath = path.posix.join(year, month, filename);
  const root = getMediaStorageRoot();
  const targetDirectory = path.join(root, year, month);
  const targetPath = path.join(targetDirectory, filename);

  await mkdir(targetDirectory, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(targetPath, bytes, { flag: "wx" });

  const originalName = file.name.trim().slice(0, 255) || filename;
  const altText = cleanText(formData.get("altText"), 255) || null;
  const caption = cleanText(formData.get("caption"), 500) || null;
  const folder = cleanText(formData.get("folder"), 255) || null;
  const checksum = crypto
    .createHash("sha256")
    .update(bytes)
    .digest("hex");

  try {
    const media = await prisma.media.create({
      data: {
        uploadedById: user.id,
        type: "IMAGE",
        filename,
        originalName,
        path: relativePath,
        url: "pending",
        mimeType: file.type,
        extension,
        sizeBytes: BigInt(file.size),
        altText,
        caption,
        folder,
        checksum,
      },
    });

    const publicUrl = `/media/${media.id.toString()}`;

    const updated = await prisma.media.update({
      where: { id: media.id },
      data: { url: publicUrl },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "media.upload",
        entityType: "Media",
        entityId: updated.id.toString(),
        metadata: {
          originalName: updated.originalName,
          mimeType: updated.mimeType,
          sizeBytes: updated.sizeBytes.toString(),
        },
      },
    });

    return NextResponse.json({
      media: {
        id: updated.id.toString(),
        url: updated.url,
        originalName: updated.originalName,
        altText: updated.altText,
      },
    });
  } catch (error) {
    await unlink(targetPath).catch(() => undefined);
    throw error;
  }
}
