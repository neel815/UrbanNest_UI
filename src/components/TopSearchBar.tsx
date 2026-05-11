"use client";

import ChevronRightIcon from '@/assets/icons/chevron-right.svg';
import SearchIcon from '@/assets/icons/search.svg';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type ResultItem = { id: string; label: string; subtitle?: string; href: string };
type Group = { title: string; items: ResultItem[] };

function useDebounced(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function TopSearchBar() {
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query, 250);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);

  const moduleKind = useMemo(() => {
    if (!pathname) return 'admin';
    if (pathname.startsWith('/system-admin')) return 'system-admin';
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/resident')) return 'resident';
    if (pathname.startsWith('/security')) return 'security';
    return 'admin';
  }, [pathname]);

  useEffect(() => {
    if (debounced.trim().length < 2) {
      setGroups([]);
      setOpen(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError('');

    const q = debounced.trim().toLowerCase();

    async function search() {
      try {
        const results: Group[] = [];

        if (moduleKind === 'system-admin') {
          const [admins, buildings] = await Promise.all([
            apiClient.get(API_ENDPOINTS.systemAdmin.admins),
            apiClient.get(API_ENDPOINTS.systemAdmin.buildings),
          ]);

          const adminMatches = (admins || []).filter((a: any) => (a.full_name || '').toLowerCase().includes(q));
          if (adminMatches.length) {
            results.push({
              title: 'ADMINS',
              items: adminMatches.slice(0, 6).map((a: any) => ({
                id: a.id,
                label: a.full_name,
                subtitle: a.email,
                href: `/system-admin/admins?highlight=${a.id}`,
              })),
            });
          }

          const buildingMatches = (buildings || []).filter((b: any) => (b.name || '').toLowerCase().includes(q));
          if (buildingMatches.length) {
            results.push({
              title: 'BUILDINGS',
              items: buildingMatches.slice(0, 6).map((b: any) => ({
                id: b.id,
                label: b.name,
                subtitle: b.address,
                href: `/system-admin/buildings?highlight=${b.id}`,
              })),
            });
          }
        }

        if (moduleKind === 'admin') {
          const [residents, units, guards, announcements] = await Promise.all([
            apiClient.get(API_ENDPOINTS.admin.residents),
            apiClient.get(API_ENDPOINTS.admin.units),
            apiClient.get(API_ENDPOINTS.admin.security),
            apiClient.get(API_ENDPOINTS.admin.announcements),
          ]);

          const residentMatches = (residents || []).filter((r: any) => (r.full_name || '').toLowerCase().includes(q));
          if (residentMatches.length) {
            results.push({
              title: 'RESIDENTS',
              items: residentMatches.slice(0, 6).map((r: any) => ({
                id: r.id,
                label: r.full_name,
                subtitle: r.email || r.unit_number || '',
                href: `/admin/residents?highlight=${r.id}`,
              })),
            });
          }

          const guardMatches = (guards || []).filter((g: any) => (g.full_name || '').toLowerCase().includes(q));
          if (guardMatches.length) {
            results.push({
              title: 'SECURITY GUARDS',
              items: guardMatches.slice(0, 6).map((g: any) => ({
                id: g.id,
                label: g.full_name,
                subtitle: (g.shift || '').replace('_', ' '),
                href: `/admin/security?highlight=${g.id}`,
              })),
            });
          }

          const announcementMatches = (announcements || []).filter((a: any) => (a.title || '').toLowerCase().includes(q));
          if (announcementMatches.length) {
            results.push({
              title: 'ANNOUNCEMENTS',
              items: announcementMatches.slice(0, 6).map((a: any) => ({
                id: a.id,
                label: a.title,
                subtitle: a.published_at ? new Date(a.published_at).toLocaleDateString() : '',
                href: `/admin/announcements?highlight=${a.id}`,
              })),
            });
          }
        }

        if (moduleKind === 'resident') {
          const [announcements, maintenance, visitors] = await Promise.all([
            apiClient.get(API_ENDPOINTS.resident.announcements),
            apiClient.get(API_ENDPOINTS.resident.maintenance),
            apiClient.get(API_ENDPOINTS.resident.visitors),
          ]);

          const annMatches = (announcements || []).filter((a: any) => (a.title || '').toLowerCase().includes(q));
          if (annMatches.length) {
            results.push({ title: 'ANNOUNCEMENTS', items: annMatches.slice(0, 6).map((a: any) => ({ id: a.id, label: a.title, subtitle: a.published_at ? new Date(a.published_at).toLocaleDateString() : '', href: `/resident/announcements?highlight=${a.id}` })) });
          }

          const maintMatches = (maintenance || []).filter((m: any) => (m.title || m.description || '').toLowerCase().includes(q));
          if (maintMatches.length) {
            results.push({ title: 'MAINTENANCE', items: maintMatches.slice(0, 6).map((m: any) => ({ id: m.id, label: m.title || 'Request', subtitle: m.status || '', href: `/resident/maintenance?highlight=${m.id}` })) });
          }

          const visitorMatches = (visitors || []).filter((v: any) => (v.visitor_name || '').toLowerCase().includes(q));
          if (visitorMatches.length) {
            results.push({ title: 'VISITORS', items: visitorMatches.slice(0, 6).map((v: any) => ({ id: v.id, label: v.visitor_name, subtitle: v.status || '', href: `/resident/visitors?highlight=${v.id}` })) });
          }
        }

        if (moduleKind === 'security') {
          const [visitors, incidents, logs] = await Promise.all([
            apiClient.get(API_ENDPOINTS.security.visitors),
            apiClient.get(API_ENDPOINTS.security.incidents),
            apiClient.get(API_ENDPOINTS.logs.securityLogs),
          ]);

          const visitorMatches = (visitors || []).filter((v: any) => (v.visitor_name || '').toLowerCase().includes(q));
          if (visitorMatches.length) {
            results.push({ title: 'VISITORS', items: visitorMatches.slice(0, 6).map((v: any) => ({ id: v.id, label: v.visitor_name, subtitle: v.purpose || '', href: `/security/visitors?highlight=${v.id}` })) });
          }

          const incidentMatches = (incidents || []).filter((i: any) => (i.title || '').toLowerCase().includes(q));
          if (incidentMatches.length) {
            results.push({ title: 'INCIDENTS', items: incidentMatches.slice(0, 6).map((i: any) => ({ id: i.id, label: i.title, subtitle: i.severity || '', href: `/security/incidents?highlight=${i.id}` })) });
          }

          const logMatches = (logs || []).filter((l: any) => (l.visitor_name || l.resident_name || '').toLowerCase().includes(q));
          if (logMatches.length) {
            results.push({ title: 'ENTRY LOGS', items: logMatches.slice(0, 6).map((l: any) => ({ id: l.id, label: l.visitor_name || l.resident_name || 'Entry', subtitle: l.purpose || '', href: `/security/logs?highlight=${l.id}` })) });
          }
        }

        if (mounted) {
          setGroups(results.filter((g) => g.items && g.items.length));
          setOpen(results.length > 0);
        }
      } catch (err) {
        if (mounted) setError(getApiErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void search();

    return () => {
      mounted = false;
    };
  }, [debounced, moduleKind]);

  const onSelect = (item: ResultItem) => {
    setOpen(false);
    setQuery('');
    // Navigate to item, include highlight query
    router.push(item.href);
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!inputRef.current) return;
      if (e.target instanceof Node && inputRef.current.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  return (
    <div className="relative flex min-w-0 flex-1 items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="relative flex items-center gap-3 rounded-full border border-[#E6E0CF] bg-[#FBF8EF] px-4 py-3 shadow-[0_8px_24px_rgba(23,51,38,0.04)]">
          <SearchIcon className="h-4 w-4 text-[#9AA092]" fill="none" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(groups.length > 0)}
            placeholder={moduleKind === 'system-admin' ? 'Search admins, buildings...' : moduleKind === 'admin' ? 'Search residents, units, guards...' : moduleKind === 'resident' ? 'Search announcements, maintenance, visitors...' : 'Search visitors, incidents, logs...'}
            className="min-w-0 flex-1 bg-transparent text-sm text-[#173326] outline-none placeholder:text-[#9AA092]"
            aria-label="Top search"
          />
        </div>

        {open && (
          <div className="absolute left-0 right-0 z-50 mt-2 max-h-[48vh] overflow-auto rounded-2xl border border-[#E6E0CF] bg-white p-3 shadow-lg">
            {loading && <p className="text-sm text-[#596154]">Searching...</p>}
            {error && <p className="text-sm text-rose-700">{error}</p>}
            {groups.map((group) => (
              <div key={group.title} className="mb-3 last:mb-0">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">{group.title}</p>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(item)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-slate-50">
                          <div>
                            <p className="text-sm font-medium text-[#173326]">{item.label}</p>
                            {item.subtitle && <p className="text-xs text-[#596154]">{item.subtitle}</p>}
                          </div>
                          <div>
                            <ChevronRightIcon className="h-4 w-4 text-[#9AA092]" fill="none" aria-hidden="true" />
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
