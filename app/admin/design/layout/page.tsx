import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { getSiteSettings } from "@/lib/settings/site-settings";
import { resetLayoutSettings, saveLayoutSettings } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ saved?: string; reset?: string }>;
};

function checked(value: string) {
  return value !== "false";
}

export default async function AdminDesignLayoutPage({ searchParams }: Props) {
  await requirePermission("roles.manage");

  const [settings, query] = await Promise.all([
    getSiteSettings(),
    searchParams,
  ]);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <Link href="/admin/design" className="text-sm font-semibold text-zinc-500 hover:text-zinc-950">
            ← Design
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Module 2
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
            Homepage Layout
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Keep Module 1 as-is and control homepage sections separately.
          </p>
        </header>

        {query.saved === "1" ? (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Layout settings saved.
          </div>
        ) : null}

        {query.reset === "1" ? (
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Module 2 reset.
          </div>
        ) : null}

        <form action={saveLayoutSettings} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-zinc-950">Homepage sections</h2>

            <div className="mt-5 grid gap-3">
              {[
                ["showTrustStrip", "Trust / benefits strip", settings.layoutShowTrustStrip],
                ["showServices", "Services", settings.layoutShowServices],
                ["showCategories", "Categories", settings.layoutShowCategories],
                ["showLatestPosts", "Latest articles", settings.layoutShowLatestPosts],
                ["showBottomCta", "Bottom contact CTA", settings.layoutShowBottomCta],
              ].map(([name, label, value]) => (
                <label key={name} className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3">
                  <span className="text-sm font-semibold text-zinc-800">{label}</span>
                  <input
                    type="checkbox"
                    name={name}
                    defaultChecked={checked(value)}
                    className="h-5 w-5 rounded border-zinc-300"
                  />
                </label>
              ))}
            </div>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">Hero style</span>
                <select name="heroStyle" defaultValue={settings.layoutHeroStyle} className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm">
                  <option value="brand">Brand / dark</option>
                  <option value="light">Light</option>
                  <option value="minimal">Minimal</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">Card style</span>
                <select name="cardStyle" defaultValue={settings.layoutCardStyle} className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm">
                  <option value="elevated">Elevated</option>
                  <option value="flat">Flat</option>
                  <option value="bordered">Bordered</option>
                </select>
              </label>
            </div>

            <button type="submit" className="mt-6 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">
              Save Module 2
            </button>
          </section>

          <aside className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Independent module
            </p>
            <h2 className="mt-2 text-xl font-bold text-zinc-950">
              Layout only
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              Module 1 keeps colors, fonts and visual theme. Module 2 controls homepage layout.
            </p>
            <a href="/" target="_blank" rel="noreferrer" className="mt-5 block rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-zinc-700">
              Open homepage
            </a>
            <button formAction={resetLayoutSettings} className="mt-3 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700">
              Reset Module 2
            </button>
          </aside>
        </form>
      </div>
    </main>
  );
}
