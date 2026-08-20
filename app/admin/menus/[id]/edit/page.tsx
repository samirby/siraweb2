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
        slug: true,
      },
    }),
  ]);

  if (!menu) notFound();

  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
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
          <input type="hidden" name="id" value={menu.id.toString()} />
          <button
            type="submit"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700"
          >
            Delete menu
          </button>
        </form>
      </div>

      {query.saved === "1" ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Menu saved.
        </div>
      ) : null}

      {query.itemAdded === "1" ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Menu item added.
        </div>
      ) : null}

      {query.itemSaved === "1" ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          Menu item saved.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <form
            action={updateMenuAction}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <input type="hidden" name="id" value={menu.id.toString()} />

            <h2 className="text-lg font-bold text-zinc-950">
              Menu settings
            </h2>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-zinc-800">
                Name
              </span>
              <input
                name="name"
                required
                defaultValue={menu.name}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-zinc-800">
                Slug
              </span>
              <input
                name="slug"
                defaultValue={menu.slug}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3 outline-none focus:border-zinc-950"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-zinc-800">
                Location
              </span>
              <select
                name="location"
                defaultValue={menu.location ?? ""}
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
              >
                <option value="">Custom / unassigned</option>
                <option value="TOP">Top Menu</option>
                <option value="FOOTER">Footer Menu</option>
                <option value="SECONDARY">Secondary Menu</option>
              </select>
            </label>

            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white"
            >
              Save menu
            </button>
          </form>

          <form
            action={addMenuItemAction}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <input
              type="hidden"
              name="menuId"
              value={menu.id.toString()}
            />

            <h2 className="text-lg font-bold text-zinc-950">
              Add menu item
            </h2>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-zinc-800">
                Type
              </span>
              <select
                name="type"
                defaultValue="PAGE"
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
              >
                <option value="PAGE">Published page</option>
                <option value="CATEGORY">Category</option>
                <option value="CUSTOM_LINK">Custom link</option>
              </select>
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-zinc-800">
                Label
              </span>
              <input
                name="label"
                required
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-zinc-800">
                Page
              </span>
              <select
                name="pageId"
                defaultValue=""
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
              >
                <option value="">Select page</option>
                {pages.map((page) => (
                  <option
                    key={page.id.toString()}
                    value={page.id.toString()}
                  >
                    {page.title} (/{page.slug})
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-zinc-800">
                Category
              </span>
              <select
                name="categoryId"
                defaultValue=""
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
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
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-zinc-800">
                Custom URL
              </span>
              <input
                name="url"
                placeholder="https://... or /path"
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-zinc-800">
                Parent item
              </span>
              <select
                name="parentId"
                defaultValue=""
                className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3"
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
            </label>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-zinc-800">
                Sort order
              </span>
              <input
                name="sortOrder"
                type="number"
                defaultValue={menu.items.length}
                className="mt-2 w-full rounded-xl border border-zinc-300 px-4 py-3"
              />
            </label>

            <label className="mt-5 flex items-center gap-3">
              <input
                name="isEnabled"
                type="checkbox"
                defaultChecked
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-zinc-700">
                Enabled
              </span>
            </label>

            <label className="mt-3 flex items-center gap-3">
              <input
                name="openInNewTab"
                type="checkbox"
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-zinc-700">
                Open in new tab
              </span>
            </label>

            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm font-semibold text-white"
            >
              Add item
            </button>
          </form>
        </div>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">
            Menu items
          </h2>

          {menu.items.length ? (
            <div className="mt-5 space-y-4">
              {menu.items.map((item) => (
                <form
                  key={item.id.toString()}
                  action={updateMenuItemAction}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Label
                      </span>
                      <input
                        name="label"
                        required
                        defaultValue={item.label}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Type
                      </span>
                      <select
                        name="type"
                        defaultValue={item.type}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5"
                      >
                        <option value="PAGE">Page</option>
                        <option value="CATEGORY">Category</option>
                        <option value="CUSTOM_LINK">Custom link</option>
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Page
                      </span>
                      <select
                        name="pageId"
                        defaultValue={item.pageId?.toString() ?? ""}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5"
                      >
                        <option value="">None</option>
                        {pages.map((page) => (
                          <option
                            key={page.id.toString()}
                            value={page.id.toString()}
                          >
                            {page.title}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Category
                      </span>
                      <select
                        name="categoryId"
                        defaultValue={item.categoryId?.toString() ?? ""}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5"
                      >
                        <option value="">None</option>
                        {categories.map((category) => (
                          <option
                            key={category.id.toString()}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Custom URL
                      </span>
                      <input
                        name="url"
                        defaultValue={item.url ?? ""}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5"
                      />
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Parent
                      </span>
                      <select
                        name="parentId"
                        defaultValue={item.parentId?.toString() ?? ""}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5"
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
                    </label>

                    <label className="block">
                      <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Sort order
                      </span>
                      <input
                        name="sortOrder"
                        type="number"
                        defaultValue={item.sortOrder}
                        className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5"
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-5 pt-6">
                      <label className="flex items-center gap-2">
                        <input
                          name="isEnabled"
                          type="checkbox"
                          defaultChecked={item.isEnabled}
                        />
                        <span className="text-sm text-zinc-700">
                          Enabled
                        </span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          name="openInNewTab"
                          type="checkbox"
                          defaultChecked={item.openInNewTab}
                        />
                        <span className="text-sm text-zinc-700">
                          New tab
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="submit"
                      className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Save item
                    </button>

                    <button
                      type="submit"
                      formAction={deleteMenuItemAction}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700"
                    >
                      Delete item
                    </button>
                  </div>
                </form>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-zinc-50 p-8 text-center text-sm text-zinc-500">
              This menu does not contain items yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
