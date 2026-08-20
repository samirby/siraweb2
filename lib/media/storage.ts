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

export function resolveMediaPath(relativePath: string) {
  const root = getMediaStorageRoot();
  const absolute = path.resolve(root, relativePath);

  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
    throw new Error("Invalid media path.");
  }

  return absolute;
}
