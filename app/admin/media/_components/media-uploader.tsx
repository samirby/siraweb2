"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

type Props = {
  libraries: string[];
  selectedLibrary: string;
};

export function MediaUploader({
  libraries,
  selectedLibrary,
}: Props) {
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
      className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:grid-cols-[240px_minmax(0,1fr)]"
    >
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Upload to
        </span>
        <select
          name="folder"
          defaultValue={selectedLibrary}
          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm font-medium"
        >
          {libraries.map((library) => (
            <option key={library} value={library}>
              {library}
            </option>
          ))}
        </select>
      </label>

      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              Choose an image to upload
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              JPG, PNG, WebP, GIF or AVIF · max 10 MB
            </p>
          </div>

          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            required
            className="max-w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-950 file:px-3 file:py-2 file:font-semibold file:text-white"
          />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <input
            name="altText"
            maxLength={255}
            placeholder="Alt text"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
          <input
            name="caption"
            maxLength={500}
            placeholder="Caption"
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>

          {message ? (
            <span className="text-xs text-zinc-500">{message}</span>
          ) : null}
        </div>
      </div>
    </form>
  );
}
