import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import {
  deleteMediaAction,
  updateMediaAction,
} from "./actions";
import { MediaUploader } from "./_components/media-uploader";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    saved?: string;
    deleted?: string;
    inUse?: string;
  }>;
};

function formatBytes(value: bigint) {
  const size = Number(value);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export default async function MediaAdminPage({
  searchParams,
}: Props) {
  await requirePermission("media.view");

  const query = await searchParams;
  const q = query.q?.trim() ?? "";

  const media = await prisma.media.findMany({
    where: q
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
              folder: {
                contains: q,
              },
            },
          ],
        }
      : undefined,

    orderBy: {
      createdAt: "desc",
    },

    include: {
      uploadedBy: {
        select: {
          name: true,
        },
      },

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
  });

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-6">
        <p className="text-sm font-medium text-zinc-500">
          Library
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
          Media
        </h1>

        <p className="mt-2 text-sm text-zinc-600">
          Upload once and reuse images across pages, posts and galleries.
        </p>
      </div>

      {query.saved === "1" ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Media information saved.
        </div>
      ) : null}

      {query.deleted === "1" ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Media deleted.
        </div>
      ) : null}

      {query.inUse === "1" ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          This image is currently used by content and cannot be deleted.
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-4">
          <MediaUploader />

          <form
            method="get"
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Search library
              </span>

              <div className="mt-2 flex gap-2">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="filename, alt text, folder"
                  className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
                />

                <button
                  type="submit"
                  className="rounded-lg bg-zinc-950 px-3 py-2.5 text-sm font-semibold text-white"
                >
                  Search
                </button>
              </div>
            </label>
          </form>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-zinc-950">
              Library
            </h2>

            <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-600">
              {media.length}
            </span>
          </div>

          {media.length ? (
            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
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
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
                  >
                    <summary className="cursor-pointer list-none">
                      <img
                        src={item.url}
                        alt={item.altText || item.originalName}
                        loading="lazy"
                        className="aspect-[4/3] w-full bg-zinc-100 object-cover"
                      />

                      <div className="p-4">
                        <p className="truncate text-sm font-semibold text-zinc-950">
                          {item.originalName}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
                          <span>{formatBytes(item.sizeBytes)}</span>
                          <span>{item.mimeType}</span>
                          <span>{usageCount} uses</span>
                        </div>

                        {item.folder ? (
                          <p className="mt-2 truncate text-xs text-zinc-400">
                            {item.folder}
                          </p>
                        ) : null}
                      </div>
                    </summary>

                    <form
                      action={updateMediaAction}
                      className="space-y-3 border-t border-zinc-100 bg-zinc-50 p-4"
                    >
                      <input
                        type="hidden"
                        name="id"
                        value={item.id.toString()}
                      />

                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Alt text
                        </span>
                        <input
                          name="altText"
                          maxLength={255}
                          defaultValue={item.altText ?? ""}
                          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Caption
                        </span>
                        <input
                          name="caption"
                          maxLength={500}
                          defaultValue={item.caption ?? ""}
                          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                        />
                      </label>

                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          Folder
                        </span>
                        <input
                          name="folder"
                          maxLength={255}
                          defaultValue={item.folder ?? ""}
                          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                        />
                      </label>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-zinc-950 px-3 py-2 text-xs font-semibold text-white"
                        >
                          Save
                        </button>

                        <button
                          type="submit"
                          formAction={deleteMediaAction}
                          disabled={usageCount > 0}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Delete
                        </button>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700"
                        >
                          Open
                        </a>
                      </div>

                      <p className="text-[11px] text-zinc-400">
                        Uploaded by {item.uploadedBy.name}
                      </p>
                    </form>
                  </details>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500 shadow-sm">
              No media found.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
