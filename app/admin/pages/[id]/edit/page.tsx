import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import {
  deletePageAction,
  togglePagePublishAction,
  updatePageAction,
} from "../../actions";
import { PageForm } from "../../_components/page-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
};

export default async function EditPagePage({
  params,
  searchParams,
}: Props) {
  await requirePermission("pages.update");

  const { id: rawId } = await params;
  const query = await searchParams;

  let id: bigint;

  try {
    id = BigInt(rawId);
  } catch {
    notFound();
  }

  const page = await prisma.page.findUnique({
    where: { id },
  });

  if (!page) {
    notFound();
  }

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/pages"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
          >
            ← Pages
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
            Edit Page
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            /{page.slug}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {page.status === "PUBLISHED" ? (
            <Link
              href={`/${page.slug}`}
              target="_blank"
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700"
            >
              View page
            </Link>
          ) : null}

          <form action={togglePagePublishAction}>
            <input type="hidden" name="id" value={page.id.toString()} />
            <button
              type="submit"
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700"
            >
              {page.status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </button>
          </form>

          <form action={deletePageAction}>
            <input type="hidden" name="id" value={page.id.toString()} />
            <button
              type="submit"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      {query.saved === "1" ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Page saved successfully.
        </div>
      ) : null}

      <PageForm
        action={updatePageAction}
        submitLabel="Save changes"
        value={{
          id: page.id.toString(),
          title: page.title,
          slug: page.slug,
          status: page.status,
          pageType: page.pageType,
          template: page.template,
          excerpt: page.excerpt,
          content: page.content,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          canonicalUrl: page.canonicalUrl,
          noIndex: page.noIndex,
        }}
      />
    </main>
  );
}
