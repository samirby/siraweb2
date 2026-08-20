type PageFormValue = {
  id?: string;
  title?: string;
  slug?: string;
  status?: string;
  pageType?: string;
  template?: string;
  excerpt?: string | null;
  content?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  featuredMediaId?: string | null;
};

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  value?: PageFormValue;
  submitLabel: string;
  media?: Array<{
    id: string;
    url: string;
    originalName: string;
    altText: string | null;
    folder: string | null;
  }>;
};

export function PageForm({
  action,
  value,
  submitLabel,
  media = [],
}: Props) {
  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      {value?.id ? (
        <input type="hidden" name="id" value={value.id} />
      ) : null}

      <div className="space-y-6">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">Title</span>
            <input
              name="title"
              required
              defaultValue={value?.title ?? ""}
              placeholder="Page title"
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-lg font-semibold outline-none transition focus:border-zinc-950"
            />
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-zinc-800">Slug</span>
            <input
              name="slug"
              defaultValue={value?.slug ?? ""}
              placeholder="generated-from-title"
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-zinc-950"
            />
            <span className="mt-1 block text-xs text-zinc-500">
              Leave blank to generate automatically.
            </span>
          </label>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-zinc-950">Content</h2>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-zinc-800">Excerpt</span>
            <textarea
              name="excerpt"
              rows={3}
              defaultValue={value?.excerpt ?? ""}
              placeholder="Short page summary..."
              className="mt-2 w-full resize-y rounded-xl border border-zinc-300 px-4 py-3 outline-none transition focus:border-zinc-950"
            />
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-zinc-800">Page content</span>
            <textarea
              name="content"
              rows={18}
              defaultValue={value?.content ?? ""}
              placeholder="Write page content..."
              className="mt-2 w-full resize-y rounded-xl border border-zinc-300 px-4 py-3 font-mono text-sm leading-6 outline-none transition focus:border-zinc-950"
            />
          </label>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-zinc-950">SEO</h2>

          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">SEO title</span>
              <input
                name="seoTitle"
                maxLength={191}
                defaultValue={value?.seoTitle ?? ""}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">SEO description</span>
              <textarea
                name="seoDescription"
                rows={3}
                maxLength={500}
                defaultValue={value?.seoDescription ?? ""}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">Canonical URL</span>
              <input
                name="canonicalUrl"
                type="url"
                defaultValue={value?.canonicalUrl ?? ""}
                placeholder="https://example.com/page"
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950"
              />
            </label>

            <label className="flex items-center gap-3">
              <input
                name="noIndex"
                type="checkbox"
                defaultChecked={value?.noIndex ?? false}
                className="h-4 w-4 rounded border-zinc-300"
              />
              <span className="text-sm font-medium text-zinc-700">
                Hide this page from search engines (noindex)
              </span>
            </label>
          </div>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">Publish</h2>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-zinc-800">Status</span>
            <select
              name="status"
              defaultValue={value?.status ?? "DRAFT"}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </label>

          <button
            type="submit"
            className="mt-5 w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            {submitLabel}
          </button>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">Featured image</h2>

          <select
            name="featuredMediaId"
            defaultValue={value?.featuredMediaId ?? ""}
            className="mt-4 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm"
          >
            <option value="">No featured image</option>
            {media.map((item) => (
              <option key={item.id} value={item.id}>
                {item.originalName}
                {item.folder ? ` — ${item.folder}` : ""}
              </option>
            ))}
          </select>

          {value?.featuredMediaId ? (
            <div className="mt-4">
              {media
                .filter((item) => item.id === value.featuredMediaId)
                .map((item) => (
                  <img
                    key={item.id}
                    src={item.url}
                    alt={item.altText || item.originalName}
                    className="aspect-[16/9] w-full rounded-xl border border-zinc-200 object-cover"
                  />
                ))}
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">Page settings</h2>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-zinc-800">Page type</span>
            <select
              name="pageType"
              defaultValue={value?.pageType ?? "STANDARD"}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
            >
              <option value="STANDARD">Standard</option>
              <option value="ARTICLES">Articles</option>
              <option value="LANDING">Landing</option>
              <option value="SERVICE">Service</option>
              <option value="LEGAL">Legal</option>
            </select>
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-semibold text-zinc-800">Template</span>
            <select
              name="template"
              defaultValue={value?.template ?? "DEFAULT"}
              className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
            >
              <option value="DEFAULT">Default</option>
              <option value="ARTICLES_GRID">Articles Grid</option>
              <option value="ARTICLES_LIST">Articles List</option>
              <option value="ARTICLES_MAGAZINE">Articles Magazine</option>
              <option value="LANDING_CLEAN">Landing Clean</option>
              <option value="SERVICE_MODERN">Service Modern</option>
              <option value="LEGAL_DEFAULT">Legal Default</option>
            </select>
          </label>
        </section>
      </aside>
    </form>
  );
}
