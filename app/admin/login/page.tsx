import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
            SIRA CMS
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
            Administration
          </h1>

          <p className="mt-2 text-sm text-zinc-600">
            Sign in to manage your website.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          SIRA Web Content Management System
        </p>
      </div>
    </main>
  );
}
