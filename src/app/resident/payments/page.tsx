'use client';

import { useEffect, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

interface Payment {
  id: number;
  type: 'maintenance' | 'parking' | 'utilities' | 'other';
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
  paymentMethod?: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const data = await apiClient.get(API_ENDPOINTS.resident.payments);
        setPayments(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'from-amber-500 to-orange-500';
      case 'paid':
        return 'from-emerald-500 to-teal-500';
      case 'overdue':
        return 'from-rose-500 to-pink-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z';
      case 'parking':
        return 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v9a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4';
      case 'utilities':
        return 'M13 10V3L4 14h7v7m9 0v-7l-7-7v7m0 7h7';
      case 'other':
        return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      default:
        return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    }
  };

  const markAsPaid = (id: number) => {
    const payRequest = async () => {
      try {
        const updatedPayment = await apiClient.post(`${API_ENDPOINTS.resident.payments}/${id}/pay`, {});
        setPayments(payments.map(payment => 
          payment.id === id ? updatedPayment : payment
        ));
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    };

    payRequest();
  };

  const calculateTotals = () => {
    const pending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    const overdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
    const total = pending + overdue;
    return { pending, overdue, total };
  };

  const totals = calculateTotals();

  const cards = [
    {
      title: 'Pending',
      subtitle: 'Awaiting payment',
      value: `$${totals.pending.toFixed(2)}`,
      accent: 'from-amber-500 to-orange-500',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      title: 'Overdue',
      subtitle: 'Past due date',
      value: `$${totals.overdue.toFixed(2)}`,
      accent: 'from-rose-500 to-pink-500',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z',
    },
    {
      title: 'Total Due',
      subtitle: 'All outstanding',
      value: `$${totals.total.toFixed(2)}`,
      accent: 'from-violet-600 to-fuchsia-600',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    },
  ];

  return (
    <main>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Financial</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Payments & Dues</h1>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {payments.length} total
            </div>
          </div>
          <p className="max-w-2xl text-slate-600">
            Manage your payments, view outstanding dues, and track payment history.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
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

              <div className="mt-5 flex items-end justify-between">
                <p className="text-4xl font-semibold tracking-tight text-slate-900">
                  {loading ? <span className="inline-block h-10 w-16 animate-pulse rounded bg-slate-200" /> : card.value}
                </p>
                <p className="text-xs font-semibold text-slate-500">UrbanNest</p>
              </div>

              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
            </div>
          ))}
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
        ) : payments.length > 0 ? (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${getStatusColor(payment.status || 'pending')}`} />
                <div className="flex items-start gap-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${getStatusColor(payment.status || 'pending')} text-white shadow-sm`}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                      <path
                        d={getTypeIcon(payment.type)}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{payment.description}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium border bg-white/80 backdrop-blur`}
                          >
                            {payment.status?.toUpperCase() || 'PENDING'}
                          </span>
                          <span className="text-sm text-slate-500 capitalize">
                            {payment.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Amount:</span> ${payment.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium">Due Date:</span> {new Date(payment.dueDate).toLocaleDateString()}
                        </p>
                        {payment.paidDate && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Paid Date:</span> {new Date(payment.paidDate).toLocaleDateString()}
                          </p>
                        )}
                        {payment.paymentMethod && (
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Payment Method:</span> {payment.paymentMethod}
                          </p>
                        )}
                      </div>
                      {payment.status !== 'paid' && (
                        <button
                          onClick={() => markAsPaid(payment.id)}
                          className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-900/5 blur-2xl transition group-hover:bg-slate-900/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-12 text-center shadow-sm backdrop-blur">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-400" fill="none" aria-hidden="true">
                <path
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">No payments or dues at this time</p>
            <p className="mt-2 text-sm text-slate-500">All your payments are up to date.</p>
          </div>
        )}

        {/* Payment History Section */}
        {payments.filter(p => p.status === 'paid').length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Payment History</h2>
            <div className="space-y-3">
              {payments
                .filter(p => p.status === 'paid')
                .map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{payment.description}</p>
                      <p className="text-xs text-slate-500">
                        Paid on {new Date(payment.paidDate!).toLocaleDateString()} via {payment.paymentMethod}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">${payment.amount.toFixed(2)}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
