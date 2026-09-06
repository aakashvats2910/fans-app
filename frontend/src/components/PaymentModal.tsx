"use client";

import { useState } from "react";

export default function PaymentModal({
  title,
  description,
  amount,
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  amount: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setProcessing(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-white text-xl leading-none">
            &times;
          </button>
        </div>
        <p className="text-sm text-muted mb-5">{description}</p>

        <div className="rounded-xl border border-border bg-surface-2 p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>DEMO PAYMENT — no real card is charged</span>
          </div>
          <div>
            <label className="block text-xs text-muted mb-1">Card number</label>
            <input
              disabled
              value="4242 4242 4242 4242"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-muted mb-1">Expiry</label>
              <input
                disabled
                value="12/34"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-muted mb-1">CVC</label>
              <input
                disabled
                value="123"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted">Total</span>
          <span className="text-xl font-bold">${amount.toFixed(2)}</span>
        </div>

        {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={processing}
          className="w-full rounded-full brand-gradient text-white font-semibold py-2.5 disabled:opacity-60"
        >
          {processing ? "Processing..." : `Pay $${amount.toFixed(2)} (Simulated)`}
        </button>
        <button
          onClick={onClose}
          disabled={processing}
          className="w-full text-sm text-muted mt-3 hover:text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
