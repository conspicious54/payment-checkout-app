import { PRODUCT_NAME, PRODUCT_SUBTITLE, CreditTier, creditTierLabels } from '../constants';

interface HeaderProps {
  creditTier: CreditTier;
  onCreditTierChange: (tier: CreditTier) => void;
}

export function Header({ creditTier, onCreditTierChange }: HeaderProps) {
  const tiers: CreditTier[] = ['700+', '600-700', 'below-600'];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400 font-medium"
            aria-label="Product logo"
          >
            PP
          </div>
          <div>
            <h1 className="text-xl font-semibold">{PRODUCT_NAME}</h1>
            <p className="text-gray-500 text-sm">{PRODUCT_SUBTITLE}</p>
          </div>
        </div>

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
