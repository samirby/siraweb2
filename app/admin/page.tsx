import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

function statusClass(status: string) {
  if (status === "PUBLISHED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "ARCHIVED") {
    return "bg-zinc-100 text-zinc-600";
  }

  return "bg-amber-50 text-amber-700";
}

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    "page.create": "created a page",
    "page.update": "updated a page",
    "page.delete": "deleted a page",
    "page.publish": "changed page status",
    "post.create": "created a post",
    "post.update": "updated a post",
    "post.delete": "deleted a post",
    "post.publish": "changed post status",
    "media.upload": "uploaded media",
    "media.update": "updated media",
    "media.delete": "deleted media",
    "media.move": "moved media",
    "menu.create": "created a menu",
    "menu.update": "updated a menu",
    "menu.delete": "deleted a menu",
    "user.create": "created a user",
    "user.update": "updated a user",
    "user.status": "changed user status",
    "role.create": "created a role",
    "role.update": "updated a role",
    "role.delete": "deleted a role",
    "category.create": "created a category",
    "category.update": "updated a category",
    "category.delete": "deleted a category",
    "tag.create": "created a tag",
    "tag.update": "updated a tag",
    "tag.delete": "deleted a tag",
    "settings.update": "updated settings",
    "permissions.bootstrap": "initialized permissions",
  };

  return labels[action] ?? action.replaceAll(".", " ");
}

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const currentUser = await prisma.user.findUnique({
    where: {
      email: session.user.email.toLowerCase(),
    },
    select: {
      id: true,
      name: true,
      role: {
        select: {
          permissions: {
            select: {
              permission: {
                select: {
                  key: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!currentUser) {
    redirect("/admin/login");
  }

  const permissions = new Set(
    currentUser.role.permissions.map(
      (item) => item.permission.key,
    ),
  );

  const canViewPages = permissions.has("pages.view");
  const canCreatePages = permissions.has("pages.create");
  const canUpdatePages = permissions.has("pages.update");

  const canViewPosts = permissions.has("posts.view");
  const canCreatePosts = permissions.has("posts.create");
  const canUpdatePosts = permissions.has("posts.update");

  const canViewMedia = permissions.has("media.view");
  const canUploadMedia = permissions.has("media.upload");
  const canManageUsers = permissions.has("users.manage");

  const [
    totalPages,
    publishedPages,
    draftPages,
    totalPosts,
    publishedPosts,
    draftPosts,
    totalMedia,
    newMessages,
    totalUsers,
    recentPosts,
    recentPages,
    recentActivity,
  ] = await Promise.all([
    canViewPages ? prisma.page.count() : Promise.resolve(0),
    canViewPages
      ? prisma.page.count({
          where: { status: "PUBLISHED" },
        })
      : Promise.resolve(0),
    canViewPages
      ? prisma.page.count({
          where: { status: "DRAFT" },
        })
      : Promise.resolve(0),

    canViewPosts ? prisma.post.count() : Promise.resolve(0),
    canViewPosts
      ? prisma.post.count({
          where: { status: "PUBLISHED" },
        })
      : Promise.resolve(0),
    canViewPosts
      ? prisma.post.count({
          where: { status: "DRAFT" },
        })
      : Promise.resolve(0),

    canViewMedia
      ? prisma.media.count()
      : Promise.resolve(0),

    prisma.contactMessage.count({
      where: { status: "NEW" },
    }),

    canManageUsers
      ? prisma.user.count()
      : Promise.resolve(0),

    canViewPosts
      ? prisma.post.findMany({
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
            author: {
              select: {
                name: true,
              },
            },
          },
        })
      : Promise.resolve([]),

    canViewPages
      ? prisma.page.findMany({
          orderBy: { updatedAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            status: true,
            updatedAt: true,
            author: {
              select: {
                name: true,
              },
            },
          },
        })
      : Promise.resolve([]),

    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        action: true,
        entityType: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    }),
  ]);

  const cards = [
    ...(canViewPages
      ? [
          {
            label: "Pages",
            value: totalPages,
            note: `${publishedPages} published · ${draftPages} drafts`,
            href: "/admin/pages",
          },
        ]
      : []),

    ...(canViewPosts
      ? [
          {
            label: "Posts",
            value: totalPosts,
            note: `${publishedPosts} published · ${draftPosts} drafts`,
            href: "/admin/posts",
          },
        ]
      : []),

    ...(canViewMedia
      ? [
          {
            label: "Media",
            value: totalMedia,
            note: "library items",
            href: "/admin/media",
          },
        ]
      : []),

    {
      label: "New messages",
      value: newMessages,
      note: "unread contact messages",
      href: "/admin/messages",
    },

    ...(canManageUsers
      ? [
          {
            label: "Users",
            value: totalUsers,
            note: "CMS accounts",
            href: "/admin/users",
          },
        ]
      : []),
  ];

  const quickActions = [
    ...(canCreatePosts
      ? [
          {
            label: "New post",
            href: "/admin/posts/new",
            note: "Write a new article",
          },
        ]
      : []),

    ...(canCreatePages
      ? [
          {
            label: "New page",
            href: "/admin/pages/new",
            note: "Create a public page",
          },
        ]
      : []),

    ...(canUploadMedia
      ? [
          {
            label: "Upload media",
            href: "/admin/media",
            note: "Add images to the library",
          },
        ]
      : []),

    ...(canManageUsers
      ? [
          {
            label: "New user",
            href: "/admin/users/new",
            note: "Create a CMS account",
          },
        ]
      : []),
  ];

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-zinc-500">
          Overview
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
          Dashboard
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Welcome back, {currentUser.name}. Here is the latest activity across SIRA Web.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              {card.label}
            </p>

            <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
              {card.value}
            </p>

            <p className="mt-1.5 text-xs text-zinc-500">
              {card.note}
            </p>
          </Link>
        ))}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {quickActions.length ? (
            <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-zinc-950">
                  Quick actions
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Jump directly to common tasks.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 transition hover:border-zinc-300 hover:bg-white"
                  >
                    <p className="text-sm font-bold text-zinc-950">
                      {action.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      {action.note}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            {canViewPosts ? (
              <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
                  <div>
                    <h2 className="font-bold text-zinc-950">
                      Recent posts
                    </h2>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      Recently updated articles
                    </p>
                  </div>

                  <Link
                    href="/admin/posts"
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-950"
                  >
                    View all
                  </Link>
                </div>

                <div className="divide-y divide-zinc-100">
                  {recentPosts.length ? (
                    recentPosts.map((post) => (
                      <Link
                        key={post.id.toString()}
                        href={
                          canUpdatePosts
                            ? `/admin/posts/${post.id.toString()}/edit`
                            : "/admin/posts"
                        }
                        className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-zinc-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-900">
                            {post.title}
                          </p>

                          <p className="mt-1 text-xs text-zinc-400">
                            {post.author.name} ·{" "}
                            {post.updatedAt.toLocaleDateString()}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusClass(
                            post.status,
                          )}`}
                        >
                          {post.status}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-5 py-8 text-center text-sm text-zinc-400">
                      No posts yet.
                    </div>
                  )}
                </div>
              </section>
            ) : null}

            {canViewPages ? (
              <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
                  <div>
                    <h2 className="font-bold text-zinc-950">
                      Recent pages
                    </h2>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      Recently updated pages
                    </p>
                  </div>

                  <Link
                    href="/admin/pages"
                    className="text-xs font-semibold text-zinc-500 hover:text-zinc-950"
                  >
                    View all
                  </Link>
                </div>

                <div className="divide-y divide-zinc-100">
                  {recentPages.length ? (
                    recentPages.map((page) => (
                      <Link
                        key={page.id.toString()}
                        href={
                          canUpdatePages
                            ? `/admin/pages/${page.id.toString()}/edit`
                            : "/admin/pages"
                        }
                        className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-zinc-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-zinc-900">
                            {page.title}
                          </p>

                          <p className="mt-1 text-xs text-zinc-400">
                            {page.author.name} ·{" "}
                            {page.updatedAt.toLocaleDateString()}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${statusClass(
                            page.status,
                          )}`}
                        >
                          {page.status}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-5 py-8 text-center text-sm text-zinc-400">
                      No pages yet.
                    </div>
                  )}
                </div>
              </section>
            ) : null}
          </div>
        </div>

        <aside className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="font-bold text-zinc-950">
              Recent activity
            </h2>

            <p className="mt-0.5 text-xs text-zinc-500">
              Latest changes across the CMS
            </p>
          </div>

          <div className="divide-y divide-zinc-100">
            {recentActivity.length ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id.toString()}
                  className="px-5 py-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-zinc-300" />

                    <div className="min-w-0">
                      <p className="text-sm text-zinc-700">
                        <span className="font-semibold text-zinc-950">
                          {activity.user?.name ?? "System"}
                        </span>{" "}
                        {actionLabel(activity.action)}
                      </p>

                      <p className="mt-1 text-xs text-zinc-400">
                        {activity.entityType
                          ? `${activity.entityType} · `
                          : ""}
                        {activity.createdAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-10 text-center text-sm text-zinc-400">
                No activity yet.
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
