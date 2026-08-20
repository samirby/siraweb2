"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { sanitizeRichText } from "@/lib/content/sanitize-rich-text";

const CONTENT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
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

function parseStatus(value: string) {
  return CONTENT_STATUSES.includes(
    value as (typeof CONTENT_STATUSES)[number],
  )
    ? (value as (typeof CONTENT_STATUSES)[number])
    : "DRAFT";
}

async function uniqueSlug(base: string, currentId?: bigint) {
  const normalized = slugify(base) || "post";
  let candidate = normalized;
  let suffix = 2;

  while (true) {
    const existing = await prisma.post.findFirst({
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

function postDataFromForm(formData: FormData) {
  const title = text(formData, "title");

  if (!title) {
    throw new Error("Post title is required.");
  }

  return {
    title,
    rawSlug: text(formData, "slug") || title,
    status: parseStatus(text(formData, "status")),
    categoryId: optionalBigInt(formData, "categoryId"),
    excerpt: optionalText(formData, "excerpt"),
    content: (() => {
      const sanitized = sanitizeRichText(text(formData, "content"));
      return sanitized || null;
    })(),
    seoTitle: optionalText(formData, "seoTitle"),
    seoDescription: optionalText(formData, "seoDescription"),
    canonicalUrl: optionalText(formData, "canonicalUrl"),
    noIndex: formData.get("noIndex") === "on",
    featuredMediaId: optionalBigInt(formData, "featuredMediaId"),
    secondaryMediaId: optionalBigInt(formData, "secondaryMediaId"),
    galleryMediaIds: formData
      .getAll("galleryMediaIds")
      .map((value) => String(value).trim())
      .filter(Boolean)
      .map((value) => BigInt(value)),
  };
}

async function replaceGallery(
  postId: bigint,
  mediaIds: bigint[],
) {
  await prisma.postGalleryItem.deleteMany({
    where: { postId },
  });

  if (!mediaIds.length) {
    return;
  }

  await prisma.postGalleryItem.createMany({
    data: mediaIds.map((mediaId, index) => ({
      postId,
      mediaId,
      sortOrder: index,
    })),
  });
}

export async function createPostAction(formData: FormData) {
  const user = await requirePermission("posts.create");
  const data = postDataFromForm(formData);
  const slug = await uniqueSlug(data.rawSlug);

  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      categoryId: data.categoryId,
      title: data.title,
      slug,
      status: data.status,
      excerpt: data.excerpt,
      content: data.content,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      canonicalUrl: data.canonicalUrl,
      noIndex: data.noIndex,
      featuredMediaId: data.featuredMediaId,
      secondaryMediaId: data.secondaryMediaId,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  await replaceGallery(post.id, data.galleryMediaIds);

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "post.create",
      entityType: "Post",
      entityId: post.id.toString(),
      metadata: {
        title: post.title,
        slug: post.slug,
        status: post.status,
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  redirect("/admin/posts?created=1");
}

export async function updatePostAction(formData: FormData) {
  const user = await requirePermission("posts.update");
  const id = BigInt(text(formData, "id"));

  const existing = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      publishedAt: true,
    },
  });

  if (!existing) {
    throw new Error("Post not found.");
  }

  const data = postDataFromForm(formData);
  const slug = await uniqueSlug(data.rawSlug, id);

  const post = await prisma.post.update({
    where: { id },
    data: {
      categoryId: data.categoryId,
      title: data.title,
      slug,
      status: data.status,
      excerpt: data.excerpt,
      content: data.content,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      canonicalUrl: data.canonicalUrl,
      noIndex: data.noIndex,
      featuredMediaId: data.featuredMediaId,
      secondaryMediaId: data.secondaryMediaId,
      publishedAt:
        data.status === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : data.status === "DRAFT"
            ? null
            : existing.publishedAt,
    },
  });

  await replaceGallery(id, data.galleryMediaIds);

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "post.update",
      entityType: "Post",
      entityId: post.id.toString(),
      metadata: {
        title: post.title,
        slug: post.slug,
        status: post.status,
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${id.toString()}/edit`);
  revalidatePath(`/posts/${post.slug}`);
  redirect("/admin/posts?saved=1");
}

export async function deletePostAction(formData: FormData) {
  const user = await requirePermission("posts.delete");
  const id = BigInt(text(formData, "id"));

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  if (!post) {
    redirect("/admin/posts");
  }

  await prisma.postGalleryItem.deleteMany({
    where: { postId: id },
  });

  await prisma.post.delete({
    where: { id },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: "post.delete",
      entityType: "Post",
      entityId: id.toString(),
      metadata: {
        title: post.title,
        slug: post.slug,
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath(`/posts/${post.slug}`);
  redirect("/admin/posts?deleted=1");
}

export async function togglePostPublishAction(formData: FormData) {
  const user = await requirePermission("posts.publish");
  const id = BigInt(text(formData, "id"));

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
    },
  });

  if (!post) {
    throw new Error("Post not found.");
  }

  const publishing = post.status !== "PUBLISHED";

  const updated = await prisma.post.update({
    where: { id },
    data: {
      status: publishing ? "PUBLISHED" : "DRAFT",
      publishedAt: publishing
        ? post.publishedAt ?? new Date()
        : null,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: publishing ? "post.publish" : "post.unpublish",
      entityType: "Post",
      entityId: id.toString(),
      metadata: {
        title: updated.title,
        slug: updated.slug,
        status: updated.status,
      },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath(`/posts/${updated.slug}`);
}
