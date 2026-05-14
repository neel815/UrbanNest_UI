'use client';

import { Cormorant_Garamond } from 'next/font/google';
import { useEffect, useState } from 'react';

import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

interface Payment {
  id: string;
  resident_id: string;
  amount: number;
  type: 'maintenance_fee' | 'parking' | 'amenity' | 'penalty' | 'other';
  status: 'pending' | 'paid' | 'overdue' | 'waived';
  due_date: string;
  paid_date?: string;
  transaction_ref?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface Resident {
  id: string;
  full_name: string;
  unit_number?: string;
}

type FilterStatus = 'all' | 'pending' | 'overdue' | 'paid' | 'waived';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showRaiseBulkModal, setShowRaiseBulkModal] = useState(false);
  const [showRaiseIndividualModal, setShowRaiseIndividualModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [markPaidNotes, setMarkPaidNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showWaiveDialog, setShowWaiveDialog] = useState(false);
  const [waivingPaymentId, setWaivingPaymentId] = useState<string>('');

  // Raise Bulk Due state
  const [bulkForm, setBulkForm] = useState({
    type: 'maintenance_fee',
    amount: '',
    due_date: '',
    description: '',
  });

  // Raise Individual Due state
  const [individualForm, setIndividualForm] = useState({
    resident_id: '',
    type: 'maintenance_fee',
    amount: '',
    due_date: '',
    description: '',
  });

  useEffect(() => {
    loadPayments();
    loadResidents();
  }, []);

  const loadPayments = async () => {
    try {
      const data = await apiClient.get(API_ENDPOINTS.admin.payments);
      setPayments(
        (Array.isArray(data) ? data : []).map((payment) => ({
          ...payment,
          amount: Number(payment.amount),
        }))
      );
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loadResidents = async () => {
    try {
      const data = await apiClient.get(API_ENDPOINTS.admin.residents);
      setResidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load residents:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'from-amber-500 to-orange-500';
      case 'paid':
        return 'from-emerald-500 to-teal-500';
      case 'overdue':
        return 'from-red-500 to-pink-500';
      case 'waived':
        return 'from-slate-500 to-slate-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === 'waived') return 'Canceled';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getTypeLabel = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance_fee':
        return 'M12 6V4m0 2a6 6 0 100 12 6 6 0 000-12zm0 0V4m0 2L9.172 9.172M12 8v4m0 0l2.828-2.828';
      case 'parking':
        return 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v9a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4';
      case 'amenity':
        return 'M13 10V3L4 14h7v7m9 0v-7l-7-7v7m0 7h7';
      case 'penalty':
        return 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const calculateTotals = () => {
    const totals: Record<FilterStatus, { count: number; amount: number }> = {
      all: { count: 0, amount: 0 },
      pending: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
      paid: { count: 0, amount: 0 },
      waived: { count: 0, amount: 0 },
    };

    payments.forEach((p) => {
      if (p.status === 'pending') {
        totals.pending.count += 1;
        totals.pending.amount += p.amount;
      } else if (p.status === 'overdue') {
        totals.overdue.count += 1;
        totals.overdue.amount += p.amount;
      } else if (p.status === 'paid') {
        totals.paid.count += 1;
        totals.paid.amount += p.amount;
      } else if (p.status === 'waived') {
        totals.waived.count += 1;
        totals.waived.amount += p.amount;
      }
      totals.all.count += 1;
      totals.all.amount += p.amount;
    });

    return totals;
  };

  const totals = calculateTotals();

  const openMarkPaidModal = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    setMarkPaidNotes('');
    setShowMarkPaidModal(true);
  };

  const handleMarkPaymentPaid = async () => {
    if (!selectedPaymentId) return;
    setSubmitting(true);
    setError('');
    try {
      await apiClient.patch(API_ENDPOINTS.admin.paymentsMarkPaid(selectedPaymentId), {
        notes: markPaidNotes || null,
      });
      setSuccess('Payment marked as received');
      setShowMarkPaidModal(false);
      await loadPayments();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleWaivePayment = async () => {
    setError('');
    setSubmitting(true);
    try {
      await apiClient.patch(API_ENDPOINTS.admin.paymentsWaive(waivingPaymentId), {});
      setSuccess('Payment canceled successfully');
      setShowWaiveDialog(false);
      setWaivingPaymentId('');
      await loadPayments();
    } catch (err) {
      setError(getApiErrorMessage(err));
      setShowWaiveDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  const onWaiveClick = (paymentId: string) => {
    setWaivingPaymentId(paymentId);
    setShowWaiveDialog(true);
  };

  const handleRaiseBulkDue = async () => {
    if (!bulkForm.type || !bulkForm.amount || !bulkForm.due_date) {
      setError('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post(API_ENDPOINTS.admin.paymentsBulk, {
        type: bulkForm.type,
        amount: parseFloat(bulkForm.amount),
        due_date: bulkForm.due_date,
        description: bulkForm.description || null,
      });
      setSuccess(`Due raised for all residents`);
      setShowRaiseBulkModal(false);
      setBulkForm({ type: 'maintenance_fee', amount: '', due_date: '', description: '' });
      await loadPayments();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRaiseIndividualDue = async () => {
    if (!individualForm.resident_id || !individualForm.type || !individualForm.amount || !individualForm.due_date) {
      setError('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post(API_ENDPOINTS.admin.paymentsIndividual, {
        resident_id: individualForm.resident_id,
        type: individualForm.type,
        amount: parseFloat(individualForm.amount),
        due_date: individualForm.due_date,
        description: individualForm.description || null,
      });
      setSuccess('Due raised successfully');
      setShowRaiseIndividualModal(false);
      setIndividualForm({ resident_id: '', type: 'maintenance_fee', amount: '', due_date: '', description: '' });
      await loadPayments();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="space-y-8 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-40 rounded bg-slate-200" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 rounded-lg bg-slate-200" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8 p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#76806F]">Administration</p>
          <h1 className={`${cormorant.className} text-5xl font-semibold text-[#173326]`}>Payments & Dues</h1>
          <p className="mt-2 text-[#7A7F70]">Track and manage resident payment records</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => setShowRaiseBulkModal(true)}
            className="rounded-full bg-[#0F5B35] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(15,91,53,0.16)] transition hover:-translate-y-0.5"
          >
            Raise Bulk Due
          </button>
          <button
            onClick={() => setShowRaiseIndividualModal(true)}
            className="rounded-full border-2 border-[#0F5B35] bg-transparent px-6 py-3 text-sm font-semibold text-[#0F5B35] transition hover:bg-[#0F5B35]/5"
          >
            Raise Individual Due
          </button>
        </div>
      </div>

      {/* Error & Success Messages */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">{success}</div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Pending', value: totals.pending.count, amount: totals.pending.amount, textColor: 'text-[#C05A0A]' },
          { label: 'Overdue', value: totals.overdue.count, amount: totals.overdue.amount, textColor: 'text-[#C1121F]' },
          { label: 'Paid', value: totals.paid.count, amount: totals.paid.amount, textColor: 'text-[#0F5B35]' },
          { label: 'Canceled', value: totals.waived.count, amount: totals.waived.amount, textColor: 'text-[#4A5568]' },
        ].map((card) => (
          <div key={card.label} className="group relative overflow-hidden rounded-[28px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(23,51,38,0.09)]">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[#0F5B35]" />
            <p className={`text-sm font-semibold ${card.textColor}`}>{card.label}</p>
            <div className="mt-4 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-[#173326]">{card.value}</p>
              <p className={`text-lg font-semibold ${card.textColor}`}>₹{card.amount.toFixed(2)}</p>
            </div>
            <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#0F5B35]/5 blur-2xl transition group-hover:bg-[#0F5B35]/10" />
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#E6E0CF] pb-4">
        {(['all', 'pending', 'overdue', 'paid', 'waived'] as FilterStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 text-sm font-medium transition ${
              filterStatus === status
                ? 'border-b-2 border-[#0F5B35] text-[#0F5B35]'
                : 'text-[#7A7F70] hover:text-[#173326]'
            }`}
          >
            {status === 'all' ? 'All' : status === 'waived' ? 'Canceled' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto rounded-[28px] border border-[#D8D0BC] bg-[#F6F2E8] shadow-[0_8px_24px_rgba(23,51,38,0.04)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#D8D0BC]">
              <th className="px-6 py-4 text-left font-semibold text-[#173326]">Resident</th>
              <th className="px-6 py-4 text-left font-semibold text-[#173326]">Unit</th>
              <th className="px-6 py-4 text-left font-semibold text-[#173326]">Type</th>
              <th className="px-6 py-4 text-left font-semibold text-[#173326]">Amount</th>
              <th className="px-6 py-4 text-left font-semibold text-[#173326]">Due Date</th>
              <th className="px-6 py-4 text-left font-semibold text-[#173326]">Status</th>
              <th className="px-6 py-4 text-left font-semibold text-[#173326]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-[#7A7F70]">
                  No payments found
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => {
                const residentName = residents.find((r) => r.id === payment.resident_id)?.full_name || 'Unknown';
                const unitNumber = residents.find((r) => r.id === payment.resident_id)?.unit_number || '-';

                return (
                  <tr key={payment.id} className="border-b border-[#D8D0BC] transition hover:bg-[#FBF8EF]">
                    <td className="px-6 py-4 font-medium text-[#173326]">{residentName}</td>
                    <td className="px-6 py-4 text-[#596154]">{unitNumber}</td>
                    <td className="px-6 py-4 text-[#596154]">{getTypeLabel(payment.type)}</td>
                    <td className="px-6 py-4 font-semibold text-[#173326]">₹{payment.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-[#596154]">{new Date(payment.due_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                          payment.status === 'overdue'
                            ? 'bg-red-200 text-red-700'
                            : payment.status === 'pending'
                              ? 'bg-yellow-200 text-yellow-700'
                              : payment.status === 'paid'
                                ? 'bg-green-200 text-green-700'
                                : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {getStatusLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(payment.status === 'pending' || payment.status === 'overdue') && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openMarkPaidModal(payment.id)}
                            className="text-sm font-semibold text-green-700 hover:underline"
                            disabled={submitting}
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => onWaiveClick(payment.id)}
                            className="text-sm font-semibold text-slate-600 hover:underline"
                            disabled={submitting}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {payment.status === 'paid' && (
                        <div className="text-xs text-[#7A7F70]">
                          Paid: {new Date(payment.paid_date || '').toLocaleDateString()}
                          {payment.transaction_ref && (
                            <>
                              <br />
                              Ref: {payment.transaction_ref}
                            </>
                          )}
                        </div>
                      )}
                      {payment.status === 'waived' && <div className="text-xs text-[#7A7F70]">Canceled</div>}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mark Paid Modal */}
      {showMarkPaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
          <div className="w-full max-w-md rounded-[28px] border border-[#D8D0BC] bg-[#F6F2E8] p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-[#173326]">Mark Payment as Received</h2>
            <p className="mt-1 text-sm text-[#7A7F70]">Record the payment receipt details</p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#173326]">Payment Reference (Optional)</label>
                <p className="mt-1 text-xs text-[#7A7F70]">UPI ID, cash receipt, bank ref number etc.</p>
                <input
                  type="text"
                  value={markPaidNotes}
                  onChange={(e) => setMarkPaidNotes(e.target.value)}
                  placeholder="e.g., UPI-12345, CASH-001"
                  className="mt-2 w-full rounded-lg border border-[#D8D0BC] bg-white px-4 py-3 text-sm text-[#173326] placeholder-[#999] focus:border-[#0F5B35] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowMarkPaidModal(false)}
                disabled={submitting}
                className="flex-1 rounded-lg border-2 border-[#0F5B35] bg-transparent px-4 py-3 text-sm font-semibold text-[#0F5B35] transition hover:bg-[#0F5B35]/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkPaymentPaid}
                disabled={submitting}
                className="flex-1 rounded-lg bg-[#0F5B35] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(15,91,53,0.16)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {submitting ? 'Marking...' : 'Mark as Received'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raise Bulk Due Modal */}
      {showRaiseBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
          <div className="w-full max-w-md rounded-[28px] border border-[#D8D0BC] bg-[#F6F2E8] p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-[#173326]">Raise Due for All Residents</h2>
            <p className="mt-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs text-yellow-700">
              This will create a due for all active residents in your building
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#173326]">Due Type *</label>
                <select
                  value={bulkForm.type}
                  onChange={(e) => setBulkForm({ ...bulkForm, type: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[#D8D0BC] bg-white px-4 py-3 text-sm text-[#173326] focus:border-[#0F5B35] focus:outline-none"
                >
                  <option value="maintenance_fee">Maintenance Fee</option>
                  <option value="parking">Parking</option>
                  <option value="amenity">Amenity</option>
                  <option value="penalty">Penalty</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#173326]">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={bulkForm.amount}
                  onChange={(e) => setBulkForm({ ...bulkForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="mt-2 w-full rounded-lg border border-[#D8D0BC] bg-white px-4 py-3 text-sm text-[#173326] placeholder-[#999] focus:border-[#0F5B35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#173326]">Due Date *</label>
                <input
                  type="date"
                  value={bulkForm.due_date}
                  onChange={(e) => setBulkForm({ ...bulkForm, due_date: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[#D8D0BC] bg-white px-4 py-3 text-sm text-[#173326] focus:border-[#0F5B35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#173326]">Description (Optional)</label>
                <textarea
                  value={bulkForm.description}
                  onChange={(e) => setBulkForm({ ...bulkForm, description: e.target.value })}
                  placeholder="Add any notes..."
                  className="mt-2 w-full rounded-lg border border-[#D8D0BC] bg-white px-4 py-3 text-sm text-[#173326] placeholder-[#999] focus:border-[#0F5B35] focus:outline-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowRaiseBulkModal(false)}
                disabled={submitting}
                className="flex-1 rounded-lg border-2 border-[#0F5B35] bg-transparent px-4 py-3 text-sm font-semibold text-[#0F5B35] transition hover:bg-[#0F5B35]/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseBulkDue}
                disabled={submitting}
                className="flex-1 rounded-lg bg-[#0F5B35] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(15,91,53,0.16)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {submitting ? 'Raising...' : 'Raise Due for All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raise Individual Due Modal */}
      {showRaiseIndividualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
          <div className="w-full max-w-md rounded-[28px] border border-[#D8D0BC] bg-[#F6F2E8] p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-[#173326]">Raise Due for Resident</h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#173326]">Select Resident *</label>
                <select
                  value={individualForm.resident_id}
                  onChange={(e) => setIndividualForm({ ...individualForm, resident_id: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[#D8D0BC] bg-white px-4 py-3 text-sm text-[#173326] focus:border-[#0F5B35] focus:outline-none"
                >
                  <option value="">Choose a resident...</option>
                  {residents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                      {resident.full_name} {resident.unit_number ? `(${resident.unit_number})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#173326]">Due Type *</label>
                <select
                  value={individualForm.type}
                  onChange={(e) => setIndividualForm({ ...individualForm, type: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[#D8D0BC] bg-white px-4 py-3 text-sm text-[#173326] focus:border-[#0F5B35] focus:outline-none"
                >
                  <option value="maintenance_fee">Maintenance Fee</option>
                  <option value="parking">Parking</option>
                  <option value="amenity">Amenity</option>
                  <option value="penalty">Penalty</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#173326]">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={individualForm.amount}
                  onChange={(e) => setIndividualForm({ ...individualForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="mt-2 w-full rounded-lg border border-[#D8D0BC] bg-white px-4 py-3 text-sm text-[#173326] placeholder-[#999] focus:border-[#0F5B35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#173326]">Due Date *</label>
                <input
                  type="date"
                  value={individualForm.due_date}
                  onChange={(e) => setIndividualForm({ ...individualForm, due_date: e.target.value })}
                  className="mt-2 w-full rounded-lg border border-[#D8D0BC] bg-white px-4 py-3 text-sm text-[#173326] focus:border-[#0F5B35] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#173326]">Description (Optional)</label>
                <textarea
                  value={individualForm.description}
                  onChange={(e) => setIndividualForm({ ...individualForm, description: e.target.value })}
                  placeholder="Add any notes..."
                  className="mt-2 w-full rounded-lg border border-[#D8D0BC] bg-white px-4 py-3 text-sm text-[#173326] placeholder-[#999] focus:border-[#0F5B35] focus:outline-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setShowRaiseIndividualModal(false)}
                disabled={submitting}
                className="flex-1 rounded-lg border-2 border-[#0F5B35] bg-transparent px-4 py-3 text-sm font-semibold text-[#0F5B35] transition hover:bg-[#0F5B35]/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRaiseIndividualDue}
                disabled={submitting}
                className="flex-1 rounded-lg bg-[#0F5B35] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(15,91,53,0.16)] transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {submitting ? 'Raising...' : 'Raise Due'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={showWaiveDialog}
        title="Cancel Payment?"
        message="This payment will be permanently canceled. This action cannot be undone."
        onConfirm={handleWaivePayment}
        onCancel={() => {
          setShowWaiveDialog(false);
          setWaivingPaymentId('');
        }}
        isDangerous
        confirmLabel="Cancel"
      />
    </main>
  );
}
