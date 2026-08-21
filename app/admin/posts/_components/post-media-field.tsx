"use client";

import { MediaPicker } from "@/app/admin/_components/media-picker";

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
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <MediaPicker
        name={name}
        label={label}
        items={initialMedia.map((item) => ({
          id: item.id,
          url: item.url,
          name: item.originalName,
          alt: item.altText,
        }))}
        defaultValue={defaultValue ?? ""}
        folder={uploadFolder}
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        helpText="Choose an existing image from Media Library or upload a new one."
      />
    </section>
  );
}
