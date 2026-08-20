"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function MediaUploader() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upload(formData: FormData) {
    const file = formData.get("file");

    if (!(file instanceof File) || !file.size) {
      setMessage("Select an image first.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setMessage("Maximum file size is 10 MB.");
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        error?: string;
        media?: { id: string };
      };

      if (!response.ok) {
        setMessage(result.error || "Upload failed.");
        return;
      }

      formRef.current?.reset();
      setMessage("Upload completed.");
      router.refresh();
    } catch {
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={upload}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-950">
            Upload media
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            JPEG, PNG, WebP, GIF or AVIF · max 10 MB
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Image
          </span>
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            required
            className="mt-2 block w-full rounded-xl border border-zinc-300 bg-white p-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-950 file:px-3 file:py-2 file:font-semibold file:text-white"
          />
        </label>

        <label>
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Alt text
          </span>
          <input
            name="altText"
            maxLength={255}
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
          />
        </label>

        <label>
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Folder
          </span>
          <input
            name="folder"
            maxLength={255}
            placeholder="pages, posts, gallery..."
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
          />
        </label>

        <label className="md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Caption
          </span>
          <input
            name="caption"
            maxLength={500}
            className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={uploading}
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload image"}
        </button>

        {message ? (
          <span className="text-sm text-zinc-600">
            {message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
