import { MediaPicker } from "@/app/admin/_components/media-picker";
import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getSiteSettings } from "@/lib/settings/site-settings";
import { saveSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    saved?: string;
  }>;
};

export default async function SettingsAdminPage({
  searchParams,
}: Props) {
  await requirePermission("roles.manage");

  const query = await searchParams;

  const [settings, images] = await Promise.all([
    getSiteSettings(),
    prisma.media.findMany({
      where: { type: "IMAGE" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        url: true,
        originalName: true,
        altText: true,
      },
    }),
  ]);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-medium text-zinc-500">
          System
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-950">
          Settings
        </h1>

        <p className="mt-2 text-sm text-zinc-600">
          Configure the public site identity, SEO, contact details and footer.
        </p>
      </div>

      {query.saved === "1" ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Settings saved successfully.
        </div>
      ) : null}

      <form action={saveSettingsAction} className="space-y-5">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-zinc-950">
              General
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Main public website identity.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Site name
              </span>
              <input
                name="siteName"
                required
                defaultValue={settings.siteName}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Site URL
              </span>
              <input
                name="siteUrl"
                type="url"
                placeholder="https://example.com"
                defaultValue={settings.siteUrl}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </label>

            <label className="block lg:col-span-2">
              <span className="text-sm font-semibold text-zinc-800">
                Site description
              </span>
              <textarea
                name="siteDescription"
                rows={3}
                defaultValue={settings.siteDescription}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-zinc-950">
              Branding
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Choose from Media Library or upload a new image.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <MediaPicker
              name="logoMediaId"
              label="Site logo"
              items={images.map((image) => ({
                id: image.id.toString(),
                url: image.url,
                name: image.originalName,
                alt: image.altText,
              }))}
              defaultValue={settings.logoMediaId}
              folder="branding"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              helpText="Used in the public website header."
            />

            <MediaPicker
              name="faviconMediaId"
              label="Favicon"
              items={images.map((image) => ({
                id: image.id.toString(),
                url: image.url,
                name: image.originalName,
                alt: image.altText,
              }))}
              defaultValue={settings.faviconMediaId}
              folder="branding"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              helpText="Square images work best for browser tabs."
            />
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-zinc-950">
              SEO Defaults
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Used when a page does not define its own SEO metadata.
            </p>
          </div>

          <div className="grid gap-4">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Default title
              </span>
              <input
                name="seoDefaultTitle"
                maxLength={191}
                defaultValue={settings.seoDefaultTitle}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Default description
              </span>
              <textarea
                name="seoDefaultDescription"
                maxLength={500}
                rows={3}
                defaultValue={settings.seoDefaultDescription}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-zinc-950">
              Contact
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Contact email
              </span>
              <input
                name="contactEmail"
                type="email"
                defaultValue={settings.contactEmail}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Contact phone
              </span>
              <input
                name="contactPhone"
                defaultValue={settings.contactPhone}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-zinc-950">
              Social Links
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {[
              ["Facebook", "facebookUrl", settings.facebookUrl],
              ["Instagram", "instagramUrl", settings.instagramUrl],
              ["LinkedIn", "linkedinUrl", settings.linkedinUrl],
              ["X / Twitter", "xUrl", settings.xUrl],
            ].map(([label, name, value]) => (
              <label key={name} className="block">
                <span className="text-sm font-semibold text-zinc-800">
                  {label}
                </span>
                <input
                  name={name}
                  type="url"
                  defaultValue={value}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-zinc-950">
              Footer
            </h2>
          </div>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">
              Footer text
            </span>
            <input
              name="footerText"
              defaultValue={settings.footerText}
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </label>
        </section>

        <div className="sticky bottom-4 flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-lg"
          >
            Save settings
          </button>
        </div>
      </form>
    </main>
  );
}
