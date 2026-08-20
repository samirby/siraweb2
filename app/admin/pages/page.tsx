import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import {
  deletePageAction,
  togglePagePublishAction,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function PagesAdminPage() {
  await requirePermission("pages.view");

  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    take: 100,
  });

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">Content</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
            Pages
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Create, edit, publish and manage website pages.
          </p>
        </div>

        <Link
          href="/admin/pages/new"
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          New page
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {pages.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Author</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {pages.map((page) => (
                  <tr key={page.id.toString()} className="hover:bg-zinc-50">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/pages/${page.id.toString()}/edit`}
                        className="font-semibold text-zinc-950 hover:underline"
                      >
                        {page.title}
                      </Link>
                      <div className="mt-0.5 text-xs text-zinc-500">
                        /{page.slug}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {page.pageType}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          page.status === "PUBLISHED"
                            ? "bg-emerald-50 text-emerald-700"
                            : page.status === "ARCHIVED"
                              ? "bg-zinc-200 text-zinc-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {page.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-zinc-600">
                      {page.author.name}
                    </td>

                    <td className="px-5 py-4 text-zinc-500">
                      {page.updatedAt.toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {page.status === "PUBLISHED" ? (
                          <Link
                            href={`/${page.slug}`}
                            target="_blank"
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                          >
                            View
                          </Link>
                        ) : null}

                        <Link
                          href={`/admin/pages/${page.id.toString()}/edit`}
                          className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                        >
                          Edit
                        </Link>

                        <form action={togglePagePublishAction}>
                          <input
                            type="hidden"
                            name="id"
                            value={page.id.toString()}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700"
                          >
                            {page.status === "PUBLISHED"
                              ? "Unpublish"
                              : "Publish"}
                          </button>
                        </form>

                        <form action={deletePageAction}>
                          <input
                            type="hidden"
                            name="id"
                            value={page.id.toString()}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <h2 className="text-lg font-bold text-zinc-950">
              No pages yet
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Create the first page for your website.
            </p>
            <Link
              href="/admin/pages/new"
              className="mt-5 inline-flex rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Create first page
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
