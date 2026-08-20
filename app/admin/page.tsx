import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              SIRA CMS
            </p>

            <h1 className="text-xl font-semibold text-zinc-950">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900">
                {session.user.name ?? "Administrator"}
              </p>

              <p className="text-xs text-zinc-500">
                {session.user.email}
              </p>
            </div>

            <form
              action={async () => {
                "use server";

                await signOut({
                  redirectTo: "/admin/login",
                });
              }}
            >
              <button
                type="submit"
                className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-950">
            Welcome back
          </h2>

          <p className="mt-2 text-zinc-600">
            SIRA Web Content Management System
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Pages", "0"],
            ["Posts", "0"],
            ["Media", "0"],
            ["Messages", "0"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium text-zinc-500">
                {label}
              </p>

              <p className="mt-3 text-4xl font-bold tracking-tight text-zinc-950">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
