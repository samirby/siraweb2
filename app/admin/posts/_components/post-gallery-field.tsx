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
  initialMedia: MediaOption[];
  defaultValues?: string[];
};

export function PostGalleryField({
  initialMedia,
  defaultValues = [],
}: Props) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <MediaPicker
        name="galleryMediaIds"
        label="Gallery"
        items={initialMedia.map((item) => ({
          id: item.id,
          url: item.url,
          name: item.originalName,
          alt: item.altText,
        }))}
        defaultValue={defaultValues.join(",")}
        multiple
        folder="gallery"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        helpText="Select existing images or upload new gallery images."
      />
    </section>
  );
}
