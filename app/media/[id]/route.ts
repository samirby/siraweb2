import { readFile } from "node:fs/promises";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { resolveMediaPath } from "@/lib/media/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: Props,
) {
  const { id: rawId } = await params;

  let id: bigint;

  try {
    id = BigInt(rawId);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  const media = await prisma.media.findUnique({
    where: { id },
    select: {
      path: true,
      mimeType: true,
      originalName: true,
      checksum: true,
    },
  });

  if (!media) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const file = await readFile(resolveMediaPath(media.path));

    return new NextResponse(file, {
      headers: {
        "Content-Type": media.mimeType,
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(
          media.originalName,
        )}`,
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: media.checksum ? `"${media.checksum}"` : "",
      },
    });
  } catch {
    return new NextResponse("Media file not found", {
      status: 404,
    });
  }
}
