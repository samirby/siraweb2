import type { Metadata } from "next";

import { PublicShell } from "@/app/_components/public-shell";
import { getSiteSettings } from "@/lib/settings/site-settings";
import { submitContactMessage } from "./actions";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with us.",
};

type Props = {
  searchParams: Promise<{
    sent?: string;
    error?: string;
  }>;
};

export default async function ContactPage({ searchParams }: Props) {
  const [query, settings] = await Promise.all([
    searchParams,
    getSiteSettings(),
  ]);

  return (
    <PublicShell>
      <main className="bg-zinc-50">
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <p className="public-eyebrow">Contact</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight text-zinc-950 sm:text-6xl">
              Let&apos;s start a conversation.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
              Send us a message and we&apos;ll get back to you as soon as possible.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-16">
          <div className="rounded-[1.75rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            {query.sent === "1" ? (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                Thank you. Your message has been sent successfully.
              </div>
            ) : null}

            {query.error === "validation" ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                Please enter a valid name, email and message.
              </div>
            ) : null}

            <form action={submitContactMessage} className="grid gap-5">
              <input
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-zinc-800">Name</span>
                  <input required name="name" maxLength={191} className="public-input" />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-zinc-800">Email</span>
                  <input required type="email" name="email" maxLength={191} className="public-input" />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-zinc-800">Phone</span>
                  <input name="phone" maxLength={100} className="public-input" />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-zinc-800">Subject</span>
                  <input name="subject" maxLength={255} className="public-input" />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-zinc-800">Message</span>
                <textarea
                  required
                  name="message"
                  rows={7}
                  maxLength={10000}
                  className="public-input resize-y"
                />
              </label>

              <button type="submit" className="public-button-primary w-full sm:w-auto">
                Send message
              </button>
            </form>
          </div>

          <aside className="rounded-[1.75rem] bg-zinc-950 p-7 text-white shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
              Contact details
            </p>
            <h2 className="mt-3 text-2xl font-bold">
              We&apos;re here to help.
            </h2>

            <div className="mt-8 space-y-5 text-sm text-zinc-300">
              {settings.contactEmail ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Email</p>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="mt-1 block font-semibold text-white hover:underline"
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              ) : null}

              {settings.contactPhone ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Phone</p>
                  <a
                    href={`tel:${settings.contactPhone}`}
                    className="mt-1 block font-semibold text-white hover:underline"
                  >
                    {settings.contactPhone}
                  </a>
                </div>
              ) : null}

              {settings.siteDescription ? (
                <p className="border-t border-zinc-800 pt-5 leading-6 text-zinc-400">
                  {settings.siteDescription}
                </p>
              ) : null}
            </div>
          </aside>
        </section>
      </main>
    </PublicShell>
  );
}
