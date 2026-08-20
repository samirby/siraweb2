import path from "node:path";

export function getMediaStorageRoot() {
  const configured = process.env.MEDIA_STORAGE_ROOT?.trim();

  if (configured) {
    return path.resolve(configured);
  }

  if (process.env.NODE_ENV !== "production") {
    return path.resolve(process.cwd(), ".media-storage");
  }

  throw new Error(
    "MEDIA_STORAGE_ROOT is missing. Configure a persistent Hostinger directory before uploading media.",
  );
}

export function normalizeMediaFolder(value: string | null | undefined) {
  const raw = (value ?? "").trim();

  if (!raw) {
    return "misc";
  }

  const segments = raw
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) =>
      segment
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60),
    )
    .filter(Boolean)
    .slice(0, 4);

  return segments.length ? segments.join("/") : "misc";
}

export function buildMediaRelativePath({
  folder,
  filename,
  date = new Date(),
}: {
  folder?: string | null;
  filename: string;
  date?: Date;
}) {
  const normalizedFolder = normalizeMediaFolder(folder);
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  return path.posix.join(
    normalizedFolder,
    year,
    month,
    filename,
  );
}

export function resolveMediaPath(relativePath: string) {
  const root = getMediaStorageRoot();
  const absolute = path.resolve(root, relativePath);

  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
    throw new Error("Invalid media path.");
  }

  return absolute;
}
