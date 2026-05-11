'use client';

import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useMemo, useState } from 'react';

import CalendarIcon from '@/assets/icons/calendar.svg';
import MapFoldIcon from '@/assets/icons/map-fold.svg';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

type PatrolRouteCheckpoint = {
  id: string;
  name: string;
  order_index: number;
};

type PatrolRoute = {
  id: string;
  name: string;
  description: string | null;
  building_id: string;
  is_active: boolean;
  checkpoints: PatrolRouteCheckpoint[];
  created_at: string;
  updated_at: string;
};

type PatrolRoundCheckpoint = {
  id: string;
  checkpoint_id: string;
  checkpoint_name: string;
  order_index: number;
  is_visited: boolean;
  visited_at: string | null;
  notes: string | null;
};

type PatrolRound = {
  id: string;
  guard_id: string;
  route_id: string;
  route_name: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  started_at: string;
  completed_at: string | null;
  notes: string | null;
  checkpoints: PatrolRoundCheckpoint[];
  total_checkpoints: number;
  visited_checkpoints: number;
  created_at: string;
  updated_at: string;
};

type TabKind = 'active' | 'history';

export default function SecurityPatrolPage() {
  const [activeTab, setActiveTab] = useState<TabKind>('active');
  const [patrolRoutes, setPatrolRoutes] = useState<PatrolRoute[]>([]);
  const [patrolRounds, setPatrolRounds] = useState<PatrolRound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pendingAction, setPendingAction] = useState('');

  const loadData = async () => {
    try {
      const [routesData, roundsData] = await Promise.all([
        apiClient.get(API_ENDPOINTS.patrol.securityRoutes),
        apiClient.get(API_ENDPOINTS.patrol.securityRounds),
      ]);
      setPatrolRoutes(routesData);
      setPatrolRounds(roundsData);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeRound = useMemo(
    () => patrolRounds.find((round) => round.status === 'in_progress') ?? null,
    [patrolRounds],
  );

  const historyRounds = useMemo(
    () => patrolRounds.filter((round) => round.status !== 'in_progress'),
    [patrolRounds],
  );

  const visitedCount = activeRound?.checkpoints.filter((checkpoint) => checkpoint.is_visited).length ?? 0;
  const progressPercent = activeRound && activeRound.total_checkpoints > 0
    ? Math.round((visitedCount / activeRound.total_checkpoints) * 100)
    : 0;

  const formatDateTime = (value: string | null) => {
    if (!value) return 'Not set';
    return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  const formatDuration = (startedAt: string, completedAt: string | null) => {
    const start = new Date(startedAt).getTime();
    const end = completedAt ? new Date(completedAt).getTime() : Date.now();
    const minutes = Math.max(Math.round((end - start) / 60000), 0);
    if (minutes < 60) return `${minutes} mins`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const refreshAfterAction = async (successMessage: string) => {
    setMessage(successMessage);
    await loadData();
  };

  const startRound = async (routeId: string) => {
    setPendingAction(`start:${routeId}`);
    setError('');
    setMessage('');
    try {
      await apiClient.post(API_ENDPOINTS.patrol.securityStartRound, { route_id: routeId });
      await refreshAfterAction('Round started.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setPendingAction('');
    }
  };

  const markVisited = async (roundId: string, checkpointId: string) => {
    setPendingAction(`visit:${roundId}:${checkpointId}`);
    setError('');
    setMessage('');
    try {
      await apiClient.post(API_ENDPOINTS.patrol.securityVisitCheckpoint(roundId, checkpointId), {});
      await refreshAfterAction('Checkpoint marked as visited.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setPendingAction('');
    }
  };

  const completeRound = async (roundId: string) => {
    setPendingAction(`complete:${roundId}`);
    setError('');
    setMessage('');
    try {
      await apiClient.patch(API_ENDPOINTS.patrol.securityCompleteRound(roundId), {});
      await refreshAfterAction('Round completed!');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setPendingAction('');
    }
  };

  const hasAllCheckpointsVisited = activeRound ? activeRound.checkpoints.every((checkpoint) => checkpoint.is_visited) : false;

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#76806F]">Patrol Operations</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className={`${cormorant.className} text-4xl font-semibold leading-none tracking-tight text-[#173326] lg:text-[4.5rem] lg:leading-[0.9]`}>
              Patrol Rounds
            </h1>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D9D1BC] bg-[#FBF8EF] px-3 py-1.5 text-sm font-semibold text-[#173326] shadow-[0_8px_24px_rgba(23,51,38,0.04)]">
              <span className="h-2 w-2 rounded-full bg-[#0F5B35]" />
              Security Shift Active
            </div>
          </div>
          <p className="max-w-2xl text-[15px] leading-7 text-[#637062]">
            Start rounds from active routes, mark checkpoints as visited, and review patrol history.
          </p>
        </div>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {message}
          </div>
        )}

        <div className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-2 shadow-[0_10px_30px_rgba(23,51,38,0.06)] backdrop-blur">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('active')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'active'
                  ? 'bg-[#0F5B35] text-[#F7F4E8]'
                  : 'text-[#637062] hover:bg-[#F4F0E4]'
              }`}
            >
              Active Round
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-[#0F5B35] text-[#F7F4E8]'
                  : 'text-[#637062] hover:bg-[#F4F0E4]'
              }`}
            >
              History
            </button>
          </div>
          <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#0F5B35]/5 blur-2xl transition group-hover:bg-[#0F5B35]/10" />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
        ) : activeTab === 'active' ? (
          activeRound ? (
            <div className="space-y-4 rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold text-[#173326]">{activeRound.route_name}</h2>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      In Progress
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-[#596154]">
                    Started at {formatDateTime(activeRound.started_at)}
                  </p>
                  {activeRound.notes && (
                    <p className="mt-2 max-w-2xl text-sm text-[#596154]">{activeRound.notes}</p>
                  )}
                </div>
                <div className="min-w-[220px] rounded-2xl border border-[#E6E0CF] bg-white px-4 py-3">
                  <div className="flex items-center justify-between text-sm font-medium text-[#596154]">
                    <span>{visitedCount} of {activeRound.total_checkpoints} visited</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[#E6E0CF]">
                    <div
                      className="h-2 rounded-full bg-[#0F5B35] transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {activeRound.checkpoints.map((checkpoint) => (
                  <div
                    key={checkpoint.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E6E0CF] bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#0F5B35] text-sm font-semibold text-[#F7F4E8]">
                        {checkpoint.order_index}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#173326]">{checkpoint.checkpoint_name}</p>
                        {checkpoint.is_visited ? (
                          <p className="text-xs text-emerald-700">
                            Visited {formatDateTime(checkpoint.visited_at)}
                          </p>
                        ) : (
                          <p className="text-xs text-[#596154]">Pending visit</p>
                        )}
                      </div>
                    </div>

                    {!checkpoint.is_visited ? (
                      <button
                        type="button"
                        onClick={() => markVisited(activeRound.id, checkpoint.checkpoint_id)}
                        disabled={pendingAction === `visit:${activeRound.id}:${checkpoint.checkpoint_id}`}
                        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingAction === `visit:${activeRound.id}:${checkpoint.checkpoint_id}` ? 'Saving...' : 'Mark Visited'}
                      </button>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Visited
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end border-t border-[#E6E0CF] pt-4">
                <button
                  type="button"
                  onClick={() => completeRound(activeRound.id)}
                  disabled={!hasAllCheckpointsVisited || pendingAction === `complete:${activeRound.id}`}
                  className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingAction === `complete:${activeRound.id}` ? 'Completing...' : 'Complete Round'}
                </button>
              </div>
            </div>
          ) : patrolRoutes.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {patrolRoutes.map((route) => (
                <article
                  key={route.id}
                  className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(23,51,38,0.1)]"
                >
                  <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold text-[#173326]">{route.name}</h2>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {route.checkpoints.length} checkpoints
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[#596154]">
                        {route.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">Checkpoint Preview</p>
                    <ul className="space-y-2">
                      {route.checkpoints.slice(0, 4).map((checkpoint) => (
                        <li key={checkpoint.id} className="flex items-center gap-3 rounded-2xl border border-[#E6E0CF] bg-white px-4 py-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#0F5B35] text-sm font-semibold text-[#F7F4E8]">
                            {checkpoint.order_index}
                          </span>
                          <span className="text-sm font-medium text-[#173326]">{checkpoint.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-[#E6E0CF] pt-4">
                    <p className="text-sm text-[#596154]">
                      {route.checkpoints.length} total checkpoints
                    </p>
                    <button
                      type="button"
                      onClick={() => startRound(route.id)}
                      disabled={pendingAction === `start:${route.id}`}
                      className="rounded-full bg-[#0F5B35] px-5 py-3 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingAction === `start:${route.id}` ? 'Starting...' : 'Start Round'}
                    </button>
                  </div>

                  <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#0F5B35]/5 blur-2xl transition group-hover:bg-[#0F5B35]/10" />
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-12 text-center shadow-sm backdrop-blur">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-slate-100">
                <MapFoldIcon className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true" />
              </div>
              <p className="text-slate-600 font-medium">No active patrol round</p>
              <p className="mt-2 text-sm text-slate-500">
                Create or pick an active route to begin a new patrol.
              </p>
            </div>
          )
        ) : historyRounds.length > 0 ? (
          <div className="space-y-4">
            {historyRounds.map((round) => (
              <article
                key={round.id}
                className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(23,51,38,0.1)]"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold text-[#173326]">{round.route_name}</h2>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          round.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {round.status === 'completed' ? 'Completed' : 'Abandoned'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#596154]">
                      Started {formatDateTime(round.started_at)}
                    </p>
                    <p className="text-sm text-[#596154]">
                      Completed {formatDateTime(round.completed_at)}
                    </p>
                    <p className="text-sm text-[#596154]">
                      Duration: {formatDuration(round.started_at, round.completed_at)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#E6E0CF] bg-white px-4 py-3 text-sm text-[#596154]">
                    <p className="font-semibold text-[#173326]">
                      {round.visited_checkpoints}/{round.total_checkpoints} checkpoints visited
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {round.checkpoints.map((checkpoint) => (
                    <span
                      key={checkpoint.id}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        checkpoint.is_visited
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {checkpoint.order_index}. {checkpoint.checkpoint_name}
                    </span>
                  ))}
                </div>

                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-12 text-center shadow-sm backdrop-blur">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-slate-100">
              <CalendarIcon className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true" />
            </div>
            <p className="text-slate-600 font-medium">No patrol rounds completed yet</p>
            <p className="mt-2 text-sm text-slate-500">Patrol history will appear here.</p>
          </div>
        )}
      </div>
    </main>
  );
}
