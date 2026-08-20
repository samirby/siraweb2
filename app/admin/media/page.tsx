import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getMediaLibraries } from "@/lib/media/libraries";
import { normalizeMediaFolder } from "@/lib/media/storage";
import {
  createLibraryAction,
  deleteLibraryAction,
  deleteMediaAction,
  moveMediaAction,
  renameLibraryAction,
  updateMediaAction,
} from "./actions";
import { MediaUploader } from "./_components/media-uploader";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    library?: string;
    q?: string;
    saved?: string;
    deleted?: string;
    moved?: string;
    inUse?: string;
    libraryNotEmpty?: string;
  }>;
};

function formatBytes(value: bigint) {
  const size = Number(value);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default async function MediaAdminPage({
  searchParams,
}: Props) {
  await requirePermission("media.view");

  const query = await searchParams;
  const libraries = await getMediaLibraries();
  const selectedLibrary = query.library
    ? normalizeMediaFolder(query.library)
    : "all";

  const q = query.q?.trim() ?? "";

  const [countsRaw, totalFiles, totalSizeResult, media] =
    await Promise.all([
      prisma.media.groupBy({
        by: ["folder"],
        _count: { _all: true },
      }),

      prisma.media.count(),

      prisma.media.aggregate({
        _sum: {
          sizeBytes: true,
        },
      }),

      prisma.media.findMany({
        where: {
          ...(selectedLibrary !== "all"
            ? { folder: selectedLibrary }
            : {}),

          ...(q
            ? {
                OR: [
                  {
                    originalName: {
                      contains: q,
                    },
                  },
                  {
                    altText: {
                      contains: q,
                    },
                  },
                  {
                    caption: {
                      contains: q,
                    },
                  },
                ],
              }
            : {}),
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          _count: {
            select: {
              userAvatars: true,
              pageFeatured: true,
              postFeatured: true,
              postSecondary: true,
              postGalleryItems: true,
            },
          },
        },

        take: 200,
      }),
    ]);

  const counts = new Map(
    countsRaw.map((entry) => [
      normalizeMediaFolder(entry.folder),
      entry._count._all,
    ]),
  );

  const currentCount =
    selectedLibrary === "all"
      ? totalFiles
      : counts.get(selectedLibrary) ?? 0;

  const currentLibraryLabel =
    selectedLibrary === "all"
      ? "All Media"
      : selectedLibrary;

  return (
    <main className="px-3 py-5 sm:px-5 sm:py-6 lg:px-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-zinc-500">
            Library
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
            Media Library
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Organize and reuse images across your site.
          </p>
        </div>

        <details className="relative">
          <summary className="cursor-pointer list-none rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white">
            + New Library
          </summary>

          <form
            action={createLibraryAction}
            className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl"
          >
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Library name
              </span>
              <input
                name="library"
                required
                placeholder="e.g. products"
                className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
              />
            </label>

            <button
              type="submit"
              className="mt-3 w-full rounded-lg bg-zinc-950 px-3 py-2.5 text-sm font-semibold text-white"
            >
              Create Library
            </button>
          </form>
        </details>
      </div>

      {query.saved === "1" ||
      query.deleted === "1" ||
      query.moved === "1" ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Changes saved successfully.
        </div>
      ) : null}

      {query.inUse === "1" ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          This image is currently used by content and cannot be deleted.
        </div>
      ) : null}

      {query.libraryNotEmpty === "1" ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Move or delete all files before deleting this library.
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
            <div className="px-2 pb-2 pt-1 text-sm font-bold text-zinc-950">
              Libraries
            </div>

            <nav className="space-y-1">
              <Link
                href="/admin/media"
                className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm ${
                  selectedLibrary === "all"
                    ? "bg-zinc-100 font-semibold text-zinc-950"
                    : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                <span>▧ All Media</span>
                <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs">
                  {totalFiles}
                </span>
              </Link>

              {libraries.map((library) => (
                <Link
                  key={library}
                  href={`/admin/media?library=${encodeURIComponent(
                    library,
                  )}`}
                  className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm ${
                    selectedLibrary === library
                      ? "bg-zinc-100 font-semibold text-zinc-950"
                      : "text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  <span className="truncate">▢ {library}</span>
                  <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-xs">
                    {counts.get(library) ?? 0}
                  </span>
                </Link>
              ))}
            </nav>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-950">
              Storage
            </h2>
            <p className="mt-3 text-sm text-zinc-600">
              {totalFiles} files ·{" "}
              {formatBytes(totalSizeResult._sum.sizeBytes ?? BigInt(0))}
            </p>
            <p className="mt-2 text-xs text-zinc-400">
              Persistent Hostinger storage
            </p>
          </section>
        </aside>

        <div className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-xl font-bold capitalize text-zinc-950">
                  {currentLibraryLabel}
                </h2>
                <p className="mt-1 text-[11px] text-zinc-500">
                  {currentCount} files
                </p>
              </div>

              {selectedLibrary !== "all" ? (
                <div className="flex flex-wrap gap-2">
                  <details className="relative">
                    <summary className="cursor-pointer list-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700">
                      Rename
                    </summary>

                    <form
                      action={renameLibraryAction}
                      className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl"
                    >
                      <input
                        type="hidden"
                        name="from"
                        value={selectedLibrary}
                      />
                      <input
                        name="to"
                        required
                        defaultValue={selectedLibrary}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      />
                      <button
                        type="submit"
                        className="mt-2 w-full rounded-lg bg-zinc-950 px-3 py-2 text-xs font-semibold text-white"
                      >
                        Rename
                      </button>
                    </form>
                  </details>

                  {selectedLibrary !== "misc" ? (
                    <form action={deleteLibraryAction}>
                      <input
                        type="hidden"
                        name="library"
                        value={selectedLibrary}
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                      >
                        Delete Library
                      </button>
                    </form>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="p-4">
              <MediaUploader
                libraries={libraries}
                selectedLibrary={
                  selectedLibrary === "all"
                    ? "misc"
                    : selectedLibrary
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <form method="get" className="flex min-w-0 flex-1 gap-2">
                {selectedLibrary !== "all" ? (
                  <input
                    type="hidden"
                    name="library"
                    value={selectedLibrary}
                  />
                ) : null}

                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search media..."
                  className="min-w-0 max-w-sm flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />

                <button
                  type="submit"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700"
                >
                  Search
                </button>
              </form>

              <span className="text-xs text-zinc-500">
                Showing {media.length} files
              </span>
            </div>

            {media.length ? (
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {media.map((item) => {
                  const usageCount =
                    item._count.userAvatars +
                    item._count.pageFeatured +
                    item._count.postFeatured +
                    item._count.postSecondary +
                    item._count.postGalleryItems;

                  return (
                    <details
                      key={item.id.toString()}
                      className="group overflow-hidden rounded-xl border border-zinc-200 bg-white"
                    >
                      <summary className="cursor-pointer list-none">
                        <img
                          src={item.url}
                          alt={item.altText || item.originalName}
                          loading="lazy"
                          className="h-24 w-full bg-zinc-100 object-cover sm:h-28 xl:h-24 2xl:h-28"
                        />

                        <div className="p-2.5">
                          <p className="truncate text-xs font-semibold text-zinc-950">
                            {item.originalName}
                          </p>
                          <p className="mt-1 text-[11px] text-zinc-500">
                            {formatBytes(item.sizeBytes)} ·{" "}
                            {usageCount} uses
                          </p>
                        </div>
                      </summary>

                      <div className="space-y-3 border-t border-zinc-100 bg-zinc-50 p-3">
                        <form
                          action={updateMediaAction}
                          className="space-y-2"
                        >
                          <input
                            type="hidden"
                            name="id"
                            value={item.id.toString()}
                          />

                          <input
                            name="altText"
                            defaultValue={item.altText ?? ""}
                            placeholder="Alt text"
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs"
                          />

                          <input
                            name="caption"
                            defaultValue={item.caption ?? ""}
                            placeholder="Caption"
                            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs"
                          />

                          <button
                            type="submit"
                            className="rounded-lg bg-zinc-950 px-3 py-2 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                        </form>

                        <form
                          action={moveMediaAction}
                          className="flex gap-2"
                        >
                          <input
                            type="hidden"
                            name="id"
                            value={item.id.toString()}
                          />

                          <select
                            name="destination"
                            defaultValue={normalizeMediaFolder(item.folder)}
                            className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-2 py-2 text-xs"
                          >
                            {libraries.map((library) => (
                              <option
                                key={library}
                                value={library}
                              >
                                {library}
                              </option>
                            ))}
                          </select>

                          <button
                            type="submit"
                            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700"
                          >
                            Move
                          </button>
                        </form>

                        <div className="flex flex-wrap gap-2">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700"
                          >
                            View
                          </a>

                          <form action={deleteMediaAction}>
                            <input
                              type="hidden"
                              name="id"
                              value={item.id.toString()}
                            />
                            <button
                              type="submit"
                              disabled={usageCount > 0}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-zinc-50 p-10 text-center text-sm text-zinc-500">
                No media in this library.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
