import { prisma } from "@/lib/db/prisma";
export const dynamic = "force-dynamic";

export default async function MessagesAdminPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <main className="px-5 py-8 sm:px-7 lg:px-10">
      <p className="text-sm font-medium text-zinc-500">Inbox</p><h1 className="mt-1 text-3xl font-bold text-zinc-950">Messages</h1>
      <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        {messages.length ? <div className="divide-y divide-zinc-100">{messages.map((m) => <article key={m.id.toString()} className="p-5"><div className="flex justify-between gap-3"><div><h2 className="font-semibold">{m.subject ?? "Contact message"}</h2><p className="text-sm text-zinc-500">{m.name} · {m.email}</p></div><span className="text-xs font-semibold text-zinc-500">{m.status}</span></div><p className="mt-3 text-sm text-zinc-700">{m.message}</p></article>)}</div> : <div className="p-10 text-center text-sm text-zinc-500">No messages yet.</div>}
      </div>
    </main>
  );
}
