"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on" ? "true" : "false";
}

function text(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? "").trim().slice(0, 1000) || fallback;
}

function option(formData: FormData, key: string, allowed: string[], fallback: string) {
  const value = String(formData.get(key) ?? "");
  return allowed.includes(value) ? value : fallback;
}

export async function saveFooterSettings(formData: FormData) {
  await requirePermission("roles.manage");

  const values = {
    "footer.style": option(formData, "footerStyle", ["burgundy", "dark", "light", "minimal"], "burgundy"),
    "footer.showBrand": checkbox(formData, "showBrand"),
    "footer.showQuickLinks": checkbox(formData, "showQuickLinks"),
    "footer.showSocials": checkbox(formData, "showSocials"),
    "footer.showOffice": checkbox(formData, "showOffice"),
    "footer.showEmail": checkbox(formData, "showEmail"),
    "footer.showCopyright": checkbox(formData, "showCopyright"),
    "footer.brandText": text(formData, "brandText"),
    "footer.officeTitle": text(formData, "officeTitle", "Office"),
    "footer.officeAddress": text(formData, "officeAddress"),
    "footer.copyrightText": text(formData, "copyrightText"),
    "footer.creditText": text(formData, "creditText"),
    "footer.creditUrl": text(formData, "creditUrl"),
  };

  await prisma.$transaction(
    Object.entries(values).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value, group: "footer", isPublic: true },
        create: { key, value, group: "footer", isPublic: true },
      }),
    ),
  );

  revalidateTag("site-settings", "max");
  revalidatePath("/");
  redirect("/admin/design/footer?saved=1");
}

export async function resetFooterSettings() {
  await requirePermission("roles.manage");

  await prisma.setting.deleteMany({
    where: { key: { startsWith: "footer." } },
  });

  revalidateTag("site-settings", "max");
  revalidatePath("/");
  redirect("/admin/design/footer?reset=1");
}
