'use client';

export default function AdminSettingsPage() {
  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Preferences</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Settings</h1>
          <p className="max-w-2xl text-slate-600">
            Admin settings UI placeholder. When backend adds admin-specific settings, we can wire this to real data.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur lg:col-span-2">
            <p className="text-sm font-semibold text-slate-900">Account</p>
            <p className="mt-1 text-sm text-slate-600">Profile, notifications, and preferences.</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="h-12 rounded-xl border border-slate-200 bg-white shadow-sm" />
              <div className="h-12 rounded-xl border border-slate-200 bg-white shadow-sm" />
              <div className="h-12 rounded-xl border border-slate-200 bg-white shadow-sm sm:col-span-2" />
            </div>
            <div className="mt-6 inline-flex items-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm">
              Save changes (coming soon)
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold text-white/90">Tip</p>
            <p className="mt-2 text-lg font-semibold leading-snug">Keep comms tight.</p>
            <p className="mt-2 text-sm text-white/80">
              When we add announcements, use short messages with clear action items.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

