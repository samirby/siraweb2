import { prisma } from "@/lib/db/prisma";
export const dynamic = "force-dynamic";

export default async function SettingsAdminPage() {
  const settings = await prisma.setting.findMany({ orderBy: [{ group: "asc" }, { key: "asc" }] });
  return (
    <main className="px-5 py-8 sm:px-7 lg:px-10">
      <p className="text-sm font-medium text-zinc-500">System</p><h1 className="mt-1 text-3xl font-bold text-zinc-950">Settings</h1>
      <div className="mt-6 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white shadow-sm">{settings.map((s) => <div key={s.id.toString()} className="px-5 py-4"><div className="flex justify-between gap-3"><div><p className="font-semibold">{s.key}</p><p className="text-xs uppercase text-zinc-400">{s.group}</p></div><span className="text-xs text-zinc-500">{s.isPublic ? "Public" : "Private"}</span></div><pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-50 p-3 text-xs text-zinc-600">{JSON.stringify(s.value)}</pre></div>)}</div>
    </main>
  );
}
