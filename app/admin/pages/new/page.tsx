import Link from "next/link";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { createPageAction } from "../actions";
import { PageForm } from "../_components/page-form";

export const dynamic = "force-dynamic";

export default async function NewPagePage() {
  await requirePermission("pages.create");

  const media = await prisma.media.findMany({
    where: {
      type: "IMAGE",
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      url: true,
      originalName: true,
      altText: true,
      folder: true,
    },
    take: 300,
  });

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-6">
        <Link
          href="/admin/pages"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
        >
          ← Pages
        </Link>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
          Add New Page
        </h1>
      </div>

      <PageForm
        action={createPageAction}
        submitLabel="Create page"
        media={media.map((item) => ({
          ...item,
          id: item.id.toString(),
        }))}
      />
    </main>
  );
}
