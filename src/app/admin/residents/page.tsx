'use client';

export default function AdminResidentsPage() {
  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Directory</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Residents</h1>
          <p className="max-w-2xl text-slate-600">
            Resident management UI placeholder. Add API endpoints and we’ll connect search, approvals, and profiles.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Coming soon</p>
              <p className="mt-1 text-sm text-slate-600">
                Resident list, filters, and actions will live here.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              UI ready
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="h-24 rounded-2xl border border-slate-200 bg-white shadow-sm" />
            <div className="h-24 rounded-2xl border border-slate-200 bg-white shadow-sm" />
          </div>
        </div>
      </div>
    </main>
  );
}

