"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";

const HEX = /^#[0-9a-fA-F]{6}$/;

function value(formData: FormData, key: string, fallback: string) {
  return String(formData.get(key) ?? "").trim() || fallback;
}

function safeColor(input: string, fallback: string) {
  return HEX.test(input) ? input : fallback;
}

export async function saveDesignSettings(formData: FormData) {
  await requirePermission("roles.manage");

  const values = {
    "design.primaryColor": safeColor(value(formData, "primaryColor", "#09090b"), "#09090b"),
    "design.secondaryColor": safeColor(value(formData, "secondaryColor", "#52525b"), "#52525b"),
    "design.backgroundColor": safeColor(value(formData, "backgroundColor", "#ffffff"), "#ffffff"),
    "design.textColor": safeColor(value(formData, "textColor", "#18181b"), "#18181b"),
    "design.headingFont": value(formData, "headingFont", "Arial").slice(0, 100),
    "design.bodyFont": value(formData, "bodyFont", "Arial").slice(0, 100),
    "design.borderRadius": value(formData, "borderRadius", "16px").slice(0, 20),
    "design.containerWidth": value(formData, "containerWidth", "1280px").slice(0, 20),
  };

  await prisma.$transaction(
    Object.entries(values).map(([key, settingValue]) =>
      prisma.setting.upsert({
        where: { key },
        update: {
          value: settingValue,
          group: "design",
          isPublic: true,
        },
        create: {
          key,
          value: settingValue,
          group: "design",
          isPublic: true,
        },
      }),
    ),
  );

  revalidateTag("site-settings", "max");
  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/contact");

  redirect("/admin/design?saved=1");
}

export async function resetDesignSettings() {
  await requirePermission("roles.manage");

  await prisma.setting.deleteMany({
    where: {
      key: { startsWith: "design." },
    },
  });

  revalidateTag("site-settings", "max");
  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/contact");

  redirect("/admin/design?reset=1");
}
