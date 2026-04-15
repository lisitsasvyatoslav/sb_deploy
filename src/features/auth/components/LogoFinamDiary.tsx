import React from 'react';
import { currentRegionConfig } from '@/shared/config/region';

const LogoFinamAuth: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-end gap-[6.5px] h-6 ${className || ''}`}>
    {/* Union Icon (colored Finam logo) */}
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-[25px] flex-shrink-0"
    >
      <path
        d="M24.5 10.4932C24.4925 10.5059 23.2104 12.674 21.2627 14.1768C18.2156 16.5277 15.6118 16.5228 13.4492 18.3633C11.2866 20.2038 10.4166 22.1587 10.2119 23.0518L7.7002 21.0977C7.90495 20.2045 8.77507 18.2495 10.9375 16.4092C13.1 14.569 15.8459 14.7476 18.751 12.2236C21.6239 9.72749 21.9807 8.5656 21.9883 8.54004L24.5 10.4932ZM22.7139 3.68359C22.7139 3.68359 21.5977 8.20533 17.5791 11.3867C14.5616 13.7755 11.9272 13.7318 9.76465 15.5723C7.60222 17.4127 6.73299 19.3677 6.52832 20.2607L4.0166 18.3076C4.22125 17.4146 5.09127 15.4597 7.25391 13.6191C9.41652 11.7787 12.1622 11.9568 15.0674 9.43262C19.307 5.74893 20.2021 1.73047 20.2021 1.73047L22.7139 3.68359ZM18.3047 2.90234C18.3047 2.90234 17.4671 5.58191 14.0625 8.54004C11.1574 11.0638 8.41154 10.8852 6.24902 12.7256C4.08639 14.5661 3.21637 16.521 3.01172 17.4141L0.5 15.4609C0.704644 14.5679 1.57481 12.613 3.7373 10.7725C5.89994 8.93192 8.6465 9.11018 11.5518 6.58594C14.934 3.64711 15.7821 0.983644 15.793 0.949219L18.3047 2.90234Z"
        fill="url(#paint0_linear_finam_logo)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_finam_logo"
          x1="19.9247"
          y1="0.94922"
          x2="1.54348"
          y2="0.949219"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FEDA3B" />
          <stop offset="0.47" stopColor="#EF5541" />
          <stop offset="0.815" stopColor="#821EE0" />
          <stop offset="0.98" stopColor="#7F2A8A" />
        </linearGradient>
      </defs>
    </svg>

    {/* Text "Finam" + "Diary" */}
    <div className="flex flex-col gap-[2.8px] items-start">
      <svg
        width="53"
        height="10"
        viewBox="33.3 5.5 59.2 12"
        preserveAspectRatio="xMinYMid meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-[10px] w-[52px]"
      >
        <path
          d="M51.1939 12.3048V6.66754H48.6387V16.0646H51.1939L55.0475 10.4484V16.0646H57.5923V6.66754H55.0397L51.1939 12.3048ZM43.2198 6.66494H41.6986V5.77734H39.1512V6.67282H37.63C34.8907 6.66494 33.3125 8.42967 33.3125 11.5036C33.3125 14.3287 34.8907 16.0594 37.858 16.0594H39.1538V16.9732H41.7012V16.0594H42.9969C44.5 16.0594 45.6429 15.6143 46.4203 14.7895C47.1978 13.9647 47.5425 12.9044 47.5425 11.5036C47.5372 8.42967 45.9591 6.66494 43.2198 6.66494ZM39.1512 14.1847H38.5422C36.7929 14.1847 35.917 13.1373 35.917 11.3046C35.917 9.59222 36.7748 8.55274 38.353 8.55274H39.1512V14.1847ZM42.3076 14.1847H41.6986V8.56061H42.4994C44.0776 8.56061 44.9328 9.63931 44.9328 11.3124C44.9328 13.1373 44.0569 14.1847 42.3076 14.1847ZM65.6182 10.4484H61.762V6.66754H59.2275V16.0646H61.7724V12.3048H65.6286V16.0646H68.1734V6.66754H65.6286L65.6182 10.4484ZM89.7503 6.67282C88.7655 6.67282 88.1565 7.19642 87.8533 8.13118L86.1792 13.2552L84.4792 8.13378C84.176 7.19382 83.5695 6.67542 82.5822 6.67542H80.2498V16.0594H82.8103V9.44294L84.9716 16.0594H87.3868L89.5482 9.44294V16.0594H92.093V6.67802L89.7503 6.67282ZM77.337 7.17815C76.8627 6.85084 76.1397 6.65447 75.1498 6.65447H70.0782V8.55274H74.3464C75.7718 8.55274 76.3082 9.04233 76.3082 10.2127V10.451H72.8174C71.6979 10.451 70.8608 10.6735 70.3114 11.2496C70.0552 11.514 69.8544 11.8279 69.7208 12.1725C69.5872 12.5171 69.5237 12.8853 69.534 13.2552C69.534 14.2345 69.9046 14.9911 70.5317 15.452C71.0811 15.8552 71.8784 16.0568 72.9237 16.0568H78.6639V10.8202C78.6639 9.03185 78.2311 7.7908 77.337 7.17815ZM76.3004 14.1926H72.9625C72.338 14.1926 71.8223 13.9595 71.8223 13.2709C71.8223 12.5221 72.2784 12.3152 72.9625 12.3152H76.3315L76.3004 14.1926Z"
          fill="currentColor"
          className="text-[var(--Black-Inverse-A100)]"
        />
      </svg>
      <div className="flex items-center">
        <span className="font-semibold text-[6.94px] leading-[7.7px] tracking-[0.694px] uppercase text-[var(--Black-Inverse-A100)]">
          Diary
        </span>
      </div>
    </div>
  </div>
);

const LogoLimexAuth: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`flex items-end gap-[6.5px] h-6 ${className || ''}`}>
    {/* LIMEX green grid icon */}
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6 flex-shrink-0"
    >
      <rect x="0" y="0" width="10" height="10" rx="1.5" fill="#A9DC4D" />
      <rect x="12" y="0" width="10" height="10" rx="1.5" fill="#A9DC4D" />
      <rect x="0" y="12" width="10" height="10" rx="1.5" fill="#A9DC4D" />
      <rect x="12" y="12" width="10" height="10" rx="1.5" fill="#A9DC4D" />
      <circle cx="23" cy="1" r="1" fill="#A9DC4D" />
      <circle cx="23" cy="23" r="1" fill="#A9DC4D" />
    </svg>

    {/* Text "LIMEX" + "Diary" */}
    <div className="flex flex-col gap-[2.8px] items-start">
      <span className="font-bold text-[14px] leading-[14px] text-[var(--Black-Inverse-A100)]">
        LIMEX
      </span>
      <div className="flex items-center">
        <span className="font-semibold text-[6.94px] leading-[7.7px] tracking-[0.694px] uppercase text-[var(--Black-Inverse-A100)]">
          Diary
        </span>
      </div>
    </div>
  </div>
);

/**
 * Brand logo for auth pages — shows Finam or LIMEX branding based on DEPLOYMENT_REGION
 */
const LogoFinamDiary: React.FC<{ className?: string }> = ({ className }) => {
  const isLime = currentRegionConfig.theme === 'lime';
  return isLime ? (
    <LogoLimexAuth className={className} />
  ) : (
    <LogoFinamAuth className={className} />
  );
};

export default LogoFinamDiary;
