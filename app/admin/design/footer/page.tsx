import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { getSiteSettings } from "@/lib/settings/site-settings";
import { resetFooterSettings, saveFooterSettings } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ saved?: string; reset?: string }>;
};

function checked(value: string) {
  return value !== "false";
}

export default async function AdminFooterDesignPage({ searchParams }: Props) {
  await requirePermission("roles.manage");

  const [settings, query] = await Promise.all([
    getSiteSettings(),
    searchParams,
  ]);

  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <Link href="/admin/design" className="text-sm font-semibold text-zinc-500 hover:text-zinc-950">
            ← Design
          </Link>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Footer Module 1
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
            Footer Design
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Configure the footer that appears on every public page.
          </p>
        </header>

        {query.saved === "1" ? (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Footer settings saved.
          </div>
        ) : null}

        {query.reset === "1" ? (
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Footer module reset.
          </div>
        ) : null}

        <form action={saveFooterSettings} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="space-y-7 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-zinc-950">Footer style</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["burgundy", "Burgundy Gradient"],
                  ["dark", "Dark Solid"],
                  ["light", "Light"],
                  ["minimal", "Minimal"],
                ].map(([value, label]) => (
                  <label key={value} className="cursor-pointer rounded-xl border border-zinc-200 p-3">
                    <input
                      type="radio"
                      name="footerStyle"
                      value={value}
                      defaultChecked={settings.footerStyle === value}
                      className="sr-only peer"
                    />
                    <div
                      className={`h-16 rounded-lg border peer-checked:ring-2 peer-checked:ring-zinc-950 ${
                        value === "burgundy"
                          ? "bg-[linear-gradient(135deg,#651138,#170711)]"
                          : value === "dark"
                            ? "bg-zinc-950"
                            : value === "light"
                              ? "bg-white"
                              : "bg-zinc-100"
                      }`}
                    />
                    <p className="mt-2 text-xs font-semibold text-zinc-700">{label}</p>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-zinc-950">Footer sections</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["showBrand", "Brand / description", settings.footerShowBrand],
                  ["showQuickLinks", "Quick links", settings.footerShowQuickLinks],
                  ["showSocials", "Social links", settings.footerShowSocials],
                  ["showOffice", "Office info", settings.footerShowOffice],
                  ["showEmail", "Email / phone", settings.footerShowEmail],
                  ["showCopyright", "Copyright bar", settings.footerShowCopyright],
                ].map(([name, label, current]) => (
                  <label key={name} className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 px-4 py-3">
                    <span className="text-sm font-semibold text-zinc-800">{label}</span>
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

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-zinc-800">Brand description</span>
                <textarea
                  name="brandText"
                  rows={3}
                  defaultValue={settings.footerBrandText}
                  placeholder={settings.siteDescription || "Short footer description"}
                  className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">Office title</span>
                <input
                  name="officeTitle"
                  defaultValue={settings.footerOfficeTitle}
                  className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
                />
              </label>

              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-zinc-800">Office address</span>
                <textarea
                  name="officeAddress"
                  rows={3}
                  defaultValue={settings.footerOfficeAddress}
                  placeholder="Street, office, city, country"
                  className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
                />
              </label>

              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-zinc-800">Copyright text</span>
                <input
                  name="copyrightText"
                  defaultValue={settings.footerCopyrightText}
                  placeholder="© 2026. All Rights Reserved."
                  className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">Credit text</span>
                <input
                  name="creditText"
                  defaultValue={settings.footerCreditText}
                  placeholder="Site by ..."
                  className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">Credit URL</span>
                <input
                  name="creditUrl"
                  defaultValue={settings.footerCreditUrl}
                  placeholder="https://..."
                  className="rounded-xl border border-zinc-300 px-3 py-2.5 text-sm"
                />
              </label>
            </div>

            <button type="submit" className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white">
              Save Footer
            </button>
          </section>

          <aside className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Footer Layout 1
            </p>

            <div className="mt-4 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#651138,#170711)] p-5 text-white">
              <p className="text-xl font-black tracking-[0.25em]">{settings.siteName}</p>
              <p className="mt-2 text-xs leading-5 text-white/65">
                {settings.footerBrandText || settings.siteDescription || "Your brand description"}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4 text-xs text-white/70">
                <div>
                  <p className="font-bold text-white">Quick Links</p>
                  <p className="mt-2">Home</p>
                  <p>Services</p>
                  <p>Contact</p>
                </div>
                <div>
                  <p className="font-bold text-white">Email</p>
                  <p className="mt-2 break-all">
                    {settings.contactEmail || "email@example.com"}
                  </p>
                </div>
              </div>
            </div>

            <a href="/" target="_blank" rel="noreferrer" className="mt-5 block rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-zinc-700">
              Open frontend
            </a>

            <button formAction={resetFooterSettings} className="mt-3 w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700">
              Reset Footer Module
            </button>
          </aside>
        </form>
      </div>
    </main>
  );
}
