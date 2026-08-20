type CategoryOption = {
  id: string;
  name: string;
};

type MediaOption = {
  id: string;
  url: string;
  originalName: string;
  altText: string | null;
  folder: string | null;
};

type PostValue = {
  id?: string;
  title?: string;
  slug?: string;
  status?: string;
  categoryId?: string | null;
  excerpt?: string | null;
  content?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  featuredMediaId?: string | null;
  secondaryMediaId?: string | null;
  galleryMediaIds?: string[];
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  categories: CategoryOption[];
  media: MediaOption[];
  value?: PostValue;
};

function MediaPreview({
  media,
  id,
}: {
  media: MediaOption[];
  id?: string | null;
}) {
  if (!id) return null;

  const item = media.find((candidate) => candidate.id === id);

  if (!item) return null;

  return (
    <img
      src={item.url}
      alt={item.altText || item.originalName}
      className="mt-3 aspect-[16/9] w-full rounded-xl border border-zinc-200 object-cover"
    />
  );
}

export function PostForm({
  action,
  submitLabel,
  categories,
  media,
  value,
}: Props) {
  return (
    <form
      action={action}
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
    >
      {value?.id ? (
        <input type="hidden" name="id" value={value.id} />
      ) : null}

      <div className="space-y-6">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Title
            </span>
            <input
              name="title"
              required
              defaultValue={value?.title ?? ""}
              placeholder="Post title"
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-lg font-semibold outline-none focus:border-zinc-950"
            />
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-zinc-800">
              Slug
            </span>
            <input
              name="slug"
              defaultValue={value?.slug ?? ""}
              placeholder="generated-from-title"
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950"
            />
          </label>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-zinc-950">
            Content
          </h2>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-zinc-800">
              Excerpt
            </span>
            <textarea
              name="excerpt"
              rows={3}
              defaultValue={value?.excerpt ?? ""}
              className="mt-2 w-full resize-y rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950"
            />
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-zinc-800">
              Post content
            </span>
            <textarea
              name="content"
              rows={20}
              defaultValue={value?.content ?? ""}
              className="mt-2 w-full resize-y rounded-xl border border-zinc-300 px-4 py-3 font-mono text-sm leading-6 outline-none focus:border-zinc-950"
            />
          </label>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-zinc-950">
            Gallery
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Select multiple images from Media Library.
          </p>

          <select
            name="galleryMediaIds"
            multiple
            defaultValue={value?.galleryMediaIds ?? []}
            className="mt-4 h-64 w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-sm"
          >
            {media.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.originalName}
                {item.folder ? ` — ${item.folder}` : ""}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-zinc-400">
            Hold Ctrl/Cmd to select multiple images.
          </p>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-zinc-950">
            SEO
          </h2>

          <div className="mt-5 space-y-5">
            <input
              name="seoTitle"
              maxLength={191}
              defaultValue={value?.seoTitle ?? ""}
              placeholder="SEO title"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            />

            <textarea
              name="seoDescription"
              rows={3}
              maxLength={500}
              defaultValue={value?.seoDescription ?? ""}
              placeholder="SEO description"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            />

            <input
              name="canonicalUrl"
              type="url"
              defaultValue={value?.canonicalUrl ?? ""}
              placeholder="Canonical URL"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3"
            />

            <label className="flex items-center gap-3">
              <input
                name="noIndex"
                type="checkbox"
                defaultChecked={value?.noIndex ?? false}
              />
              <span className="text-sm font-medium text-zinc-700">
                Hide from search engines
              </span>
            </label>
          </div>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">
            Publish
          </h2>

          <select
            name="status"
            defaultValue={value?.status ?? "DRAFT"}
            className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white"
          >
            {submitLabel}
          </button>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">
            Category
          </h2>

          <select
            name="categoryId"
            defaultValue={value?.categoryId ?? ""}
            className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
          >
            <option value="">Uncategorized</option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">
            Featured image
          </h2>

          <select
            name="featuredMediaId"
            defaultValue={value?.featuredMediaId ?? ""}
            className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">No featured image</option>

            {media.map((item) => (
              <option key={item.id} value={item.id}>
                {item.originalName}
              </option>
            ))}
          </select>

          <MediaPreview
            media={media}
            id={value?.featuredMediaId}
          />
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">
            Secondary image
          </h2>

          <select
            name="secondaryMediaId"
            defaultValue={value?.secondaryMediaId ?? ""}
            className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">No secondary image</option>

            {media.map((item) => (
              <option key={item.id} value={item.id}>
                {item.originalName}
              </option>
            ))}
          </select>

          <MediaPreview
            media={media}
            id={value?.secondaryMediaId}
          />
        </section>
      </aside>
    </form>
  );
}
