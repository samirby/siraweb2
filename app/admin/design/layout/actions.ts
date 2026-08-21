"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on" ? "true" : "false";
}

function pick(formData: FormData, key: string, allowed: string[], fallback: string) {
  const value = String(formData.get(key) ?? "");
  return allowed.includes(value) ? value : fallback;
}

export async function saveLayoutSettings(formData: FormData) {
  await requirePermission("roles.manage");

  const values = {
    "layout.showTrustStrip": checkbox(formData, "showTrustStrip"),
    "layout.showServices": checkbox(formData, "showServices"),
    "layout.showCategories": checkbox(formData, "showCategories"),
    "layout.showLatestPosts": checkbox(formData, "showLatestPosts"),
    "layout.showBottomCta": checkbox(formData, "showBottomCta"),
    "layout.heroStyle": pick(formData, "heroStyle", ["brand", "light", "minimal"], "brand"),
    "layout.cardStyle": pick(formData, "cardStyle", ["elevated", "flat", "bordered"], "elevated"),
  };

  await prisma.$transaction(
    Object.entries(values).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value, group: "layout", isPublic: true },
        create: { key, value, group: "layout", isPublic: true },
      }),
    ),
  );

  revalidateTag("site-settings", "max");
  revalidatePath("/");
  redirect("/admin/design/layout?saved=1");
}

export async function resetLayoutSettings() {
  await requirePermission("roles.manage");

  await prisma.setting.deleteMany({
    where: { key: { startsWith: "layout." } },
  });

  revalidateTag("site-settings", "max");
  revalidatePath("/");
  redirect("/admin/design/layout?reset=1");
}
