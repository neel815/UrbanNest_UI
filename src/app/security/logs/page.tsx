'use client';

import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useState } from 'react';

import { apiClient } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';
import DocumentIcon from '@/assets/icons/document.svg';
import ReportIcon from '@/assets/icons/report.svg';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

interface SecurityLog {
  id: string;
  timestamp: string;
  type: 'access' | 'visitor' | 'incident' | 'patrol' | 'system' | 'alert';
  category: string;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  details?: Record<string, any>;
  userId?: string;
  ipAddress?: string;
}

interface SecurityReport {
  id: string;
  title: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  generatedAt: string;
  generatedBy: string;
  period: {
    start: string;
    end: string;
  };
  summary: {
    totalIncidents: number;
    totalVisitors: number;
    totalPatrols: number;
    totalAlerts: number;
  };
  fileUrl?: string;
}

export default function SecurityLogsPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [reports, setReports] = useState<SecurityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'reports'>('logs');
  const [filters, setFilters] = useState({
    type: 'all' as SecurityLog['type'] | 'all',
    severity: 'all' as SecurityLog['severity'] | 'all',
    dateRange: 'today' as 'today' | 'week' | 'month' | 'all'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [logsData, reportsData] = await Promise.all([
          apiClient.get(API_ENDPOINTS.security.logs),
          apiClient.get(API_ENDPOINTS.security.reports)
        ]);
        setLogs(logsData);
        setReports(reportsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'access':
        return 'from-blue-600 to-indigo-600';
      case 'visitor':
        return 'from-emerald-500 to-teal-500';
      case 'incident':
        return 'from-rose-500 to-pink-500';
      case 'patrol':
        return 'from-violet-600 to-fuchsia-600';
      case 'system':
        return 'from-slate-500 to-slate-600';
      case 'alert':
        return 'from-amber-500 to-orange-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'from-red-600 to-rose-600';
      case 'error':
        return 'from-rose-500 to-pink-500';
      case 'warning':
        return 'from-amber-500 to-orange-500';
      case 'info':
        return 'from-blue-600 to-indigo-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const generateReport = (type: 'daily' | 'weekly' | 'monthly') => {
    const submitReport = async () => {
      try {
        const newReport = await apiClient.post(API_ENDPOINTS.security.reports, { type });
        setReports([newReport, ...reports]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate report');
      }
    };

    submitReport();
  };

  const downloadReport = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (report?.fileUrl) {
      window.open(report.fileUrl, '_blank');
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filters.type !== 'all' && log.type !== filters.type) return false;
    if (filters.severity !== 'all' && log.severity !== filters.severity) return false;
    
    const logDate = new Date(log.timestamp);
    const now = new Date();
    
    if (filters.dateRange === 'today') {
      return logDate.toDateString() === now.toDateString();
    } else if (filters.dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return logDate >= weekAgo;
    } else if (filters.dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return logDate >= monthAgo;
    }
    
    return true;
  });

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#76806F]">Security Logs</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className={`${cormorant.className} text-4xl font-semibold leading-none tracking-tight text-[#173326] lg:text-[4.5rem] lg:leading-[0.9]`}>Logs & Reports</h1>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D9D1BC] bg-[#FBF8EF] px-3 py-1.5 text-sm font-semibold text-[#173326] shadow-[0_8px_24px_rgba(23,51,38,0.04)]">
              <span className="h-2 w-2 rounded-full bg-[#0F5B35]" />
              System Active
            </div>
          </div>
          <p className="max-w-2xl text-[15px] leading-7 text-[#637062]">
            Review security logs, monitor system events, and generate comprehensive reports for analysis.
          </p>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-2 shadow-[0_10px_30px_rgba(23,51,38,0.06)] backdrop-blur">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'logs'
                  ? 'bg-[#0F5B35] text-[#F7F4E8]'
                  : 'text-[#637062] hover:bg-[#F4F0E4]'
              }`}
            >
              Security Logs
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'reports'
                  ? 'bg-[#0F5B35] text-[#F7F4E8]'
                  : 'text-[#637062] hover:bg-[#F4F0E4]'
              }`}
            >
              Reports
            </button>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#0F5B35]/5 blur-2xl transition group-hover:bg-[#0F5B35]/10" />
        </div>

        {activeTab === 'logs' && (
          <>
            {/* Filters */}
            <div className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-4 shadow-[0_10px_30px_rgba(23,51,38,0.06)] backdrop-blur">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
                    className="rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                  >
                    <option value="all">All Types</option>
                    <option value="access">Access</option>
                    <option value="visitor">Visitor</option>
                    <option value="incident">Incident</option>
                    <option value="patrol">Patrol</option>
                    <option value="system">System</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">Severity</label>
                  <select
                    value={filters.severity}
                    onChange={(e) => setFilters({ ...filters, severity: e.target.value as any })}
                    className="rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                  >
                    <option value="all">All Severities</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as any })}
                    className="rounded-xl border border-[#D8D0BC] bg-[#F6F2E8] px-3 py-2.5 text-sm text-[#173326] shadow-sm outline-none focus:ring-2 focus:ring-[#0F5B35]/10"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>
              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
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
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(23,51,38,0.08)]"
                  >
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
                    <div className="flex items-start gap-4">
                      <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${getTypeColor(log.type)} text-white shadow-sm`}>
                        <DocumentIcon className="h-5 w-5" fill="none" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900">{log.category}</h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                          >
                            {log.type?.toUpperCase() || 'SYSTEM'}
                          </span>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                          >
                            {log.severity?.toUpperCase() || 'INFO'}
                          </span>
                        </div>
                        <p className="mt-2 text-slate-600">{log.description}</p>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-slate-600">
                          <div>
                            <span className="font-medium">Time:</span> {new Date(log.timestamp).toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Source:</span> {log.source}
                          </div>
                          {log.userId && (
                            <div>
                              <span className="font-medium">User:</span> {log.userId}
                            </div>
                          )}
                          {log.ipAddress && (
                            <div>
                              <span className="font-medium">IP:</span> {log.ipAddress}
                            </div>
                          )}
                        </div>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                            <p className="text-sm font-medium text-slate-700 mb-2">Additional Details:</p>
                            <div className="space-y-1">
                              {Object.entries(log.details).map(([key, value]) => (
                                <p key={key} className="text-xs text-slate-600">
                                  <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-[#F6F2E8] p-12 text-center shadow-sm backdrop-blur">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 mx-auto mb-4">
                  <DocumentIcon className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true" />
                </div>
                <p className="text-slate-600 font-medium">No logs found</p>
                <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or check back later for new entries.</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Generate Report Actions */}
              <div className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] backdrop-blur">
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Generate Reports</p>
                  <p className="text-xs text-slate-500">Create comprehensive security reports</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-sm">
                  <ReportIcon className="h-5 w-5" fill="none" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button onClick={() => generateReport('daily')} className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]">
                  Daily Report
                </button>
                <button onClick={() => generateReport('weekly')} className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]">
                  Weekly Report
                </button>
                <button onClick={() => generateReport('monthly')} className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]">
                  Monthly Report
                </button>
              </div>
              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />
                      <div className="flex-1 space-y-3">
                        <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                          >
                            {report.type?.toUpperCase() || 'DAILY'}
                          </span>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-slate-600">
                            <span className="font-medium">Generated:</span> {new Date(report.generatedAt).toLocaleString()}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium">Generated by:</span> {report.generatedBy}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium">Period:</span> {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="mt-4 grid grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{report.summary.totalIncidents}</p>
                            <p className="text-xs text-slate-500">Incidents</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{report.summary.totalVisitors}</p>
                            <p className="text-xs text-slate-500">Visitors</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{report.summary.totalPatrols}</p>
                            <p className="text-xs text-slate-500">Patrols</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{report.summary.totalAlerts}</p>
                            <p className="text-xs text-slate-500">Alerts</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {report.fileUrl && (
                          <button
                            onClick={() => downloadReport(report.id)}
                            className="rounded-full bg-[#0F5B35] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-12 text-center shadow-sm backdrop-blur">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 mx-auto mb-4">
                  <ReportIcon className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true" />
                </div>
                <p className="text-slate-600 font-medium">No reports generated</p>
                <p className="mt-2 text-sm text-slate-500">Generate your first security report to get started.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
