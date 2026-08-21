"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";

const MENU_LOCATIONS = ["TOP", "FOOTER", "SECONDARY"] as const;
const MENU_ITEM_TYPES = ["PAGE", "CATEGORY", "CUSTOM_LINK"] as const;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalBigInt(formData: FormData, key: string) {
  const value = text(formData, key);
  return value ? BigInt(value) : null;
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 191);
}

function parseChoice<T extends readonly string[]>(
  value: string,
  allowed: T,
  fallback: T[number],
): T[number] {
  return allowed.includes(value as T[number])
    ? (value as T[number])
    : fallback;
}

async function uniqueMenuSlug(base: string, currentId?: bigint) {
  const normalized = slugify(base) || "menu";
  let candidate = normalized;
  let suffix = 2;

  while (true) {
    const existing = await prisma.menu.findFirst({
      where: {
        slug: candidate,
        ...(currentId ? { id: { not: currentId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) return candidate;

    candidate = `${normalized.slice(0, 180)}-${suffix}`;
    suffix += 1;
  }
}

function parseLocation(value: string) {
  if (!value) return null;

  return MENU_LOCATIONS.includes(
    value as (typeof MENU_LOCATIONS)[number],
  )
    ? (value as (typeof MENU_LOCATIONS)[number])
    : null;
}

export async function createMenuAction(formData: FormData) {
  const user = await requirePermission("menus.manage");

  const name = text(formData, "name");
  if (!name) throw new Error("Menu name is required.");

  const slug = await uniqueMenuSlug(text(formData, "slug") || name);
  const location = parseLocation(text(formData, "location"));

  const menu = await prisma.menu.create({
    data: {
      name,
      slug,
      location,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "menu.create",
      entityType: "Menu",
      entityId: menu.id.toString(),
      metadata: {
        name: menu.name,
        slug: menu.slug,
        location: menu.location,
      },
    },
  });

  revalidatePath("/admin/menus");
  redirect(`/admin/menus/${menu.id.toString()}/edit`);
}

export async function updateMenuAction(formData: FormData) {
  const user = await requirePermission("menus.manage");

  const id = BigInt(text(formData, "id"));
  const name = text(formData, "name");
  if (!name) throw new Error("Menu name is required.");

  const slug = await uniqueMenuSlug(text(formData, "slug") || name, id);
  const location = parseLocation(text(formData, "location"));

  const menu = await prisma.menu.update({
    where: { id },
    data: {
      name,
      slug,
      location,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "menu.update",
      entityType: "Menu",
      entityId: id.toString(),
      metadata: {
        name: menu.name,
        slug: menu.slug,
        location: menu.location,
      },
    },
  });

  revalidatePath("/admin/menus");
  revalidatePath(`/admin/menus/${id.toString()}/edit`);
  revalidateTag("public-menus", "max");
  revalidatePath("/");
  redirect(`/admin/menus/${id.toString()}/edit?saved=1`);
}

export async function deleteMenuAction(formData: FormData) {
  const user = await requirePermission("menus.manage");
  const id = BigInt(text(formData, "id"));

  const menu = await prisma.menu.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!menu) redirect("/admin/menus");

  await prisma.menu.delete({
    where: { id },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "menu.delete",
      entityType: "Menu",
      entityId: id.toString(),
      metadata: {
        name: menu.name,
        slug: menu.slug,
      },
    },
  });

  revalidatePath("/admin/menus");
  revalidateTag("public-menus", "max");
  revalidatePath("/");
  redirect("/admin/menus");
}

function getMenuItemData(formData: FormData) {
  const type = parseChoice(
    text(formData, "type"),
    MENU_ITEM_TYPES,
    "CUSTOM_LINK",
  );

  const label = text(formData, "label");
  if (!label) throw new Error("Menu item label is required.");

  const pageId =
    type === "PAGE"
      ? optionalBigInt(formData, "pageId")
      : null;

  const categoryId =
    type === "CATEGORY"
      ? optionalBigInt(formData, "categoryId")
      : null;

  const url =
    type === "CUSTOM_LINK"
      ? text(formData, "url") || "#"
      : null;

  return {
    type,
    label,
    pageId,
    categoryId,
    url,
    parentId: optionalBigInt(formData, "parentId"),
    sortOrder: Number.parseInt(text(formData, "sortOrder") || "0", 10) || 0,
    openInNewTab: formData.get("openInNewTab") === "on",
    isEnabled: formData.get("isEnabled") === "on",
  };
}

export async function addMenuItemAction(formData: FormData) {
  const user = await requirePermission("menus.manage");
  const menuId = BigInt(text(formData, "menuId"));
  const itemData = getMenuItemData(formData);

  const item = await prisma.menuItem.create({
    data: {
      menuId,
      ...itemData,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "menu_item.create",
      entityType: "MenuItem",
      entityId: item.id.toString(),
      metadata: {
        menuId: menuId.toString(),
        label: item.label,
        type: item.type,
      },
    },
  });

  revalidatePath("/admin/menus");
  revalidatePath(`/admin/menus/${menuId.toString()}/edit`);
  revalidateTag("public-menus", "max");
  revalidatePath("/");
  redirect(`/admin/menus/${menuId.toString()}/edit?itemAdded=1`);
}

export async function updateMenuItemAction(formData: FormData) {
  const user = await requirePermission("menus.manage");

  const id = BigInt(text(formData, "id"));
  const menuId = BigInt(text(formData, "menuId"));
  const itemData = getMenuItemData(formData);

  if (itemData.parentId === id) {
    throw new Error("A menu item cannot be its own parent.");
  }

  const item = await prisma.menuItem.update({
    where: { id },
    data: itemData,
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "menu_item.update",
      entityType: "MenuItem",
      entityId: id.toString(),
      metadata: {
        menuId: menuId.toString(),
        label: item.label,
        type: item.type,
      },
    },
  });

  revalidatePath("/admin/menus");
  revalidatePath(`/admin/menus/${menuId.toString()}/edit`);
  revalidateTag("public-menus", "max");
  revalidatePath("/");
  redirect(`/admin/menus/${menuId.toString()}/edit?itemSaved=1`);
}

export async function deleteMenuItemAction(formData: FormData) {
  const user = await requirePermission("menus.manage");

  const id = BigInt(text(formData, "id"));
  const menuId = BigInt(text(formData, "menuId"));

  const item = await prisma.menuItem.findUnique({
    where: { id },
    select: {
      id: true,
      label: true,
    },
  });

  if (item) {
    await prisma.menuItem.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "menu_item.delete",
        entityType: "MenuItem",
        entityId: id.toString(),
        metadata: {
          menuId: menuId.toString(),
          label: item.label,
        },
      },
    });
  }

  revalidatePath("/admin/menus");
  revalidatePath(`/admin/menus/${menuId.toString()}/edit`);
  revalidateTag("public-menus", "max");
  revalidatePath("/");
  redirect(`/admin/menus/${menuId.toString()}/edit`);
}
