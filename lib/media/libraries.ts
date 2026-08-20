import { prisma } from "@/lib/db/prisma";
import { normalizeMediaFolder } from "@/lib/media/storage";

const DEFAULT_LIBRARIES = [
  "pages",
  "posts",
  "gallery",
  "branding",
  "users",
  "misc",
];

function normalizeLibraryList(value: unknown) {
  if (!Array.isArray(value)) return DEFAULT_LIBRARIES;

  const result = Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => normalizeMediaFolder(item))
        .filter(Boolean),
    ),
  );

  return result.length ? result : DEFAULT_LIBRARIES;
}

export async function getMediaLibraries() {
  const setting = await prisma.setting.findUnique({
    where: { key: "media.libraries" },
  });

  return normalizeLibraryList(setting?.value);
}

export async function saveMediaLibraries(libraries: string[]) {
  const normalized = normalizeLibraryList(libraries);

  await prisma.setting.upsert({
    where: { key: "media.libraries" },
    update: {
      value: normalized,
      group: "media",
      isPublic: false,
    },
    create: {
      key: "media.libraries",
      value: normalized,
      group: "media",
      isPublic: false,
    },
  });

  return normalized;
}
