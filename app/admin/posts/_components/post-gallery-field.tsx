"use client";

import { useMemo, useState } from "react";

type MediaOption = {
  id: string;
  url: string;
  originalName: string;
  altText: string | null;
  folder: string | null;
};

type Props = {
  initialMedia: MediaOption[];
  defaultValues?: string[];
};

export function PostGalleryField({
  initialMedia,
  defaultValues = [],
}: Props) {
  const [media, setMedia] = useState(initialMedia);
  const [selectedIds, setSelectedIds] = useState(defaultValues);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selected = useMemo(
    () => media.filter((item) => selectedIds.includes(item.id)),
    [media, selectedIds],
  );

  function toggle(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;

    setUploading(true);
    setMessage(null);

    let uploadedCount = 0;

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.set("file", file);
        formData.set("folder", "gallery");

        const response = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        const result = (await response.json()) as {
          error?: string;
          media?: {
            id: string;
            url: string;
            originalName: string;
            altText: string | null;
            folder?: string | null;
          };
        };

        if (!response.ok || !result.media) {
          throw new Error(result.error || "Upload failed.");
        }

        const item: MediaOption = {
          id: result.media.id,
          url: result.media.url,
          originalName: result.media.originalName,
          altText: result.media.altText,
          folder: result.media.folder ?? "gallery",
        };

        setMedia((current) => [item, ...current]);
        setSelectedIds((current) =>
          current.includes(item.id) ? current : [...current, item.id],
        );
        uploadedCount += 1;
      }

      setMessage(`${uploadedCount} image(s) uploaded and selected.`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gallery upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-zinc-950">Gallery</h2>

      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="galleryMediaIds" value={id} />
      ))}

      <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
        <p className="text-sm font-semibold text-zinc-900">
          Upload gallery images
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Select multiple images directly from your computer.
        </p>

        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          disabled={uploading}
          onChange={(event) => {
            void uploadFiles(event.target.files);
            event.currentTarget.value = "";
          }}
          className="mt-3 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-950 file:px-3 file:py-2 file:font-semibold file:text-white"
        />

        {uploading ? <p className="mt-2 text-xs text-zinc-500">Uploading...</p> : null}
        {message ? <p className="mt-2 text-xs text-zinc-500">{message}</p> : null}
      </div>

      {selected.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {selected.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white text-left"
              title="Click to remove from gallery"
            >
              <img
                src={item.url}
                alt={item.altText || item.originalName}
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1.5 text-xs text-white">
                Remove
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">No gallery images selected.</p>
      )}

      <details className="mt-5">
        <summary className="cursor-pointer text-sm font-semibold text-zinc-700">
          Choose existing images from Media Library
        </summary>

        <div className="mt-3 grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">
          {media.map((item) => {
            const active = selectedIds.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={`flex items-center gap-3 rounded-xl border p-2 text-left ${
                  active
                    ? "border-zinc-950 bg-zinc-100"
                    : "border-zinc-200 bg-white"
                }`}
              >
                <img
                  src={item.url}
                  alt={item.altText || item.originalName}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-700">
                  {item.originalName}
                </span>
              </button>
            );
          })}
        </div>
      </details>
    </section>
  );
}
