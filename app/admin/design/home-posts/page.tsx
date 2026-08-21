import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { getSiteSettings } from "@/lib/settings/site-settings";
import {
  resetHomePostsSettings,
  saveHomePostsSettings,
} from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    saved?: string;
    reset?: string;
  }>;
};

function checked(value: string) {
  return value !== "false";
}

export default async function AdminHomePostsPage({
  searchParams,
}: Props) {
  await requirePermission("roles.manage");

  const [settings, query] = await Promise.all([
    getSiteSettings(),
    searchParams,
  ]);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <Link
            href="/admin/design"
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-950"
          >
            ← Design
          </Link>

          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Homepage Module
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
            Posts Section
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Configure the burgundy article section shown on the homepage.
          </p>
        </header>

        {query.saved === "1" ? (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Posts section saved.
          </div>
        ) : null}

        {query.reset === "1" ? (
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Posts section reset.
          </div>
        ) : null}

        <form
          action={saveHomePostsSettings}
          className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
        >
          <section className="space-y-7 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <label className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  Enable section
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Show published articles on the homepage.
                </p>
              </div>
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={checked(settings.homePostsEnabled)}
                className="h-5 w-5 rounded border-zinc-300"
              />
            </label>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">
                  Eyebrow
                </span>
                <input
                  name="eyebrow"
                  defaultValue={settings.homePostsEyebrow}
                  className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">
                  Title
                </span>
                <input
                  name="title"
                  defaultValue={settings.homePostsTitle}
                  className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
                />
              </label>

              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-zinc-800">
                  Subtitle
                </span>
                <textarea
                  name="subtitle"
                  rows={3}
                  defaultValue={settings.homePostsSubtitle}
                  className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">
                  Number of posts
                </span>
                <select
                  name="count"
                  defaultValue={settings.homePostsCount}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm"
                >
                  {[4, 8, 12].map((count) => (
                    <option key={count} value={String(count)}>
                      {count}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">
                  Layout
                </span>
                <select
                  name="layout"
                  defaultValue={settings.homePostsLayout}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="grid4">4-column grid</option>
                  <option value="grid2">2-column grid</option>
                  <option value="list">List</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">
                  Content preview sentences
                </span>
                <select
                  name="excerptSentences"
                  defaultValue={settings.homePostsExcerptSentences}
                  className="rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm"
                >
                  {[3, 5, 8, 10].map((count) => (
                    <option key={count} value={String(count)}>
                      {count} sentences
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-zinc-800">
                  Button text
                </span>
                <input
                  name="buttonText"
                  defaultValue={settings.homePostsButtonText}
                  className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
                />
              </label>
            </div>

            <div>
              <h2 className="text-sm font-bold text-zinc-950">
                Card content
              </h2>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  ["showExcerpt", "Excerpt", settings.homePostsShowExcerpt],
                  ["showCategory", "Category", settings.homePostsShowCategory],
                  ["showAuthor", "Author", settings.homePostsShowAuthor],
                  ["showDate", "Date", settings.homePostsShowDate],
                ].map(([name, label, current]) => (
                  <label
                    key={name}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-zinc-800">
                      {label}
                    </span>
                    <input
                      type="checkbox"
                      name={name}
                      defaultChecked={checked(current)}
                      className="h-5 w-5 rounded border-zinc-300"
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Save Posts Section
            </button>
          </section>

          <aside className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Layout 1 preview
            </p>

            <div className="mt-4 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#3c0b2d,#13070f)] p-5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-pink-300">
                {settings.homePostsEyebrow || "Latest Articles"}
              </p>

              <h3 className="mt-2 text-xl font-bold leading-tight">
                {settings.homePostsTitle ||
                  "Fresh software news and trends"}
              </h3>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-lg border border-white/10 bg-white/5"
                  >
                    <div className="aspect-[16/12] bg-white/10" />
                    <div className="p-2">
                      <div className="h-2 w-12 rounded bg-pink-300/60" />
                      <div className="mt-2 h-2 w-full rounded bg-white/30" />
                      <div className="mt-1 h-2 w-3/4 rounded bg-white/15" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="mt-5 block rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-zinc-700"
            >
              Open homepage
            </a>

            <button
              formAction={resetHomePostsSettings}
              className="mt-3 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700"
            >
              Reset Posts Module
            </button>
          </aside>
        </form>
      </div>
    </main>
  );
}
