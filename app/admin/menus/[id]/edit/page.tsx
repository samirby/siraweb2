import Link from "next/link";
import { notFound } from "next/navigation";

import { requirePermission } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import {
  addMenuItemAction,
  deleteMenuAction,
  deleteMenuItemAction,
  updateMenuAction,
  updateMenuItemAction,
} from "@/app/admin/menus/actions";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    saved?: string;
    itemAdded?: string;
    itemSaved?: string;
  }>;
};

export default async function EditMenuPage({
  params,
  searchParams,
}: Props) {
  await requirePermission("menus.manage");

  const { id: rawId } = await params;
  const query = await searchParams;

  let id: bigint;

  try {
    id = BigInt(rawId);
  } catch {
    notFound();
  }

  const [menu, pages, categories] = await Promise.all([
    prisma.menu.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [
            { sortOrder: "asc" },
            { id: "asc" },
          ],
        },
      },
    }),

    prisma.page.findMany({
      where: {
        status: "PUBLISHED",
      },
      orderBy: {
        title: "asc",
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    }),

    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (!menu) notFound();

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/admin/menus"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-950"
          >
            ← Menus
          </Link>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
            {menu.name}
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            {menu.location ?? "Custom menu"} · /{menu.slug}
          </p>
        </div>

        <form action={deleteMenuAction}>
          <input
            type="hidden"
            name="id"
            value={menu.id.toString()}
          />

          <button
            type="submit"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
          >
            Delete menu
          </button>
        </form>
      </div>

      {query.saved === "1" ||
      query.itemAdded === "1" ||
      query.itemSaved === "1" ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          Changes saved successfully.
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-4">
          <details className="rounded-2xl border border-zinc-200 bg-white shadow-sm" open>
            <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-zinc-950">
              Menu settings
            </summary>

            <form
              action={updateMenuAction}
              className="space-y-3 border-t border-zinc-100 p-4"
            >
              <input
                type="hidden"
                name="id"
                value={menu.id.toString()}
              />

              <input
                name="name"
                required
                defaultValue={menu.name}
                placeholder="Menu name"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />

              <input
                name="slug"
                defaultValue={menu.slug}
                placeholder="menu-slug"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />

              <select
                name="location"
                defaultValue={menu.location ?? ""}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Custom / unassigned</option>
                <option value="TOP">Top Menu</option>
                <option value="FOOTER">Footer Menu</option>
                <option value="SECONDARY">Secondary Menu</option>
              </select>

              <button
                type="submit"
                className="w-full rounded-lg bg-zinc-950 px-3 py-2 text-sm font-semibold text-white"
              >
                Save menu
              </button>
            </form>
          </details>

          <details className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-zinc-950">
              + Add menu item
            </summary>

            <form
              action={addMenuItemAction}
              className="space-y-3 border-t border-zinc-100 p-4"
            >
              <input
                type="hidden"
                name="menuId"
                value={menu.id.toString()}
              />

              <select
                name="type"
                defaultValue="PAGE"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="PAGE">Published page</option>
                <option value="CATEGORY">Category</option>
                <option value="CUSTOM_LINK">Custom link</option>
              </select>

              <input
                name="label"
                required
                placeholder="Menu label"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />

              <select
                name="pageId"
                defaultValue=""
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Select page</option>
                {pages.map((page) => (
                  <option
                    key={page.id.toString()}
                    value={page.id.toString()}
                  >
                    {page.title}
                  </option>
                ))}
              </select>

              <select
                name="categoryId"
                defaultValue=""
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option
                    key={category.id.toString()}
                    value={category.id.toString()}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              <input
                name="url"
                placeholder="Custom URL"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />

              <select
                name="parentId"
                defaultValue=""
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">No parent</option>
                {menu.items.map((item) => (
                  <option
                    key={item.id.toString()}
                    value={item.id.toString()}
                  >
                    {item.label}
                  </option>
                ))}
              </select>

              <input
                name="sortOrder"
                type="number"
                defaultValue={menu.items.length}
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />

              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    name="isEnabled"
                    type="checkbox"
                    defaultChecked
                  />
                  Enabled
                </label>

                <label className="flex items-center gap-2">
                  <input
                    name="openInNewTab"
                    type="checkbox"
                  />
                  New tab
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-zinc-950 px-3 py-2 text-sm font-semibold text-white"
              >
                Add item
              </button>
            </form>
          </details>
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-zinc-950">
              Menu items
            </h2>

            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-500">
              {menu.items.length}
            </span>
          </div>

          {menu.items.length ? (
            <div className="mt-4 space-y-2">
              {menu.items.map((item) => (
                <details
                  key={item.id.toString()}
                  className="rounded-xl border border-zinc-200 bg-zinc-50"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-3 py-3">
                    <span className="text-zinc-400">☰</span>

                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900">
                      {item.label}
                    </span>

                    <span className="rounded-md bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                      {item.type}
                    </span>

                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        item.isEnabled
                          ? "bg-emerald-500"
                          : "bg-zinc-300"
                      }`}
                      title={item.isEnabled ? "Enabled" : "Disabled"}
                    />
                  </summary>

                  <form
                    action={updateMenuItemAction}
                    className="border-t border-zinc-200 p-3"
                  >
                    <input
                      type="hidden"
                      name="id"
                      value={item.id.toString()}
                    />

                    <input
                      type="hidden"
                      name="menuId"
                      value={menu.id.toString()}
                    />

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <input
                        name="label"
                        required
                        defaultValue={item.label}
                        placeholder="Label"
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                      />

                      <select
                        name="type"
                        defaultValue={item.type}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="PAGE">Page</option>
                        <option value="CATEGORY">Category</option>
                        <option value="CUSTOM_LINK">Custom link</option>
                      </select>

                      <select
                        name="pageId"
                        defaultValue={item.pageId?.toString() ?? ""}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">No page</option>
                        {pages.map((page) => (
                          <option
                            key={page.id.toString()}
                            value={page.id.toString()}
                          >
                            {page.title}
                          </option>
                        ))}
                      </select>

                      <select
                        name="categoryId"
                        defaultValue={item.categoryId?.toString() ?? ""}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">No category</option>
                        {categories.map((category) => (
                          <option
                            key={category.id.toString()}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>

                      <input
                        name="url"
                        defaultValue={item.url ?? ""}
                        placeholder="Custom URL"
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                      />

                      <select
                        name="parentId"
                        defaultValue={item.parentId?.toString() ?? ""}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">No parent</option>
                        {menu.items
                          .filter((candidate) => candidate.id !== item.id)
                          .map((candidate) => (
                            <option
                              key={candidate.id.toString()}
                              value={candidate.id.toString()}
                            >
                              {candidate.label}
                            </option>
                          ))}
                      </select>

                      <input
                        name="sortOrder"
                        type="number"
                        defaultValue={item.sortOrder}
                        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
                      />

                      <div className="flex flex-wrap items-center gap-4 px-1 text-sm sm:col-span-2">
                        <label className="flex items-center gap-2">
                          <input
                            name="isEnabled"
                            type="checkbox"
                            defaultChecked={item.isEnabled}
                          />
                          Enabled
                        </label>

                        <label className="flex items-center gap-2">
                          <input
                            name="openInNewTab"
                            type="checkbox"
                            defaultChecked={item.openInNewTab}
                          />
                          New tab
                        </label>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="submit"
                        className="rounded-lg bg-zinc-950 px-3 py-2 text-xs font-semibold text-white"
                      >
                        Save
                      </button>

                      <button
                        type="submit"
                        formAction={deleteMenuItemAction}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </form>
                </details>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-zinc-50 p-8 text-center text-sm text-zinc-500">
              No menu items yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
