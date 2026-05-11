'use client';

import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useMemo, useState } from 'react';

import ClockSmallIcon from '@/assets/icons/clock-small.svg';
import MapFoldIcon from '@/assets/icons/map-fold.svg';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

type EntryLog = {
  id: string;
  visitor_name: string;
  resident_name: string;
  unit_number: string | null;
  status: 'checked_in' | 'checked_out' | 'denied';
  check_in_time: string | null;
  check_out_time: string | null;
  logged_at: string;
  approved_by_name: string | null;
  purpose: string | null;
};

type StatusFilter = 'all' | EntryLog['status'];
type DateFilter = 'today' | 'week' | 'all';

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<EntryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<{ status: StatusFilter; dateRange: DateFilter }>({
    status: 'all',
    dateRange: 'today',
  });

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get(API_ENDPOINTS.logs.securityLogs);
      setLogs(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filters.status, filters.dateRange]);

  const filteredLogs = useMemo(() => {
    const now = new Date();
    return logs.filter((log) => {
      if (filters.status !== 'all' && log.status !== filters.status) return false;

      const referenceTime = new Date(log.logged_at);
      if (filters.dateRange === 'today') {
        return referenceTime.toDateString() === now.toDateString();
      }
      if (filters.dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return referenceTime >= weekAgo;
      }
      return true;
    });
  }, [filters.dateRange, filters.status, logs]);

  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  const formatDuration = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn || !checkOut) return null;
    const minutes = Math.max(Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000), 0);
    if (minutes < 60) return `stayed ${minutes} mins`;
    return `stayed ${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const statusLabel: Record<EntryLog['status'], string> = {
    checked_in: 'Checked In',
    checked_out: 'Checked Out',
    denied: 'Denied',
  };

  const statusStyle: Record<EntryLog['status'], string> = {
    checked_in: 'bg-emerald-100 text-emerald-700',
    checked_out: 'bg-slate-100 text-slate-700',
    denied: 'bg-rose-100 text-rose-700',
  };

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#76806F]">Security Logs</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className={`${cormorant.className} text-4xl font-semibold leading-none tracking-tight text-[#173326] lg:text-[4.5rem] lg:leading-[0.9]`}>
              Entry Logs
            </h1>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D9D1BC] bg-[#FBF8EF] px-3 py-1.5 text-sm font-semibold text-[#173326] shadow-[0_8px_24px_rgba(23,51,38,0.04)]">
              <span className="h-2 w-2 rounded-full bg-[#0F5B35]" />
              Building Activity
            </div>
          </div>
          <p className="max-w-2xl text-[15px] leading-7 text-[#637062]">
            All visitor activity for your building, filtered by status and date.
          </p>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        <div className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-4 shadow-[0_10px_30px_rgba(23,51,38,0.06)] backdrop-blur">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">Filter by status</label>
              <select
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as StatusFilter }))}
                className="rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
              >
                <option value="all">All</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="denied">Denied</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">Date filter</label>
              <select
                value={filters.dateRange}
                onChange={(event) => setFilters((current) => ({ ...current, dateRange: event.target.value as DateFilter }))}
                className="rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const duration = formatDuration(log.check_in_time, log.check_out_time);
              const displayTime = log.logged_at;
              return (
                <article
                  key={log.id}
                  className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(23,51,38,0.08)]"
                >
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex min-w-[120px] flex-col gap-1 rounded-2xl border border-[#E6E0CF] bg-white px-4 py-3 text-[#173326]">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <ClockSmallIcon className="h-5 w-5 text-[#0F5B35]" fill="none" aria-hidden="true" />
                        {formatTime(displayTime)}
                      </div>
                      <p className="text-sm text-[#596154]">{formatDate(displayTime)}</p>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-semibold text-[#173326]">{log.visitor_name}</h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[log.status]}`}>
                          {statusLabel[log.status]}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-[#596154]">
                        {log.purpose || 'Visitor activity recorded'}
                      </p>
                      <p className="mt-1 text-sm text-[#596154]">
                        Visiting {log.resident_name}{log.unit_number ? `, Unit ${log.unit_number}` : ''}
                      </p>
                      {log.approved_by_name && (
                        <p className="mt-1 text-xs text-[#76806F]">Approved by {log.approved_by_name}</p>
                      )}
                      {duration && (
                        <p className="mt-3 text-sm font-medium text-[#173326]">{duration}</p>
                      )}
                    </div>

                    <div className="min-w-[140px] rounded-2xl border border-[#E6E0CF] bg-white px-4 py-3 text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">Status</p>
                      <p className="mt-2 text-sm font-semibold text-[#173326]">{statusLabel[log.status]}</p>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-[#F6F2E8] p-12 text-center shadow-sm backdrop-blur">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-slate-100">
              <MapFoldIcon className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true" />
            </div>
            <p className="text-slate-600 font-medium">No entry logs yet</p>
            <p className="mt-2 text-sm text-slate-500">Visitor activity will appear here.</p>
          </div>
        )}
      </div>
    </main>
  );
}
