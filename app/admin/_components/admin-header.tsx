import { signOut } from "@/auth";

export function AdminHeader({ name, email }: { name?: string | null; email?: string | null }) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="flex min-h-16 items-center justify-between gap-4 px-5 sm:px-7">
        <div>
          <p className="text-sm font-semibold text-zinc-950">{name ?? "Administrator"}</p>
          <p className="text-xs text-zinc-500">{email ?? ""}</p>
        </div>
        <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
          <button type="submit" className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
