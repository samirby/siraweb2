import { PostGalleryField } from "./post-gallery-field";
import { PostMediaField } from "./post-media-field";
import { RichTextEditor } from "./rich-text-editor";

type CategoryOption = {
  id: string;
  name: string;
};

type TagOption = {
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
  tagIds?: string[];
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  categories: CategoryOption[];
  tags: TagOption[];
  media: MediaOption[];
  value?: PostValue;
};

export function PostForm({
  action,
  submitLabel,
  categories,
  tags,
  media,
  value,
}: Props) {
  return (
    <form action={action} className="min-w-0">
      {value?.id ? (
        <input type="hidden" name="id" value={value.id} />
      ) : null}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_260px]">
              <label className="block min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Title
                </span>
                <input
                  name="title"
                  required
                  defaultValue={value?.title ?? ""}
                  placeholder="Post title"
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-base font-semibold outline-none focus:border-zinc-950"
                />
              </label>

              <label className="block min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Slug
                </span>
                <input
                  name="slug"
                  defaultValue={value?.slug ?? ""}
                  placeholder="generated-from-title"
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Excerpt
              </span>
              <textarea
                name="excerpt"
                rows={2}
                defaultValue={value?.excerpt ?? ""}
                placeholder="Short article summary"
                className="mt-1.5 w-full resize-y rounded-lg border border-zinc-300 px-3 py-2.5 text-sm outline-none focus:border-zinc-950"
              />
            </label>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-zinc-950">
                Content
              </h2>
              <span className="text-xs text-zinc-400">
                Rich text
              </span>
            </div>

            <RichTextEditor
              name="content"
              defaultValue={value?.content}
            />
          </section>

          <PostGalleryField
            initialMedia={media}
            defaultValues={value?.galleryMediaIds ?? []}
          />

          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4">
              <h2 className="text-base font-bold text-zinc-950">
                SEO
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Search engine metadata
              </p>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  SEO title
                </span>
                <input
                  name="seoTitle"
                  maxLength={191}
                  defaultValue={value?.seoTitle ?? ""}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Canonical URL
                </span>
                <input
                  name="canonicalUrl"
                  type="url"
                  defaultValue={value?.canonicalUrl ?? ""}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
                />
              </label>

              <label className="block lg:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  SEO description
                </span>
                <textarea
                  name="seoDescription"
                  rows={3}
                  maxLength={500}
                  defaultValue={value?.seoDescription ?? ""}
                  className="mt-1.5 w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-sm"
                />
              </label>
            </div>

            <label className="mt-3 flex items-center gap-2">
              <input
                name="noIndex"
                type="checkbox"
                defaultChecked={value?.noIndex ?? false}
              />
              <span className="text-xs font-medium text-zinc-600">
                Hide from search engines
              </span>
            </label>
          </section>
        </div>

        <aside className="min-w-0 space-y-3 xl:sticky xl:top-20 xl:self-start">
          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-950">
              Publish
            </h2>

            <select
              name="status"
              defaultValue={value?.status ?? "DRAFT"}
              className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <button
              type="submit"
              className="mt-3 w-full rounded-lg bg-zinc-950 px-3 py-2.5 text-sm font-semibold text-white"
            >
              {submitLabel}
            </button>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-bold text-zinc-950">
              Category
            </h2>

            <select
              name="categoryId"
              defaultValue={value?.categoryId ?? ""}
              className="mt-3 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
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

          <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-zinc-950">
                Tags
              </h2>
              <span className="text-[11px] text-zinc-400">
                Multiple
              </span>
            </div>

            <select
              name="tagIds"
              multiple
              defaultValue={value?.tagIds ?? []}
              className="mt-3 h-32 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            >
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>

            <p className="mt-2 text-[11px] text-zinc-400">
              Hold Ctrl/Cmd to select multiple tags.
            </p>
          </section>

          <PostMediaField
            name="featuredMediaId"
            label="Featured image"
            initialMedia={media}
            defaultValue={value?.featuredMediaId}
            uploadFolder="posts"
          />

          <PostMediaField
            name="secondaryMediaId"
            label="Secondary image"
            initialMedia={media}
            defaultValue={value?.secondaryMediaId}
            uploadFolder="posts"
          />
        </aside>
      </div>
    </form>
  );
}
