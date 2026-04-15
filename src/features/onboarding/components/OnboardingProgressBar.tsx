'use client';

import { ONBOARDING_DOTS_PER_ROW, ONBOARDING_TOTAL_DOTS } from '../constants';

type OnboardingProgressBarProps = {
  viewed: number;
  total: number;
};

export const OnboardingProgressBar = ({
  viewed,
  total,
}: OnboardingProgressBarProps) => {
  // Map viewed/total fraction onto the dot grid
  const filledCount =
    total > 0 ? Math.round((viewed / total) * ONBOARDING_TOTAL_DOTS) : 0;

  const rows = [
    Array.from({ length: ONBOARDING_DOTS_PER_ROW }, (_, i) => i < filledCount),
    Array.from(
      { length: ONBOARDING_DOTS_PER_ROW },
      (_, i) => ONBOARDING_DOTS_PER_ROW + i < filledCount
    ),
  ];

  return (
    <div className="flex flex-col gap-[1.9px]">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-[1.9px] items-center justify-end"
        >
          {row.map((filled, dotIndex) => (
            <div
              key={dotIndex}
              className={`shrink-0 size-[3.8px] rounded-full transition-colors ${
                filled ? 'bg-[#F461E0]' : 'bg-blackinverse-a8'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
