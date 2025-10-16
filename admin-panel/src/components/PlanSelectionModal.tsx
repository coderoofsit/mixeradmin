import React, { useState } from 'react';

interface PlanSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (planName: string, notes: string) => void;
  loading?: boolean;
}

const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('Quarterly');
  const [notes, setNotes] = useState<string>('');

  const plans = [
    {
      id: 'Quarterly',
      name: 'Subscription Quarterly',
      duration: '3 months',
      description: 'Subscription Quarterly (3 months)'
    },
    {
      id: 'Basic',
      name: 'Subscription Basic',
      duration: '1 month',
      description: 'Subscription Basic (1 month)'
    },
    {
      id: 'Upgrade',
      name: 'Subscription Upgrade',
      duration: '1 month',
      description: 'Subscription Upgrade (1 month)'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(selectedPlan, notes);
  };

  const handleClose = () => {
    setSelectedPlan('Quarterly');
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="glass-card max-w-md w-full mx-4 border border-var(--border)" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <h3 className="text-lg font-semibold text-var(--text-primary) mb-4">Select Subscription Plan</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-var(--text-secondary) mb-2">
                Choose Plan
              </label>
              <div className="space-y-2">
                {plans.map((plan) => (
                  <label key={plan.id} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={selectedPlan === plan.id}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="mt-1 h-4 w-4 text-var(--primary) border-var(--border) focus:ring-var(--primary)"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-var(--text-primary)">{plan.name}</div>
                      <div className="text-sm text-var(--text-secondary)">{plan.duration}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-var(--text-secondary) mb-2">
                Notes (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-var(--border) rounded-lg focus:outline-none focus:ring-2 focus:ring-var(--primary) focus:border-var(--primary) bg-var(--bg-primary) text-var(--text-primary) resize-none"
                style={{ borderRadius: 'var(--border-radius)' }}
                placeholder="Enter any notes about this subscription..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Mark ${selectedPlan} as Paid`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanSelectionModal;
