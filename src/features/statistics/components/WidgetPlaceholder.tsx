'use client';

import { useTranslation } from '@/shared/i18n/client';
import React from 'react';

/* decorative: no-theme -- SVG icon fills (#E3612A, #DD65CF, #51C275) and gradient are design-specific decorative colors */
const WidgetPlaceholder: React.FC = () => {
  const { t } = useTranslation('statistics');
  return (
    <div className="theme-surface theme-border flex flex-col items-center justify-center h-full rounded-2xl p-5 pt-9">
      <div className="flex flex-col gap-2 items-center px-4 py-0">
        <div className="flex flex-col gap-4 items-center justify-center h-full rounded-2xl pb-[14px] pt-[34px] px-3">
          {/* Illustration */}
          <div className="border border-[rgba(185,198,223,0.5)] flex flex-col items-center justify-center overflow-hidden rounded-xl w-[140px] h-[140px] bg-background-card">
            {/* Header with dots */}
            <div className="flex items-center pb-[2px] pt-3 px-3 w-full">
              <div className="flex gap-[3px]">
                <div className="w-1 h-1 rounded-full bg-border-medium" />
                <div className="w-1 h-1 rounded-full bg-border-medium" />
                <div className="w-1 h-1 rounded-full bg-border-medium" />
              </div>
            </div>

            {/* Icons */}
            <div className="flex gap-2 items-center justify-center pt-[10px] px-4 flex-1 w-full">
              {/* Document Icon -- decorative: no-theme */}
              <div className="w-10 h-10 flex items-center justify-center theme-surface rounded-lg">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="40"
                    height="40"
                    rx="12"
                    fill="#E3612A"
                    fillOpacity="0.05"
                  />{' '}
                  {/* decorative: no-theme */}
                  <path
                    d="M12.6569 25.367H15.4174M12.6569 20.4374H16.9949M12.6569 15.5078H25.6709"
                    stroke="#E3612A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M23.4472 18.5624C23.263 18.1939 22.737 18.1939 22.5528 18.5624L21.4079 20.8522C21.3595 20.949 21.281 21.0275 21.1843 21.0758L18.8944 22.2208C18.5259 22.405 18.5259 22.9309 18.8944 23.1152L21.1843 24.2601C21.281 24.3085 21.3595 24.3869 21.4079 24.4837L22.5528 26.7735C22.737 27.1421 23.263 27.1421 23.4472 26.7735L24.5921 24.4837C24.6405 24.3869 24.719 24.3085 24.8157 24.2601L27.1056 23.1152C27.4741 22.9309 27.4741 22.405 27.1056 22.2208L24.8157 21.0758C24.719 21.0275 24.6405 20.949 24.5921 20.8522L23.4472 18.5624Z"
                    fill="#E3612A"
                  />
                </svg>
              </div>

              {/* Brain Icon -- decorative: no-theme */}
              <div className="w-10 h-10 flex items-center justify-center theme-surface rounded-lg">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="40"
                    height="40"
                    rx="12"
                    fill="#DD65CF"
                    fillOpacity="0.05"
                  />{' '}
                  {/* decorative: no-theme */}
                  <rect
                    x="1"
                    y="1"
                    width="38"
                    height="38"
                    rx="11"
                    stroke="#DD65CF"
                    strokeOpacity="0.15"
                    strokeWidth="2"
                  />
                  <path
                    d="M19.9804 27.2889C20.6144 27.7133 21.3769 27.9608 22.1972 27.9608C24.0196 27.9608 25.5567 26.739 26.034 25.0698C27.1645 24.6062 27.9608 23.4947 27.9608 22.1972C27.9608 21.3288 27.6041 20.5437 27.0293 19.9804C27.6041 19.4171 27.9608 18.632 27.9608 17.7636C27.9608 16.1632 26.7494 14.8457 25.1935 14.6781C24.8061 13.1392 23.413 12 21.7538 12C21.1078 12 20.5021 12.1727 19.9804 12.4745M19.9804 27.2889C19.3464 27.7133 18.5839 27.9608 17.7636 27.9608C15.9411 27.9608 14.404 26.739 13.9267 25.0698C12.7962 24.6062 12 23.4947 12 22.1972C12 21.3288 12.3567 20.5437 12.9315 19.9804C12.3567 19.4171 12 18.632 12 17.7636C12 16.1632 13.2114 14.8457 14.7673 14.6781C15.1547 13.1392 16.5478 12 18.207 12C18.853 12 19.4587 12.1727 19.9804 12.4745M19.9804 27.2889L19.9804 12.4745M17.1765 21.4902C18.725 21.4902 19.9804 22.7456 19.9804 24.2941M22.7843 18.4706C21.2358 18.4706 19.9804 17.2152 19.9804 15.6667"
                    stroke="#DD65CF"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Code Icon -- decorative: no-theme */}
              <div className="w-10 h-10 flex items-center justify-center theme-surface rounded-lg">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    width="40"
                    height="40"
                    rx="12"
                    fill="#51C275"
                    fillOpacity="0.05"
                  />{' '}
                  {/* decorative: no-theme */}
                  <path
                    d="M18.087 26.5577L21.5992 13.6797M24.7212 16.8016L26.3328 18.514C27.1813 19.4155 27.1813 20.8219 26.3328 21.7235L24.7212 23.4358M14.9651 23.4358L13.3535 21.7235C12.505 20.8219 12.505 19.4156 13.3535 18.514L14.9651 16.8016"
                    stroke="#51C275"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center px-4 py-3 w-full">
              <div className="bg-gradient-to-r from-[rgba(124,75,229,0.1)] to-violet-500 flex items-center justify-between p-[1.667px] rounded-[16.667px] w-full">
                {' '}
                {/* decorative: no-theme */}
                <div className="theme-surface rounded w-2 h-2" />
                <div className="theme-surface rounded w-2 h-2" />
                <div className="theme-surface rounded w-2 h-2" />
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col gap-2 items-center w-full">
            <p className="font-medium text-base leading-6 tracking-[-0.4px] theme-text-primary text-center w-full">
              {t('widgets.comingSoon')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetPlaceholder;
