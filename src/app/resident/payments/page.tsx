'use client';

import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

interface Payment {
  id: string;
  type: 'maintenance' | 'parking' | 'utilities' | 'other';
  description: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  paid_date?: string;
  transaction_ref?: string;
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

  const markAsPaid = (id: string) => {
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
      accent: 'from-emerald-600 to-teal-600',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    },
  ];

  return (
    <main className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#76806F]">Financial</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className={`${cormorant.className} text-4xl font-semibold tracking-tight text-[#173326] lg:text-[4.5rem]`}>
            Payments & Dues
          </h1>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D8D0BC] bg-[#FBF8EF] px-3 py-1.5 text-sm font-semibold text-[#173326] shadow-[0_8px_24px_rgba(23,51,38,0.04)]">
            <span className="h-2 w-2 rounded-full bg-[#0F5B35]" />
            {payments.length} total
          </div>
        </div>
        <p className="max-w-2xl text-[15px] text-[#637062]">
          Manage your payments, view outstanding dues, and track payment history.
        </p>
      </section>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            {error}
          </div>
        )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-[28px] border border-[#D8D0BC] bg-[#F6F2E8] p-5 shadow-[0_8px_24px_rgba(23,51,38,0.04)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(23,51,38,0.08)]"
            >
              <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#173326]">{card.title}</p>
                  <p className="text-xs text-[#7A7F70]">{card.subtitle}</p>
                </div>
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0F5B35] text-white shadow-[0_10px_26px_rgba(15,91,53,0.16)]">
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
                <p className="text-4xl font-semibold tracking-tight text-[#173326]">
                  {loading ? <span className="inline-block h-10 w-16 animate-pulse rounded bg-[#E6E0CF]" /> : card.value}
                </p>
                <p className="text-xs font-semibold text-[#7A7F70]">UrbanNest</p>
              </div>

              <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#0F5B35]/5 blur-2xl transition group-hover:bg-[#0F5B35]/10" />
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-[28px] border border-[#D8D0BC] bg-[#F6F2E8] p-6 shadow-[0_8px_24px_rgba(23,51,38,0.04)]">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-[#E6E0CF]" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 w-3/4 animate-pulse rounded bg-[#E6E0CF]" />
                    <div className="h-4 w-full animate-pulse rounded bg-[#E6E0CF]" />
                    <div className="h-4 w-2/3 animate-pulse rounded bg-[#E6E0CF]" />
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
                className="group relative overflow-hidden rounded-[28px] border border-[#D8D0BC] bg-[#F6F2E8] p-6 shadow-[0_8px_24px_rgba(23,51,38,0.04)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(23,51,38,0.08)]"
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
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
                        <h3 className="text-lg font-semibold text-[#173326]">{payment.description}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`rounded-full border border-[#D8D0BC] px-2 py-1 text-xs font-medium bg-white/70 text-[#173326] backdrop-blur`}
                          >
                            {payment.status?.toUpperCase() || 'PENDING'}
                          </span>
                          <span className="text-sm capitalize text-[#7A7F70]">
                            {payment.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-[#637062]">
                          <span className="font-medium">Amount:</span> ${payment.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-[#637062]">
                          <span className="font-medium">Due Date:</span> {new Date(payment.due_date).toLocaleDateString()}
                        </p>
                        {payment.paid_date && (
                          <p className="text-sm text-[#637062]">
                            <span className="font-medium">Paid Date:</span> {new Date(payment.paid_date).toLocaleDateString()}
                          </p>
                        )}
                        {payment.transaction_ref && (
                          <p className="text-sm text-[#637062]">
                            <span className="font-medium">Payment Method:</span> {payment.transaction_ref}
                          </p>
                        )}
                      </div>
                      {payment.status !== 'paid' && (
                        <button
                          onClick={() => markAsPaid(payment.id)}
                          className="rounded-full bg-[#0F5B35] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(15,91,53,0.16)] transition hover:-translate-y-0.5 hover:bg-[#0B4B2C]"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#0F5B35]/5 blur-2xl transition group-hover:bg-[#0F5B35]/10" />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-[#D8D0BC] bg-[#F6F2E8] p-12 text-center shadow-[0_8px_24px_rgba(23,51,38,0.04)] backdrop-blur">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#EAF1E8]">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-[#9AA092]" fill="none" aria-hidden="true">
                <path
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-medium text-[#637062]">No payments or dues at this time</p>
            <p className="mt-2 text-sm text-[#7A7F70]">All your payments are up to date.</p>
          </div>
        )}

        {/* Payment History Section */}
        {payments.filter(p => p.status === 'paid').length > 0 && (
          <div className="rounded-[28px] border border-[#D8D0BC] bg-[#F6F2E8] p-6 shadow-[0_8px_24px_rgba(23,51,38,0.04)] backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold text-[#173326]">Payment History</h2>
            <div className="space-y-3">
              {payments
                .filter(p => p.status === 'paid')
                .map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border-b border-[#E6E0CF] py-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#173326]">{payment.description}</p>
                      <p className="text-xs text-[#7A7F70]">
                        Paid on {new Date(payment.paid_date!).toLocaleDateString()} via {payment.transaction_ref}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#173326]">${payment.amount.toFixed(2)}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
    </main>
  );
}
