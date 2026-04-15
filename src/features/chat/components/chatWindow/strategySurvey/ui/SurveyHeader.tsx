import React from 'react';

interface SurveyHeaderProps {
  text: string;
}

const SurveyHeader: React.FC<SurveyHeaderProps> = ({ text }) => (
  <>
    <div className="h-px bg-[var(--border-light)] mb-3" />
    <div className="flex items-center gap-1.5 mb-4">
      <span className="text-text-primary text-[8px]">✦</span>
      <span className="text-text-primary text-[8px] font-medium tracking-wide">
        {text}
      </span>
    </div>
  </>
);

export default SurveyHeader;
