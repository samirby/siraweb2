"use client";

import { useMemo, useRef, useState } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);
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

      setMessage(`${uploadedCount} image(s) uploaded`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Gallery upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name="galleryMediaIds" value={id} />
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-zinc-950">Gallery</h2>
          <p className="mt-0.5 text-xs text-zinc-400">
            {selectedIds.length} image(s)
          </p>
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            disabled={uploading}
            className="hidden"
            onChange={(event) => {
              void uploadFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-lg bg-zinc-950 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "+ Add images"}
          </button>

          <details className="relative">
            <summary className="cursor-pointer list-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700">
              Library
            </summary>

            <div className="absolute right-0 z-30 mt-2 max-h-80 w-80 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-2 shadow-xl">
              <div className="space-y-1">
                {media.map((item) => {
                  const active = selectedIds.includes(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggle(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg border p-2 text-left ${
                        active
                          ? "border-zinc-950 bg-zinc-100"
                          : "border-transparent hover:bg-zinc-50"
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.altText || item.originalName}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <span className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-700">
                        {item.originalName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </details>
        </div>
      </div>

      {selected.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {selected.map((item) => (
            <div
              key={item.id}
              className="group relative h-20 w-20 overflow-hidden rounded-lg border border-zinc-200"
            >
              <img
                src={item.url}
                alt={item.altText || item.originalName}
                className="h-full w-full object-cover"
              />

              <button
                type="button"
                onClick={() => toggle(item.id)}
                className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/70 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100"
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-xs text-zinc-400">
          No gallery images selected
        </div>
      )}

      {message ? (
        <p className="mt-2 text-[11px] text-zinc-400">{message}</p>
      ) : null}
    </section>
  );
}
