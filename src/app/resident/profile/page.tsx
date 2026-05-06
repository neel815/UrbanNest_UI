'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { apiClient, getApiErrorMessage } from '@/utils/api';
import { API_ENDPOINTS } from '@/utils/constants';

type ResidentProfile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  profile_image: string | null;
  unit_number: string | null;
  floor: number | null;
  plot_number: string | null;
  building_name: string | null;
  move_in_date: string | null;
  lease_end_date: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'R'
  );
}

function formatDate(value: string | null) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  return date.toLocaleDateString();
}

function toDateInputValue(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export default function ResidentProfilePage() {
  const [profile, setProfile] = useState<ResidentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isPersonalEditing, setIsPersonalEditing] = useState(false);
  const [isEmergencyEditing, setIsEmergencyEditing] = useState(false);
  const [personalFullName, setPersonalFullName] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const loadProfile = useCallback(async () => {
    const data = await apiClient.get(API_ENDPOINTS.resident.profile);
    setProfile(data);
    setPersonalFullName(data.full_name || '');
    setEmergencyContactName(data.emergency_contact_name || '');
    setEmergencyContactPhone(data.emergency_contact_phone || '');
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadProfile();
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  }, [loadProfile]);

  const isActive = useMemo(() => (profile?.status || '').toLowerCase() === 'active', [profile?.status]);

  const cancelPersonalEdit = () => {
    if (profile) {
      setPersonalFullName(profile.full_name || '');
    }
    setIsPersonalEditing(false);
  };

  const cancelEmergencyEdit = () => {
    if (profile) {
      setEmergencyContactName(profile.emergency_contact_name || '');
      setEmergencyContactPhone(profile.emergency_contact_phone || '');
    }
    setIsEmergencyEditing(false);
  };

  const savePersonalInfo = async () => {
    if (!profile) return;

    const payload: { full_name?: string } = {};
    if (personalFullName.trim() !== profile.full_name) {
      payload.full_name = personalFullName.trim();
    }

    if (Object.keys(payload).length === 0) {
      setIsPersonalEditing(false);
      return;
    }

    try {
      setError('');
      const updated = await apiClient.patch(API_ENDPOINTS.resident.residentProfileUpdate, payload);
      setProfile(updated);
      setPersonalFullName(updated.full_name || '');
      setEmergencyContactName(updated.emergency_contact_name || '');
      setEmergencyContactPhone(updated.emergency_contact_phone || '');
      setSuccessMessage('Profile updated');
      setIsPersonalEditing(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const saveEmergencyContact = async () => {
    if (!profile) return;

    const payload: {
      emergency_contact_name?: string | null;
      emergency_contact_phone?: string | null;
    } = {};

    const trimmedName = emergencyContactName.trim();
    const trimmedPhone = emergencyContactPhone.trim();

    if (trimmedName !== (profile.emergency_contact_name || '')) {
      payload.emergency_contact_name = trimmedName || null;
    }
    if (trimmedPhone !== (profile.emergency_contact_phone || '')) {
      payload.emergency_contact_phone = trimmedPhone || null;
    }

    if (Object.keys(payload).length === 0) {
      setIsEmergencyEditing(false);
      return;
    }

    try {
      setError('');
      const updated = await apiClient.patch(API_ENDPOINTS.resident.residentProfileUpdate, payload);
      setProfile(updated);
      setPersonalFullName(updated.full_name || '');
      setEmergencyContactName(updated.emergency_contact_name || '');
      setEmergencyContactPhone(updated.emergency_contact_phone || '');
      setSuccessMessage('Profile updated');
      setIsEmergencyEditing(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const unitLabel = profile?.floor !== null && profile?.floor !== undefined ? `Floor ${profile.floor}` : profile?.plot_number || 'N/A';
  const unitFieldLabel = profile?.floor !== null && profile?.floor !== undefined ? 'Floor' : 'Plot Number';
  const unitFieldValue = profile?.floor !== null && profile?.floor !== undefined ? String(profile.floor) : profile?.plot_number || 'N/A';

  return (
    <main className="space-y-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#76806F]">Resident Profile</p>
        <h1 className="text-4xl font-semibold tracking-tight text-[#173326] lg:text-[4.5rem]">My Profile</h1>
        <p className="text-[15px] text-[#637062]">Manage your personal information</p>
      </section>

      {error && <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>}
      {successMessage && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="space-y-4 rounded-[32px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
          <div className="h-6 w-48 animate-pulse rounded-full bg-[#E9E2CF]" />
          <div className="h-28 animate-pulse rounded-[28px] bg-[#E9E2CF]" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-72 animate-pulse rounded-[28px] bg-[#E9E2CF]" />
            <div className="h-72 animate-pulse rounded-[28px] bg-[#E9E2CF]" />
          </div>
        </div>
      ) : profile ? (
        <div className="space-y-6">
          <section className="rounded-[32px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)] lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-[#0F5B35] text-2xl font-semibold text-[#F7F4E8] shadow-[0_14px_32px_rgba(15,91,53,0.18)]">
                  {getInitials(profile.full_name)}
                </div>
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-[#173326]">{profile.full_name}</h2>
                  <p className="mt-1 text-sm text-[#667065]">{profile.email}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#0F5B35] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#F7F4E8]">
                      Resident
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                        isActive ? 'bg-[#DDF0DD] text-[#0F5B35]' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[32px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-[#173326]">Personal Information</h3>
                  <p className="mt-1 text-sm text-[#667065]">Your account identity and member details</p>
                </div>
                {!isPersonalEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsPersonalEditing(true)}
                    className="rounded-full border border-[#D8D0BC] bg-white px-4 py-2 text-sm font-semibold text-[#173326] hover:bg-[#F2EEE2]"
                  >
                    Edit
                  </button>
                ) : null}
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[#7A7F70]">Full Name</label>
                  {isPersonalEditing ? (
                    <input
                      value={personalFullName}
                      onChange={(event) => setPersonalFullName(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[#D8D0BC] bg-[#F6F2E8] px-4 py-3 text-sm text-[#173326] outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                    />
                  ) : (
                    <p className="mt-2 text-base font-medium text-[#173326]">{profile.full_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[#7A7F70]">Email</label>
                  <p className="mt-2 text-base font-medium text-[#173326]">{profile.email}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[#7A7F70]">Member Since</label>
                  <p className="mt-2 text-base font-medium text-[#173326]">{formatDate(profile.created_at)}</p>
                </div>

                {isPersonalEditing && (
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={savePersonalInfo}
                      className="rounded-full bg-[#0F5B35] px-5 py-2.5 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] hover:bg-[#0B4B2C]"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelPersonalEdit}
                      className="rounded-full border border-[#D8D0BC] bg-white px-5 py-2.5 text-sm font-semibold text-[#173326] hover:bg-[#F2EEE2]"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
              <h3 className="text-2xl font-semibold tracking-tight text-[#173326]">Unit Information</h3>
              <p className="mt-1 text-sm text-[#667065]">Assigned by the admin team</p>

              <div className="mt-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[#7A7F70]">Building</label>
                  <p className="mt-2 text-base font-medium text-[#173326]">{profile.building_name || 'Not assigned'}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[#7A7F70]">Unit Number</label>
                  <p className="mt-2 text-base font-medium text-[#173326]">{profile.unit_number || 'Not assigned'}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[#7A7F70]">{unitFieldLabel}</label>
                  <p className="mt-2 text-base font-medium text-[#173326]">{unitFieldValue}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[#7A7F70]">Move In Date</label>
                  <p className="mt-2 text-base font-medium text-[#173326]">{formatDate(profile.move_in_date)}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[#7A7F70]">Lease End Date</label>
                  <p className="mt-2 text-base font-medium text-[#173326]">{formatDate(profile.lease_end_date)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[#E4DDCB] bg-[#FBF8EF] p-6 shadow-[0_10px_30px_rgba(23,51,38,0.06)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-[#173326]">Emergency Contact</h3>
                <p className="mt-1 text-sm text-[#667065]">Update the person we should contact in an emergency</p>
              </div>
              {!isEmergencyEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEmergencyEditing(true)}
                  className="rounded-full border border-[#D8D0BC] bg-white px-4 py-2 text-sm font-semibold text-[#173326] hover:bg-[#F2EEE2]"
                >
                  Edit
                </button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[#7A7F70]">Contact Name</label>
                {isEmergencyEditing ? (
                  <input
                    value={emergencyContactName}
                    onChange={(event) => setEmergencyContactName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#D8D0BC] bg-[#F6F2E8] px-4 py-3 text-sm text-[#173326] outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                    placeholder="Enter contact name"
                  />
                ) : (
                  <p className="mt-2 text-base font-medium text-[#173326]">{profile.emergency_contact_name || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-[#7A7F70]">Contact Phone</label>
                {isEmergencyEditing ? (
                  <input
                    value={emergencyContactPhone}
                    onChange={(event) => setEmergencyContactPhone(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-[#D8D0BC] bg-[#F6F2E8] px-4 py-3 text-sm text-[#173326] outline-none focus:ring-2 focus:ring-[#0F5B35]/15"
                    placeholder="Enter contact phone"
                  />
                ) : (
                  <p className="mt-2 text-base font-medium text-[#173326]">{profile.emergency_contact_phone || 'Not provided'}</p>
                )}
              </div>
            </div>

            {isEmergencyEditing && (
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={saveEmergencyContact}
                  className="rounded-full bg-[#0F5B35] px-5 py-2.5 text-sm font-semibold text-[#F7F4E8] shadow-[0_12px_28px_rgba(15,91,53,0.18)] hover:bg-[#0B4B2C]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={cancelEmergencyEdit}
                  className="rounded-full border border-[#D8D0BC] bg-white px-5 py-2.5 text-sm font-semibold text-[#173326] hover:bg-[#F2EEE2]"
                >
                  Cancel
                </button>
              </div>
            )}
          </section>
        </div>
      ) : null}
    </main>
  );
}
