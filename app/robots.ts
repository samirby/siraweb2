import type { MetadataRoute } from "next";

import { getSiteBaseUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = await getSiteBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
      ],
    },
    sitemap: base ? `${base}/sitemap.xml` : undefined,
    host: base ?? undefined,
  };
}
