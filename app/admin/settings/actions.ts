"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeUrl(value: string) {
  if (!value) return "";

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error();
    }

    return url.toString();
  } catch {
    throw new Error(`Invalid URL: ${value}`);
  }
}

export async function saveSettingsAction(
  formData: FormData,
) {
  const actor = await requirePermission("roles.manage");

  const siteName = text(formData, "siteName");

  if (!siteName) {
    throw new Error("Site name is required.");
  }

  const values = [
    {
      key: "site.name",
      value: siteName,
      group: "general",
      isPublic: true,
    },
    {
      key: "site.description",
      value: text(formData, "siteDescription"),
      group: "general",
      isPublic: true,
    },
    {
      key: "site.url",
      value: normalizeUrl(text(formData, "siteUrl")),
      group: "general",
      isPublic: true,
    },
    {
      key: "contact.email",
      value: text(formData, "contactEmail"),
      group: "contact",
      isPublic: true,
    },
    {
      key: "contact.phone",
      value: text(formData, "contactPhone"),
      group: "contact",
      isPublic: true,
    },
    {
      key: "seo.defaultTitle",
      value:
        text(formData, "seoDefaultTitle") || siteName,
      group: "seo",
      isPublic: true,
    },
    {
      key: "seo.defaultDescription",
      value: text(formData, "seoDefaultDescription"),
      group: "seo",
      isPublic: true,
    },
    {
      key: "footer.text",
      value:
        text(formData, "footerText") ||
        "All rights reserved.",
      group: "footer",
      isPublic: true,
    },
    {
      key: "social.facebook",
      value: normalizeUrl(text(formData, "facebookUrl")),
      group: "social",
      isPublic: true,
    },
    {
      key: "social.instagram",
      value: normalizeUrl(text(formData, "instagramUrl")),
      group: "social",
      isPublic: true,
    },
    {
      key: "social.linkedin",
      value: normalizeUrl(text(formData, "linkedinUrl")),
      group: "social",
      isPublic: true,
    },
    {
      key: "social.x",
      value: normalizeUrl(text(formData, "xUrl")),
      group: "social",
      isPublic: true,
    },
    {
      key: "branding.logoMediaId",
      value: text(formData, "logoMediaId"),
      group: "branding",
      isPublic: true,
    },
    {
      key: "branding.faviconMediaId",
      value: text(formData, "faviconMediaId"),
      group: "branding",
      isPublic: true,
    },
  ];

  await prisma.$transaction(
    values.map((item) =>
      prisma.setting.upsert({
        where: {
          key: item.key,
        },
        update: {
          value: item.value,
          group: item.group,
          isPublic: item.isPublic,
        },
        create: item,
      }),
    ),
  );

  await prisma.activityLog.create({
    data: {
      userId: actor.id,
      action: "settings.update",
      entityType: "Setting",
      metadata: {
        keys: values.map((item) => item.key),
      },
    },
  });

  revalidateTag("site-settings", "max");
  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/posts");

  redirect("/admin/settings?saved=1");
}
