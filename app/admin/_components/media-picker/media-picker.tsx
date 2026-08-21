"use client";

import { useMemo, useRef, useState } from "react";

export type MediaPickerItem = {
  id: string;
  url: string;
  name: string;
  alt?: string | null;
};

type Props = {
  name: string;
  label: string;
  items: MediaPickerItem[];
  defaultValue?: string;
  allowEmpty?: boolean;
  multiple?: boolean;
  folder?: string;
  accept?: string;
  helpText?: string;
};

type UploadPayload = {
  id?: string | number;
  url?: string;
  filename?: string;
  originalName?: string;
  altText?: string | null;
  media?: {
    id?: string | number;
    url?: string;
    filename?: string;
    originalName?: string;
    altText?: string | null;
  };
};

function normalizeUpload(
  payload: UploadPayload,
): MediaPickerItem | null {
  const media = payload.media ?? payload;

  const id = media.id != null ? String(media.id) : "";
  const url = typeof media.url === "string" ? media.url : "";

  if (!id || !url) return null;

  return {
    id,
    url,
    name:
      media.originalName ||
      media.filename ||
      `Media ${id}`,
    alt: media.altText ?? null,
  };
}

export function MediaPicker({
  name,
  label,
  items,
  defaultValue = "",
  allowEmpty = true,
  multiple = false,
  folder = "misc",
  accept = "image/*",
  helpText,
}: Props) {
  const [library, setLibrary] = useState(items);
  const [selected, setSelected] = useState<string[]>(
    defaultValue
      ? defaultValue
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
  );

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return library;

    return library.filter((item) =>
      [item.name, item.alt]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(q),
        ),
    );
  }, [library, search]);

  const selectedItems = library.filter((item) =>
    selected.includes(item.id),
  );

  function toggle(id: string) {
    if (multiple) {
      setSelected((current) =>
        current.includes(id)
          ? current.filter((item) => item !== id)
          : [...current, id],
      );
      return;
    }

    setSelected([id]);
  }

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;

    setUploading(true);
    setError("");

    try {
      const uploaded: MediaPickerItem[] = [];

      for (const file of Array.from(files)) {
        const body = new FormData();

        body.append("file", file);
        body.append("folder", folder);

        const response = await fetch("/api/media/upload", {
          method: "POST",
          body,
        });

        if (!response.ok) {
          throw new Error(
            `Upload failed (${response.status})`,
          );
        }

        const payload =
          (await response.json()) as UploadPayload;

        const normalized = normalizeUpload(payload);

        if (!normalized) {
          throw new Error(
            "Upload succeeded but media response could not be read.",
          );
        }

        uploaded.push(normalized);
      }

      if (uploaded.length) {
        setLibrary((current) => {
          const known = new Set(
            current.map((item) => item.id),
          );

          return [
            ...uploaded.filter(
              (item) => !known.has(item.id),
            ),
            ...current,
          ];
        });

        if (multiple) {
          setSelected((current) => [
            ...current,
            ...uploaded
              .map((item) => item.id)
              .filter(
                (id) => !current.includes(id),
              ),
          ]);
        } else {
          setSelected([
            uploaded[uploaded.length - 1].id,
          ]);
        }

        setSearch("");
        setOpen(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Upload failed.",
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-zinc-800">
            {label}
          </div>

          {helpText ? (
            <div className="mt-1 text-xs text-zinc-500">
              {helpText}
            </div>
          ) : null}
        </div>

        {allowEmpty && selected.length ? (
          <button
            type="button"
            onClick={() => setSelected([])}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-950"
          >
            Remove
          </button>
        ) : null}
      </div>

      {selectedItems.length ? (
        <div
          className={`mt-3 grid gap-2 ${
            multiple
              ? "grid-cols-3 sm:grid-cols-4"
              : "grid-cols-1"
          }`}
        >
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className={`overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 ${
                multiple ? "" : "max-w-[240px]"
              }`}
            >
              <img
                src={item.url}
                alt={item.alt || item.name}
                className={`w-full ${
                  multiple
                    ? "aspect-square object-cover"
                    : "h-28 object-contain p-2"
                }`}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
          No image selected.
        </div>
      )}

      {multiple
        ? selected.map((id) => (
            <input
              key={id}
              type="hidden"
              name={name}
              value={id}
            />
          ))
        : (
          <input
            type="hidden"
            name={name}
            value={selected[0] ?? ""}
          />
        )}

      <div className="mt-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white"
        >
          {selected.length
            ? multiple
              ? "Manage images"
              : "Change image"
            : multiple
              ? "Add images"
              : "Choose image"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(event) =>
            void uploadFiles(event.target.files)
          }
          className="hidden"
        />
      </div>

      {error ? (
        <div className="mt-2 text-xs font-medium text-red-600">
          {error}
        </div>
      ) : null}

      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-5 py-4">
              <div>
                <h3 className="font-bold text-zinc-950">
                  Media Library
                </h3>

                <p className="text-xs text-zinc-500">
                  Choose an existing image first. If it is not here, upload it from your computer.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    inputRef.current?.click()
                  }
                  disabled={uploading}
                  className="rounded-lg bg-zinc-950 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {uploading
                    ? "Uploading..."
                    : "Upload from computer"}
                </button>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="border-b border-zinc-200 p-4">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search media..."
                className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {filtered.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {filtered.map((item) => {
                    const active =
                      selected.includes(item.id);

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          toggle(item.id)
                        }
                        className={`overflow-hidden rounded-xl border text-left ${
                          active
                            ? "border-zinc-950 ring-2 ring-zinc-950"
                            : "border-zinc-200"
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={
                            item.alt || item.name
                          }
                          className="aspect-square w-full object-cover"
                        />

                        <div className="truncate px-2 py-2 text-xs font-medium text-zinc-700">
                          {item.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center">
                  <p className="text-sm font-semibold text-zinc-700">
                    No matching media found
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Upload a new image from your computer.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      inputRef.current?.click()
                    }
                    disabled={uploading}
                    className="mt-4 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {uploading
                      ? "Uploading..."
                      : "Upload from computer"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-5 py-4">
              <span className="text-xs text-zinc-500">
                {selected.length} selected
              </span>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={!selected.length}
                className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {multiple
                  ? "Use selected images"
                  : "Use selected image"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
