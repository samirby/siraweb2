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
              Choose logo and favicon from the existing Media Library.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Site logo
              </span>

              <select
                name="logoMediaId"
                defaultValue={settings.logoMediaId}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
              >
                <option value="">Use site name as text</option>
                {images.map((image) => (
                  <option
                    key={image.id.toString()}
                    value={image.id.toString()}
                  >
                    {image.altText || image.originalName}
                  </option>
                ))}
              </select>

              {settings.logoMediaId ? (
                <div className="mt-3 flex h-16 items-center rounded-xl border border-zinc-200 bg-zinc-50 px-4">
                  <img
                    src={`/media/${settings.logoMediaId}`}
                    alt="Current site logo"
                    className="max-h-10 max-w-[220px] object-contain"
                  />
                </div>
              ) : null}
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-zinc-800">
                Favicon
              </span>

              <select
                name="faviconMediaId"
                defaultValue={settings.faviconMediaId}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
              >
                <option value="">Use default favicon</option>
                {images.map((image) => (
                  <option
                    key={image.id.toString()}
                    value={image.id.toString()}
                  >
                    {image.altText || image.originalName}
                  </option>
                ))}
              </select>

              {settings.faviconMediaId ? (
                <div className="mt-3 flex h-16 items-center rounded-xl border border-zinc-200 bg-zinc-50 px-4">
                  <img
                    src={`/media/${settings.faviconMediaId}`}
                    alt="Current favicon"
                    className="h-10 w-10 rounded object-contain"
                  />
                </div>
              ) : null}
            </label>
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
