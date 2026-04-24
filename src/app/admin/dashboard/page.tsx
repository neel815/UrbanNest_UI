'use client';

export default function AdminDashboardPage() {
  const cards = [
    {
      title: 'Residents',
      subtitle: 'Directory & approvals',
      accent: 'from-amber-500 to-orange-500',
      icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M12 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    },
    {
      title: 'Security',
      subtitle: 'Guards & shifts',
      accent: 'from-teal-500 to-emerald-500',
      icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
    },
    {
      title: 'Announcements',
      subtitle: 'Broadcast updates',
      accent: 'from-slate-700 to-slate-900',
      icon: 'M4 11V9a2 2 0 0 1 2-2h3l5-3v16l-5-3H6a2 2 0 0 1-2-2v-2',
    },
  ];

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Operations</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Admin dashboard</h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Ready
            </div>
          </div>
          <p className="max-w-2xl text-slate-600">
            A clean starting point for the Admin portal. Hook these cards up to real data when backend endpoints are ready.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.accent}`} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                  <p className="text-xs text-slate-500">{card.subtitle}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-900 text-white shadow-sm">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                    <path
                      d={card.icon}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              <p className="mt-6 text-sm text-slate-600">
                Coming soon.
              </p>
              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur lg:col-span-2">
            <p className="text-sm font-semibold text-slate-900">Quick actions</p>
            <p className="mt-1 text-sm text-slate-600">Jump into common admin workflows.</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href="/admin/residents"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">Manage residents</p>
                <p className="mt-1 text-sm text-slate-600">Approve, search, and update residents.</p>
              </a>
              <a
                href="/admin/security"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-sm font-semibold text-slate-900">Manage security</p>
                <p className="mt-1 text-sm text-slate-600">Add guards and review assignments.</p>
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold text-white/90">Note</p>
            <p className="mt-2 text-lg font-semibold leading-snug">
              This portal is UI-first.
            </p>
            <p className="mt-2 text-sm text-white/70">
              The backend currently exposes System Admin endpoints. When Admin endpoints are added, we can wire these screens to live data.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

