'use client';

export default function SecurityDashboardPage() {
  return (
    <main>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Security Dashboard</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Welcome to the security module. Visitor check-in, approvals, and profile tools will appear here.
        </p>
      </div>
    </main>
  );
}
