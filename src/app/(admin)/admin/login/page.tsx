export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">Temporary login placeholder for admin_users authentication flow.</p>
        <form className="mt-5 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Email</span>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="email" placeholder="admin@lakitrep.com" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-slate-700">Password</span>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="password" placeholder="••••••••" />
          </label>
          <button className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" type="button">
            Sign In (Demo)
          </button>
        </form>
      </div>
    </main>
  );
}
