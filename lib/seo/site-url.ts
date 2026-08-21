import { getSiteSettings } from "@/lib/settings/site-settings";

export async function getSiteBaseUrl() {
  const settings = await getSiteSettings();

  const raw =
    settings.siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "";

  if (!raw) return null;

  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}
