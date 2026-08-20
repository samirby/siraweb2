import { signOut } from "@/auth";
import { AdminMobileNav } from "./admin-mobile-nav";

type Props = {
  name?: string | null;
  email?: string | null;
  permissions: string[];
};

export function AdminHeader({ name, email, permissions }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-3 px-3 sm:px-5 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <AdminMobileNav permissions={permissions} />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-950">
              {name ?? "Administrator"}
            </p>
            <p className="hidden truncate text-xs text-zinc-500 sm:block">
              {email ?? ""}
            </p>
          </div>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
          className="shrink-0"
        >
          <button
            type="submit"
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 sm:px-4"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
