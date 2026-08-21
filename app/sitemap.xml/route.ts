import { prisma } from "@/lib/db/prisma";
import { getSiteBaseUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function urlNode(
  loc: string,
  lastmod?: Date,
  changefreq?: string,
  priority?: number,
) {
  return [
    "  <url>",
    `    <loc>${esc(loc)}</loc>`,
    lastmod ? `    <lastmod>${lastmod.toISOString()}</lastmod>` : "",
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : "",
    priority != null ? `    <priority>${priority.toFixed(1)}</priority>` : "",
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function GET() {
  const base = await getSiteBaseUrl();

  if (!base) {
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n',
      {
        status: 200,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      },
    );
  }

  const now = new Date();

  try {
    const [pages, posts, categories, tags] = await Promise.all([
      prisma.page.findMany({
        where: {
          status: "PUBLISHED",
          noIndex: false,
          OR: [
            { publishedAt: null },
            { publishedAt: { lte: now } },
          ],
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),

      prisma.post.findMany({
        where: {
          status: "PUBLISHED",
          noIndex: false,
          OR: [
            { publishedAt: null },
            { publishedAt: { lte: now } },
          ],
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),

      prisma.category.findMany({
        select: {
          slug: true,
          updatedAt: true,
        },
      }),

      prisma.tag.findMany({
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
    ]);

    const nodes = [
      urlNode(`${base}/`, now, "weekly", 1.0),
      urlNode(`${base}/posts`, now, "daily", 0.9),

      ...pages.map((page) =>
        urlNode(
          `${base}/${page.slug}`,
          page.updatedAt,
          "weekly",
          0.8,
        ),
      ),

      ...posts.map((post) =>
        urlNode(
          `${base}/posts/${post.slug}`,
          post.updatedAt,
          "weekly",
          0.8,
        ),
      ),

      ...categories.map((category) =>
        urlNode(
          `${base}/category/${category.slug}`,
          category.updatedAt,
          "weekly",
          0.6,
        ),
      ),

      ...tags.map((tag) =>
        urlNode(
          `${base}/tag/${tag.slug}`,
          tag.updatedAt,
          "weekly",
          0.5,
        ),
      ),
    ];

    const xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      nodes.join("\n") +
      "\n</urlset>\n";

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Could not build sitemap from database.", error);

    const fallback =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urlNode(`${base}/`, now, "weekly", 1.0) +
      "\n" +
      urlNode(`${base}/posts`, now, "daily", 0.9) +
      "\n</urlset>\n";

    return new Response(fallback, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }
}
