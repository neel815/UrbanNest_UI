'use client';

import { ChangeEvent, DragEvent, useId, useRef, useState } from 'react';

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxSizeMb?: number;
};

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  disabled = false,
  maxSizeMb = 2,
}: ImageUploadFieldProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  const handleFile = async (file: File | null) => {
    setError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Image must be smaller than ${maxSizeMb}MB.`);
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError('Could not process the image. Please try again.');
    }
  };

  const onInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    await handleFile(file);
    event.target.value = '';
  };

  const onDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0] || null;
    await handleFile(file);
  };

  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
        {label}
      </label>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
        disabled={disabled}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDrop={onDrop}
        className={
          dragActive
            ? 'mt-2 rounded-xl border-2 border-blue-600 bg-blue-50 p-4'
            : 'mt-2 rounded-xl border border-dashed border-[#D8D0BC] bg-[#F6F2E8] p-4'
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Drag and drop an image here</p>
            <p className="mt-1 text-xs text-slate-600">PNG, JPG, WEBP up to {maxSizeMb}MB</p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="inline-flex items-center justify-center rounded-lg bg-[#0F5B35] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Choose image
          </button>
        </div>
      </div>

      {value && (
        <div className="mt-3 flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="uploaded preview" className="h-full w-full object-cover" />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={disabled}
            className="text-sm font-semibold text-slate-700 underline underline-offset-2 disabled:opacity-60"
          >
            Remove image
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
    </div>
  );
}