interface PaymentIndicatorProps {
  index: number;
  total: number;
}

export function PaymentIndicator({ index, total }: PaymentIndicatorProps) {
  const fillPercentage = ((index + 1) / total) * 100;

  return (
    <div className="relative w-12 h-12" aria-label={`Payment ${index + 1} of ${total}`}>
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48" aria-hidden="true">
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="#374151"
          strokeWidth="8"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeDasharray={`${fillPercentage * 1.256} ${125.6}`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
