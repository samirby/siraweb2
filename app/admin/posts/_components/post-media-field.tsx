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
      setMessage("Uploaded and selected.");
    } catch {
      setMessage("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-zinc-950">{label}</h2>

      <input type="hidden" name={name} value={selectedId} />

      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Upload from computer
          </span>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            disabled={uploading}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              void uploadFile(file);
              event.currentTarget.value = "";
            }}
            className="mt-2 block w-full rounded-xl border border-zinc-300 bg-white p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-950 file:px-3 file:py-2 file:font-semibold file:text-white"
          />
        </label>

        <div className="text-center text-xs font-semibold uppercase tracking-wide text-zinc-400">
          or
        </div>

        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm"
        >
          <option value="">No image</option>
          {media.map((item) => (
            <option key={item.id} value={item.id}>
              {item.originalName}
              {item.folder ? ` — ${item.folder}` : ""}
            </option>
          ))}
        </select>

        {uploading ? <p className="text-xs text-zinc-500">Uploading...</p> : null}
        {message ? <p className="text-xs text-zinc-500">{message}</p> : null}

        {selected ? (
          <img
            src={selected.url}
            alt={selected.altText || selected.originalName}
            className="aspect-[16/9] w-full rounded-xl border border-zinc-200 object-cover"
          />
        ) : null}
      </div>
    </section>
  );
}
