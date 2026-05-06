'use client';

import React from 'react';

interface DeleteConfirmationDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  isDangerous?: boolean; // For more prominent styling on dangerous actions
  confirmLabel?: string; // Custom label for confirm button (default: "Delete")
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  isOpen,
  isDangerous = false,
  confirmLabel = 'Delete',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#173326]/50 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[28px] border border-[#E6E0CF] bg-[#FBF8EF] p-6 shadow-[0_24px_80px_rgba(23,51,38,0.22)]">
        {/* Title */}
        <h2 className={`text-lg font-semibold ${isDangerous ? 'text-rose-700' : 'text-[#173326]'}`}>
          {title}
        </h2>

        {/* Message */}
        <p className="mt-3 text-sm text-[#596154]">
          {message}
        </p>

        {/* Buttons */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full border border-[#D8D0BC] bg-white text-[#173326] hover:bg-[#F6F2E8] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-full font-medium text-white transition-colors ${
              isDangerous
                ? 'bg-rose-700 hover:bg-rose-800'
                : 'bg-[#0F5B35] hover:bg-[#0B4B2C]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
