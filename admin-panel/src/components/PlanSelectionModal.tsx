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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="font-bold text-lg mb-4">Select Subscription Plan</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{plan.name}</div>
                      <div className="text-sm text-gray-600">{plan.duration}</div>
                      {/* <div className="text-xs text-gray-500">{plan.description}</div> */}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter any notes about this subscription..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
