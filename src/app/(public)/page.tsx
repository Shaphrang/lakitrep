import Link from "next/link";

export default function PublicHomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">La Ki Trep Resort</h1>
      <p className="text-slate-600">Public website placeholder. Build-out comes after admin modules.</p>
      <Link className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" href="/admin">
        Go to Admin Dashboard
      </Link>
    </main>
  );
}
