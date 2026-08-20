import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import {
  deleteTagAction,
  updateTagAction,
} from "@/app/admin/tags/actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditTagPage({ params }: Props) {
  await requirePermission("posts.update");

  const { id: rawId } = await params;

  let id: bigint;

  try {
    id = BigInt(rawId);
  } catch {
    notFound();
  }

  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  if (!tag) notFound();

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/admin/tags" className="text-sm font-medium text-zinc-500">
        ← Tags
      </Link>

      <div className="mt-3 max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
          Edit Tag
        </h1>

        <form
          action={updateTagAction}
          className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <input type="hidden" name="id" value={tag.id.toString()} />

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">Name</span>
            <input
              name="name"
              required
              defaultValue={tag.name}
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-zinc-800">Slug</span>
            <input
              name="slug"
              defaultValue={tag.slug}
              className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white"
            >
              Save tag
            </button>

            <Link
              href={`/tag/${tag.slug}`}
              target="_blank"
              className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm font-semibold text-zinc-700"
            >
              View tag
            </Link>
          </div>
        </form>

        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-600">
            {tag._count.posts} post relation(s)
          </p>

          <form action={deleteTagAction} className="mt-4">
            <input type="hidden" name="id" value={tag.id.toString()} />
            <button
              type="submit"
              disabled={tag._count.posts > 0}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 disabled:opacity-40"
            >
              Delete tag
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
