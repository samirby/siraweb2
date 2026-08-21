"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on" ? "true" : "false";
}

function text(formData: FormData, key: string, fallback = "", max = 500) {
  return String(formData.get(key) ?? "").trim().slice(0, max) || fallback;
}

function option(
  formData: FormData,
  key: string,
  allowed: string[],
  fallback: string,
) {
  const value = String(formData.get(key) ?? "");
  return allowed.includes(value) ? value : fallback;
}

export async function saveHomePostsSettings(formData: FormData) {
  await requirePermission("roles.manage");

  const rawCount = Number.parseInt(
    String(formData.get("count") ?? "4"),
    10,
  );

  const count = String(
    Math.min(
      12,
      Math.max(1, Number.isFinite(rawCount) ? rawCount : 4),
    ),
  );

  const values = {
    "homePosts.enabled": checkbox(formData, "enabled"),
    "homePosts.eyebrow": text(
      formData,
      "eyebrow",
      "Latest Articles",
      80,
    ),
    "homePosts.title": text(
      formData,
      "title",
      "Fresh software news and trends",
      160,
    ),
    "homePosts.subtitle": text(
      formData,
      "subtitle",
      "Explore the latest insights, updates, and best practices.",
      500,
    ),
    "homePosts.count": count,
    "homePosts.layout": option(
      formData,
      "layout",
      ["grid4", "grid2", "list"],
      "grid4",
    ),
    "homePosts.showExcerpt": checkbox(formData, "showExcerpt"),
    "homePosts.showCategory": checkbox(formData, "showCategory"),
    "homePosts.showAuthor": checkbox(formData, "showAuthor"),
    "homePosts.showDate": checkbox(formData, "showDate"),
    "homePosts.buttonText": text(
      formData,
      "buttonText",
      "View all articles",
      80,
    ),
  };

  await prisma.$transaction(
    Object.entries(values).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: {
          value,
          group: "homePosts",
          isPublic: true,
        },
        create: {
          key,
          value,
          group: "homePosts",
          isPublic: true,
        },
      }),
    ),
  );

  revalidateTag("site-settings", "max");
  revalidatePath("/");

  redirect("/admin/design/home-posts?saved=1");
}

export async function resetHomePostsSettings() {
  await requirePermission("roles.manage");

  await prisma.setting.deleteMany({
    where: {
      key: {
        startsWith: "homePosts.",
      },
    },
  });

  revalidateTag("site-settings", "max");
  revalidatePath("/");

  redirect("/admin/design/home-posts?reset=1");
}
