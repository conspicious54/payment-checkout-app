import type { PaymentFrequency } from '../constants';

interface PaymentFrequencyToggleProps {
  frequency: PaymentFrequency;
  onFrequencyChange: (frequency: PaymentFrequency) => void;
}

export function PaymentFrequencyToggle({
  frequency,
  onFrequencyChange,
}: PaymentFrequencyToggleProps) {
  return (
    <div className="flex gap-3 mb-8" role="group" aria-label="Payment frequency">
      <button
        onClick={() => onFrequencyChange('monthly')}
        aria-pressed={frequency === 'monthly'}
        className={`flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
          frequency === 'monthly'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => onFrequencyChange('bi-weekly')}
        aria-pressed={frequency === 'bi-weekly'}
        className={`flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
          frequency === 'bi-weekly'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
      >
        Bi-weekly
      </button>
    </div>
  );
}
