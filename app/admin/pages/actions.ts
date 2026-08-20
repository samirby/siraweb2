"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";

const CONTENT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
const PAGE_TYPES = ["STANDARD", "ARTICLES", "LANDING", "SERVICE", "LEGAL"] as const;
const PAGE_TEMPLATES = [
  "DEFAULT",
  "ARTICLES_GRID",
  "ARTICLES_LIST",
  "ARTICLES_MAGAZINE",
  "LANDING_CLEAN",
  "SERVICE_MODERN",
  "LEGAL_DEFAULT",
] as const;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
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

async function uniqueSlug(base: string, currentId?: bigint) {
  const normalized = slugify(base) || "page";
  let candidate = normalized;
  let suffix = 2;

  while (true) {
    const existing = await prisma.page.findFirst({
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

function pageDataFromForm(formData: FormData) {
  const title = text(formData, "title");

  if (!title) {
    throw new Error("Page title is required.");
  }

  const rawSlug = text(formData, "slug") || title;
  const status = parseChoice(
    text(formData, "status"),
    CONTENT_STATUSES,
    "DRAFT",
  );
  const pageType = parseChoice(
    text(formData, "pageType"),
    PAGE_TYPES,
    "STANDARD",
  );
  const template = parseChoice(
    text(formData, "template"),
    PAGE_TEMPLATES,
    "DEFAULT",
  );

  return {
    title,
    rawSlug,
    status,
    pageType,
    template,
    excerpt: optionalText(formData, "excerpt"),
    content: optionalText(formData, "content"),
    seoTitle: optionalText(formData, "seoTitle"),
    seoDescription: optionalText(formData, "seoDescription"),
    canonicalUrl: optionalText(formData, "canonicalUrl"),
    noIndex: formData.get("noIndex") === "on",
  };
}

export async function createPageAction(formData: FormData) {
  const user = await requirePermission("pages.create");
  const data = pageDataFromForm(formData);
  const slug = await uniqueSlug(data.rawSlug);

  const page = await prisma.page.create({
    data: {
      authorId: user.id,
      title: data.title,
      slug,
      status: data.status,
      pageType: data.pageType,
      template: data.template,
      excerpt: data.excerpt,
      content: data.content,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      canonicalUrl: data.canonicalUrl,
      noIndex: data.noIndex,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "page.create",
      entityType: "Page",
      entityId: page.id.toString(),
      metadata: {
        title: page.title,
        slug: page.slug,
        status: page.status,
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/pages");
  redirect("/admin/pages?created=1");
}

export async function updatePageAction(formData: FormData) {
  const user = await requirePermission("pages.update");
  const id = BigInt(text(formData, "id"));
  const existing = await prisma.page.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      publishedAt: true,
    },
  });

  if (!existing) {
    throw new Error("Page not found.");
  }

  const data = pageDataFromForm(formData);
  const slug = await uniqueSlug(data.rawSlug, id);

  const page = await prisma.page.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      status: data.status,
      pageType: data.pageType,
      template: data.template,
      excerpt: data.excerpt,
      content: data.content,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      canonicalUrl: data.canonicalUrl,
      noIndex: data.noIndex,
      publishedAt:
        data.status === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : data.status === "DRAFT"
            ? null
            : existing.publishedAt,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "page.update",
      entityType: "Page",
      entityId: page.id.toString(),
      metadata: {
        title: page.title,
        slug: page.slug,
        status: page.status,
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${page.id.toString()}/edit`);
  redirect("/admin/pages?saved=1");
}

export async function deletePageAction(formData: FormData) {
  const user = await requirePermission("pages.delete");
  const id = BigInt(text(formData, "id"));

  const page = await prisma.page.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true },
  });

  if (!page) {
    redirect("/admin/pages");
  }

  await prisma.page.delete({
    where: { id },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "page.delete",
      entityType: "Page",
      entityId: id.toString(),
      metadata: {
        title: page.title,
        slug: page.slug,
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function togglePagePublishAction(formData: FormData) {
  const user = await requirePermission("pages.publish");
  const id = BigInt(text(formData, "id"));

  const page = await prisma.page.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      title: true,
      slug: true,
      publishedAt: true,
    },
  });

  if (!page) {
    throw new Error("Page not found.");
  }

  const publishing = page.status !== "PUBLISHED";

  const updated = await prisma.page.update({
    where: { id },
    data: {
      status: publishing ? "PUBLISHED" : "DRAFT",
      publishedAt: publishing ? page.publishedAt ?? new Date() : null,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: publishing ? "page.publish" : "page.unpublish",
      entityType: "Page",
      entityId: id.toString(),
      metadata: {
        title: updated.title,
        slug: updated.slug,
        status: updated.status,
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${id.toString()}/edit`);
}
