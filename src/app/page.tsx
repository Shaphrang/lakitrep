import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">La Ki Trep Resort</p>
        <h1 className="text-2xl font-semibold">Admin workspace is ready</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Public website is intentionally deferred. Continue to the admin panel to manage resort data.
        </p>
        <Link
          href="/admin/login"
          className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Open Admin Login
        </Link>
      </div>
    </main>
  );
}
