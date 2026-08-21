#!/usr/bin/env bash
set -euo pipefail

echo "=== SIRA Web v2 — Footer Design Module 1 ==="

if [ ! -f package.json ]; then
  echo "ERROR: Run this from the siraweb2 project root."
  exit 1
fi

mkdir -p app/admin/design/footer

cat > /tmp/sira-footer-block.txt <<'EOF'
      <footer
        data-footer-style={siteSettings.footerStyle}
        className="sira-footer text-white"
      >
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4 xl:gap-12">
            {siteSettings.footerShowBrand !== "false" ? (
              <section>
                <Link
                  href="/"
                  className="inline-flex items-center text-2xl font-black tracking-[0.28em] text-white"
                >
                  {siteName}
                </Link>

                <p className="mt-5 max-w-sm text-sm leading-7 text-white/70">
                  {siteSettings.footerBrandText ||
                    siteSettings.siteDescription ||
                    "Modern digital experiences, useful content and reliable services."}
                </p>

                {siteSettings.footerShowSocials !== "false" ? (
                  <div className="mt-6 flex flex-wrap gap-3">
                    {[
                      ["Instagram", siteSettings.instagramUrl],
                      ["X", siteSettings.xUrl],
                      ["Facebook", siteSettings.facebookUrl],
                      ["LinkedIn", siteSettings.linkedinUrl],
                    ]
                      .filter(([, href]) => href)
                      .map(([label, href]) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grid h-10 min-w-10 place-items-center rounded-full border border-white/15 bg-white/5 px-3 text-xs font-semibold text-white/85 transition hover:bg-white hover:text-zinc-950"
                        >
                          {label}
                        </a>
                      ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {siteSettings.footerShowQuickLinks !== "false" ? (
              <section>
                <h2 className="text-lg font-bold text-white">Quick Links</h2>
                <nav className="mt-5 grid gap-3">
                  {(footerMenu?.items.length
                    ? footerMenu.items
                    : topMenu?.items ?? []
                  ).map((item) => (
                    <Link
                      key={String(item.id)}
                      href={itemHref(item)}
                      target={item.openInNewTab ? "_blank" : undefined}
                      className="group flex items-center justify-between gap-3 text-sm text-white/75 transition hover:text-white"
                    >
                      <span>{item.label}</span>
                      <span className="text-white/35 transition group-hover:translate-x-1 group-hover:text-white">
                        →
                      </span>
                    </Link>
                  ))}
                </nav>
              </section>
            ) : null}

            <section className="space-y-8">
              {siteSettings.footerShowSocials !== "false" ? (
                <div>
                  <h2 className="text-lg font-bold text-white">Follow Us</h2>
                  <div className="mt-4 flex flex-wrap gap-x-2 gap-y-2 text-sm text-white/70">
                    {[
                      ["Instagram", siteSettings.instagramUrl],
                      ["X", siteSettings.xUrl],
                      ["Facebook", siteSettings.facebookUrl],
                      ["LinkedIn", siteSettings.linkedinUrl],
                    ]
                      .filter(([, href]) => href)
                      .map(([label, href], index, items) => (
                        <span key={label} className="inline-flex items-center gap-2">
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition hover:text-white"
                          >
                            {label}
                          </a>
                          {index < items.length - 1 ? (
                            <span className="text-white/30">•</span>
                          ) : null}
                        </span>
                      ))}
                  </div>
                </div>
              ) : null}

              {siteSettings.footerShowOffice !== "false" ? (
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {siteSettings.footerOfficeTitle || "Office"}
                  </h2>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/70">
                    {siteSettings.footerOfficeAddress ||
                      "Add office details from Admin → Design → Footer."}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="flex flex-col justify-between gap-8">
              {siteSettings.footerShowEmail !== "false" ? (
                <div>
                  <h2 className="text-lg font-bold text-white">Email</h2>
                  {siteSettings.contactEmail ? (
                    <a
                      href={`mailto:${siteSettings.contactEmail}`}
                      className="mt-3 block break-all text-sm text-white/75 transition hover:text-white"
                    >
                      {siteSettings.contactEmail}
                    </a>
                  ) : (
                    <p className="mt-3 text-sm text-white/55">
                      Add contact email in Settings.
                    </p>
                  )}
                </div>
              ) : null}

              {siteSettings.contactPhone ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                    Phone
                  </p>
                  <a
                    href={`tel:${siteSettings.contactPhone}`}
                    className="mt-2 block text-sm text-white/75 transition hover:text-white"
                  >
                    {siteSettings.contactPhone}
                  </a>
                </div>
              ) : null}
            </section>
          </div>
        </div>

        {siteSettings.footerShowCopyright !== "false" ? (
          <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-white/55 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
              <p>
                {siteSettings.footerCopyrightText ||
                  `© ${new Date().getFullYear()} ${siteName}. All Rights Reserved.`}
              </p>

              {siteSettings.footerCreditText ? (
                siteSettings.footerCreditUrl ? (
                  <a
                    href={siteSettings.footerCreditUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-white"
                  >
                    {siteSettings.footerCreditText}
                  </a>
                ) : (
                  <p>{siteSettings.footerCreditText}</p>
                )
              ) : null}
            </div>
          </div>
        ) : null}
      </footer>
EOF

python3 - <<'PY'
from pathlib import Path
import re

# Settings keys
p = Path("lib/settings/site-settings.ts")
t = p.read_text(encoding="utf-8")

if "footerStyle: string;" not in t:
    t = t.replace(
        "  layoutCardStyle: string;\n};",
        "  layoutCardStyle: string;\n"
        "  footerStyle: string;\n"
        "  footerShowBrand: string;\n"
        "  footerShowQuickLinks: string;\n"
        "  footerShowSocials: string;\n"
        "  footerShowOffice: string;\n"
        "  footerShowEmail: string;\n"
        "  footerShowCopyright: string;\n"
        "  footerBrandText: string;\n"
        "  footerOfficeTitle: string;\n"
        "  footerOfficeAddress: string;\n"
        "  footerCopyrightText: string;\n"
        "  footerCreditText: string;\n"
        "  footerCreditUrl: string;\n};",
        1,
    )

if 'footerStyle: "burgundy"' not in t:
    t = t.replace(
        '  layoutCardStyle: "elevated",\n};',
        '  layoutCardStyle: "elevated",\n'
        '  footerStyle: "burgundy",\n'
        '  footerShowBrand: "true",\n'
        '  footerShowQuickLinks: "true",\n'
        '  footerShowSocials: "true",\n'
        '  footerShowOffice: "true",\n'
        '  footerShowEmail: "true",\n'
        '  footerShowCopyright: "true",\n'
        '  footerBrandText: "",\n'
        '  footerOfficeTitle: "Office",\n'
        '  footerOfficeAddress: "",\n'
        '  footerCopyrightText: "",\n'
        '  footerCreditText: "",\n'
        '  footerCreditUrl: "",\n};',
        1,
    )

if '"footer.style"' not in t:
    t = t.replace(
        '  "layout.cardStyle": "layoutCardStyle",\n} as const;',
        '  "layout.cardStyle": "layoutCardStyle",\n'
        '  "footer.style": "footerStyle",\n'
        '  "footer.showBrand": "footerShowBrand",\n'
        '  "footer.showQuickLinks": "footerShowQuickLinks",\n'
        '  "footer.showSocials": "footerShowSocials",\n'
        '  "footer.showOffice": "footerShowOffice",\n'
        '  "footer.showEmail": "footerShowEmail",\n'
        '  "footer.showCopyright": "footerShowCopyright",\n'
        '  "footer.brandText": "footerBrandText",\n'
        '  "footer.officeTitle": "footerOfficeTitle",\n'
        '  "footer.officeAddress": "footerOfficeAddress",\n'
        '  "footer.copyrightText": "footerCopyrightText",\n'
        '  "footer.creditText": "footerCreditText",\n'
        '  "footer.creditUrl": "footerCreditUrl",\n} as const;',
        1,
    )

p.write_text(t, encoding="utf-8")

# Replace existing footer block
p = Path("app/_components/public-shell.tsx")
t = p.read_text(encoding="utf-8")
footer = Path("/tmp/sira-footer-block.txt").read_text(encoding="utf-8").rstrip()

pattern = re.compile(r'      <footer\b[\s\S]*?      </footer>')
if not pattern.search(t):
    raise SystemExit("ERROR: Existing footer block not found.")

t = pattern.sub(lambda _: footer, t, count=1)
p.write_text(t, encoding="utf-8")

print("OK: settings + real frontend footer applied")
PY

cat > app/admin/design/footer/actions.ts <<'EOF'
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on" ? "true" : "false";
}

function text(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? "").trim().slice(0, 1000) || fallback;
}

function option(formData: FormData, key: string, allowed: string[], fallback: string) {
  const value = String(formData.get(key) ?? "");
  return allowed.includes(value) ? value : fallback;
}

export async function saveFooterSettings(formData: FormData) {
  await requirePermission("roles.manage");

  const values = {
    "footer.style": option(formData, "footerStyle", ["burgundy", "dark", "light", "minimal"], "burgundy"),
    "footer.showBrand": checkbox(formData, "showBrand"),
    "footer.showQuickLinks": checkbox(formData, "showQuickLinks"),
    "footer.showSocials": checkbox(formData, "showSocials"),
    "footer.showOffice": checkbox(formData, "showOffice"),
    "footer.showEmail": checkbox(formData, "showEmail"),
    "footer.showCopyright": checkbox(formData, "showCopyright"),
    "footer.brandText": text(formData, "brandText"),
    "footer.officeTitle": text(formData, "officeTitle", "Office"),
    "footer.officeAddress": text(formData, "officeAddress"),
    "footer.copyrightText": text(formData, "copyrightText"),
    "footer.creditText": text(formData, "creditText"),
    "footer.creditUrl": text(formData, "creditUrl"),
  };

  await prisma.$transaction(
    Object.entries(values).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value, group: "footer", isPublic: true },
        create: { key, value, group: "footer", isPublic: true },
      }),
    ),
  );

  revalidateTag("site-settings", "max");
  revalidatePath("/");
  redirect("/admin/design/footer?saved=1");
}

export async function resetFooterSettings() {
  await requirePermission("roles.manage");

  await prisma.setting.deleteMany({
    where: { key: { startsWith: "footer." } },
  });

  revalidateTag("site-settings", "max");
  revalidatePath("/");
  redirect("/admin/design/footer?reset=1");
}
EOF

cat > app/admin/design/footer/page.tsx <<'EOF'
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
EOF

python3 - <<'PY'
from pathlib import Path

# Add Footer Module card to Design page
p = Path("app/admin/design/page.tsx")
t = p.read_text(encoding="utf-8")

if 'href="/admin/design/footer"' not in t:
    if 'import Link from "next/link";' not in t:
        t = 'import Link from "next/link";\n' + t

    marker = '        {query.saved === "1" ? ('
    block = (
        '        <Link\n'
        '          href="/admin/design/footer"\n'
        '          className="mb-6 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md"\n'
        '        >\n'
        '          <div>\n'
        '            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Footer Module 1</p>\n'
        '            <h2 className="mt-1 text-lg font-bold text-zinc-950">Footer Design</h2>\n'
        '            <p className="mt-1 text-sm text-zinc-600">Burgundy footer layout, sections and content.</p>\n'
        '          </div>\n'
        '          <span className="text-xl text-zinc-400">→</span>\n'
        '        </Link>\n\n'
    )
    if marker in t:
        t = t.replace(marker, block + marker, 1)

p.write_text(t, encoding="utf-8")

# Footer CSS
p = Path("app/globals.css")
t = p.read_text(encoding="utf-8")

if "SIRA Footer Design Module 1" not in t:
    t += r'''

/* === SIRA Footer Design Module 1 === */

.sira-footer {
  background:
    radial-gradient(circle at 8% 12%, rgba(255,255,255,0.10), transparent 28%),
    radial-gradient(circle at 92% 90%, rgba(255,255,255,0.06), transparent 24%),
    linear-gradient(135deg, #651138 0%, #3a0b25 42%, #170711 100%);
}

.sira-footer[data-footer-style="dark"] {
  background: #09090b;
}

.sira-footer[data-footer-style="light"] {
  background: #ffffff;
  color: #18181b;
}

.sira-footer[data-footer-style="light"] h2,
.sira-footer[data-footer-style="light"] a {
  color: #18181b;
}

.sira-footer[data-footer-style="minimal"] {
  background: #f4f4f5;
  color: #18181b;
}

.sira-footer[data-footer-style="minimal"] h2,
.sira-footer[data-footer-style="minimal"] a {
  color: #18181b;
}
'''

p.write_text(t, encoding="utf-8")

print("OK: Design card + footer styles added")
PY

rm -f /tmp/sira-footer-block.txt

echo
echo "=== Footer module audit ==="
grep -RIn \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  -E 'footer\.style|Footer Design|sira-footer|footerShowQuickLinks' \
  app lib 2>/dev/null || true

echo
echo "=== Prisma validation ==="
npx prisma validate

echo
echo "=== TypeScript ==="
npx tsc --noEmit

echo
echo "=== ESLint ==="
npm run lint

echo
echo "=== Production build ==="
npm run build

echo
echo "=== Git status ==="
git status --short

echo
echo "===================================================="
echo "FOOTER DESIGN MODULE 1 READY"
echo "  - real frontend footer implemented"
echo "  - burgundy reference-inspired layout"
echo "  - responsive 4-column desktop / stacked mobile"
echo "  - quick links from Footer Menu"
echo "  - social links from Settings"
echo "  - email / phone from Settings"
echo "  - office info configurable"
echo "  - copyright + site credit configurable"
echo "  - burgundy / dark / light / minimal styles"
echo "  - Admin route: /admin/design/footer"
echo "  - no DB migration"
echo "No commit/push performed."
echo "===================================================="
