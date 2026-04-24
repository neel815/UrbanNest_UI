'use client';

export default function AdminSecurityPage() {
  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Operations</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Security</h1>
          <p className="max-w-2xl text-slate-600">
            Security management UI placeholder. Add API endpoints and we’ll connect guards, shifts, and logs.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Coming soon</p>
              <p className="mt-1 text-sm text-slate-600">Guard roster, schedules, and visitor logs will live here.</p>
            </div>
            <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
              UI ready
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="h-24 rounded-2xl border border-slate-200 bg-white shadow-sm" />
            <div className="h-24 rounded-2xl border border-slate-200 bg-white shadow-sm" />
            <div className="h-24 rounded-2xl border border-slate-200 bg-white shadow-sm" />
          </div>
        </div>
      </div>
    </main>
  );
}

