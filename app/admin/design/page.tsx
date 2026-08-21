import Link from "next/link";
import { requirePermission } from "@/lib/auth/permissions";
import { getSiteSettings } from "@/lib/settings/site-settings";
import { resetDesignSettings, saveDesignSettings } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    saved?: string;
    reset?: string;
  }>;
};

const fonts = ["Arial", "Georgia", "Verdana", "Tahoma", "Trebuchet MS"];

export default async function AdminDesignPage({ searchParams }: Props) {
  await requirePermission("roles.manage");

  const [settings, query] = await Promise.all([
    getSiteSettings(),
    searchParams,
  ]);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Website
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
            Design
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Manage the visual theme of the public website without editing code.
          </p>
        </header>

        <Link
          href="/admin/design/layout"
          className="mb-6 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Module 2</p>
            <h2 className="mt-1 text-lg font-bold text-zinc-950">Homepage Layout</h2>
            <p className="mt-1 text-sm text-zinc-600">Section visibility and layout variants.</p>
          </div>
          <span className="text-xl text-zinc-400">→</span>
        </Link>

        <Link
          href="/admin/design/footer"
          className="mb-6 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Footer Module 1</p>
            <h2 className="mt-1 text-lg font-bold text-zinc-950">Footer Design</h2>
            <p className="mt-1 text-sm text-zinc-600">Burgundy footer layout, sections and content.</p>
          </div>
          <span className="text-xl text-zinc-400">→</span>
        </Link>

        {query.saved === "1" ? (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Design settings saved.
          </div>
        ) : null}

        {query.reset === "1" ? (
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Design reset to defaults.
          </div>
        ) : null}

        <form
          action={saveDesignSettings}
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
        >
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-zinc-950">Theme settings</h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {[
                ["primaryColor", "Primary color", settings.designPrimaryColor],
                ["secondaryColor", "Secondary color", settings.designSecondaryColor],
                ["backgroundColor", "Background color", settings.designBackgroundColor],
                ["textColor", "Text color", settings.designTextColor],
              ].map(([name, label, current]) => (
                <label key={name} className="grid gap-2">
                  <span className="text-sm font-semibold text-zinc-800">{label}</span>
                  <input
                    type="color"
                    name={name}
                    defaultValue={current}
                    className="h-11 w-full rounded-lg border border-zinc-300 bg-white p-1"
                  />
                </label>
              ))}

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">Heading font</span>
                <select
                  name="headingFont"
                  defaultValue={settings.designHeadingFont}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
                >
                  {fonts.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">Body font</span>
                <select
                  name="bodyFont"
                  defaultValue={settings.designBodyFont}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
                >
                  {fonts.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">Border radius</span>
                <select
                  name="borderRadius"
                  defaultValue={settings.designBorderRadius}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="0px">Square</option>
                  <option value="8px">Small - 8px</option>
                  <option value="12px">Medium - 12px</option>
                  <option value="16px">Rounded - 16px</option>
                  <option value="24px">Large - 24px</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">Container width</span>
                <select
                  name="containerWidth"
                  defaultValue={settings.designContainerWidth}
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="1024px">Compact - 1024px</option>
                  <option value="1152px">Medium - 1152px</option>
                  <option value="1280px">Standard - 1280px</option>
                  <option value="1440px">Wide - 1440px</option>
                  <option value="1600px">Extra wide - 1600px</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Save design
            </button>
          </section>

          <aside className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Current preview
            </p>

            <div
              style={{
                background: settings.designBackgroundColor,
                color: settings.designTextColor,
                borderRadius: settings.designBorderRadius,
              }}
              className="mt-4 overflow-hidden border border-zinc-200 p-5"
            >
              <p
                style={{ fontFamily: settings.designHeadingFont }}
                className="text-xl font-bold"
              >
                Website heading
              </p>
              <p
                style={{ fontFamily: settings.designBodyFont }}
                className="mt-2 text-sm opacity-70"
              >
                Your content will use the selected typography and colors.
              </p>
              <div
                style={{
                  background: settings.designPrimaryColor,
                  borderRadius: settings.designBorderRadius,
                }}
                className="mt-4 inline-flex px-4 py-2 text-sm font-semibold text-white"
              >
                Primary button
              </div>
            </div>

            <button
              formAction={resetDesignSettings}
              className="mt-5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
            >
              Reset defaults
            </button>
          </aside>
        </form>
      </div>
    </main>
  );
}
