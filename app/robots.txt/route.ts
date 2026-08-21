import { getSiteBaseUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = await getSiteBaseUrl();

  const lines = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin/",
    "Disallow: /api/",
    ...(base ? [`Sitemap: ${base}/sitemap.xml`] : []),
    ...(base ? [`Host: ${base}`] : []),
    "",
  ];

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
    },
  });
}
