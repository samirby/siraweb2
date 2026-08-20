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
  name: "featuredMediaId" | "secondaryMediaId";
  label: string;
  initialMedia: MediaOption[];
  defaultValue?: string | null;
  uploadFolder: string;
};

export function PostMediaField({
  name,
  label,
  initialMedia,
  defaultValue,
  uploadFolder,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState(initialMedia);
  const [selectedId, setSelectedId] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selected = useMemo(
    () => media.find((item) => item.id === selectedId) ?? null,
    [media, selectedId],
  );

  async function uploadFile(file: File | null) {
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", uploadFolder);

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
        setMessage(result.error || "Upload failed.");
        return;
      }

      const item: MediaOption = {
        id: result.media.id,
        url: result.media.url,
        originalName: result.media.originalName,
        altText: result.media.altText,
        folder: result.media.folder ?? uploadFolder,
      };

      setMedia((current) => [item, ...current]);
      setSelectedId(item.id);
      setMessage("Uploaded");
    } catch {
      setMessage("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <input type="hidden" name={name} value={selectedId} />

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-zinc-950">{label}</h2>

        {selected ? (
          <button
            type="button"
            onClick={() => setSelectedId("")}
            className="text-xs font-semibold text-zinc-400 hover:text-red-600"
          >
            Remove
          </button>
        ) : null}
      </div>

      {selected ? (
        <div className="mt-3 flex items-center gap-3">
          <img
            src={selected.url}
            alt={selected.altText || selected.originalName}
            className="h-16 w-16 shrink-0 rounded-lg border border-zinc-200 object-cover"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-zinc-800">
              {selected.originalName}
            </p>
            <p className="mt-1 truncate text-[11px] text-zinc-400">
              {selected.folder ?? uploadFolder}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-3 py-4 text-center text-xs text-zinc-400">
          No image selected
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        disabled={uploading}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          void uploadFile(file);
          event.currentTarget.value = "";
        }}
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : selected ? "Change" : "Upload"}
        </button>

        <details className="relative">
          <summary className="cursor-pointer list-none rounded-lg border border-zinc-300 bg-white px-3 py-2 text-center text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
            Library
          </summary>

          <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl">
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs"
            >
              <option value="">No image</option>
              {media.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.originalName}
                </option>
              ))}
            </select>
          </div>
        </details>
      </div>

      {message ? (
        <p className="mt-2 text-[11px] text-zinc-400">{message}</p>
      ) : null}
    </section>
  );
}
