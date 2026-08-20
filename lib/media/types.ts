export const MAX_MEDIA_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_MEDIA_MIME_TYPES = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

export function isAllowedMediaMimeType(
  mimeType: string,
): mimeType is
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "image/avif" {
  return ALLOWED_MEDIA_MIME_TYPES.has(mimeType);
}
