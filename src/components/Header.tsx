import { CreditTier, creditTierLabels } from '../constants';

interface HeaderProps {
  creditTier: CreditTier;
  onCreditTierChange: (tier: CreditTier) => void;
}

export function Header({ creditTier, onCreditTierChange }: HeaderProps) {
  const tiers: CreditTier[] = ['700+', '600-700', 'below-600'];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <img
          src="/ppf-logo.png"
          alt="PPF Accelerator"
          className="h-28"
        />

        <div className="flex gap-2" role="tablist" aria-label="Credit tier selection">
          {tiers.map((tier) => (
            <button
              key={tier}
              onClick={() => onCreditTierChange(tier)}
              role="tab"
              aria-selected={creditTier === tier}
              aria-controls={`tier-${tier}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                creditTier === tier
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {creditTierLabels[tier]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
