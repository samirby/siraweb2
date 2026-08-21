import type { MetadataRoute } from "next";

import { prisma } from "@/lib/db/prisma";
import { getSiteBaseUrl } from "@/lib/seo/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getSiteBaseUrl();

  if (!base) {
    return [];
  }

  const now = new Date();

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

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/posts`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...pages.map((page) => ({
      url: `${base}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: `${base}/posts/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: `${base}/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...tags.map((tag) => ({
      url: `${base}/tag/${tag.slug}`,
      lastModified: tag.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
