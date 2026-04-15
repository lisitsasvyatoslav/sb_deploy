import React from 'react';

/**
 * NOTE: This component uses inline styles intentionally.
 * The style values are calculated dynamically at runtime and cannot be
 * replaced with static Tailwind classes.
 */

/**
 * SVG illustration for empty profitability chart state
 * Shows a card with bar chart visualization
 *
 * decorative: no-theme -- illustration SVG, colors are design-specific
 * All fills (#B9C6DF, #9062E3, #946CF3) are purely decorative and should not change with theme.
 */
const ProfitabilityChartIllustration: React.FC = () => {
  return (
    <svg
      width="150"
      height="150"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_5420_46422)">
        <rect width="120" height="120" rx="12" fill="white" fillOpacity="0.2" />
        <circle cx="14" cy="14" r="2" fill="#B9C6DF" />
        <circle cx="21" cy="14" r="2" fill="#B9C6DF" />
        <circle cx="28" cy="14" r="2" fill="#B9C6DF" />
        <rect
          opacity="0.6"
          x="12"
          y="78"
          width="16"
          height="4"
          rx="2"
          transform="rotate(-90 12 78)"
          fill="#9062E3"
        />
        <rect
          opacity="0.25"
          x="18"
          y="78"
          width="12"
          height="4"
          rx="2"
          transform="rotate(-90 18 78)"
          fill="#9062E3"
        />
        <rect
          opacity="0.6"
          x="29.2"
          y="78"
          width="18"
          height="4"
          rx="2"
          transform="rotate(-90 29.2 78)"
          fill="#9062E3"
        />
        <rect
          opacity="0.25"
          x="35.2"
          y="78"
          width="20"
          height="4"
          rx="2"
          transform="rotate(-90 35.2 78)"
          fill="#9062E3"
        />
        <rect
          opacity="0.6"
          x="46.4"
          y="78"
          width="28"
          height="4"
          rx="2"
          transform="rotate(-90 46.4 78)"
          fill="#9062E3"
        />
        <rect
          opacity="0.25"
          x="52.4"
          y="78"
          width="22"
          height="4"
          rx="2"
          transform="rotate(-90 52.4 78)"
          fill="#9062E3"
        />
        <rect
          opacity="0.6"
          x="63.6"
          y="78"
          width="44"
          height="4"
          rx="2"
          transform="rotate(-90 63.6 78)"
          fill="#9062E3"
        />
        <rect
          opacity="0.25"
          x="69.6"
          y="78"
          width="34"
          height="4"
          rx="2"
          transform="rotate(-90 69.6 78)"
          fill="#9062E3"
        />
        <rect
          opacity="0.6"
          x="80.8"
          y="78"
          width="16"
          height="4"
          rx="2"
          transform="rotate(-90 80.8 78)"
          fill="#9062E3"
        />
        <rect
          opacity="0.25"
          x="86.8"
          y="78"
          width="12"
          height="4"
          rx="2"
          transform="rotate(-90 86.8 78)"
          fill="#9062E3"
        />
        <rect
          opacity="0.6"
          x="98"
          y="78"
          width="26"
          height="4"
          rx="2"
          transform="rotate(-90 98 78)"
          fill="#9062E3"
        />
        <rect
          opacity="0.25"
          x="104"
          y="78"
          width="22"
          height="4"
          rx="2"
          transform="rotate(-90 104 78)"
          fill="#9062E3"
        />
        <foreignObject
          x="-1.31765"
          y="78.6824"
          width="42.6353"
          height="42.6353"
        >
          <div
            style={{
              backdropFilter: 'blur(4.66px)',
              clipPath: 'url(#bgblur_1_5420_46422_clip_path)',
              height: '100%',
              width: '100%',
            }}
          ></div>
        </foreignObject>
        <g data-figma-bg-blur-radius="9.31765">
          <rect
            x="8"
            y="88"
            width="24"
            height="24"
            rx="6"
            fill="#946CF3"
            fillOpacity="0.05"
          />
          <path
            d="M17.6667 104V101.333H15.4848C15.2171 101.333 15 101.55 15 101.818V103.515C15 103.783 15.2171 104 15.4848 104H17.6667ZM17.6667 104H20.3333M17.6667 104V99.1515C17.6667 98.8837 17.8837 98.6667 18.1515 98.6667H20.3333V104M20.3333 104H22.7576C22.8915 104 23 103.891 23 103.758V96.4848C23 96.2171 22.7829 96 22.5152 96H20.8182C20.5504 96 20.3333 96.2171 20.3333 96.4848V104Z"
            stroke="#946CF3"
            strokeWidth="1.2"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
        </g>
        <rect
          x="40"
          y="94.668"
          width="32"
          height="4"
          rx="2"
          fill="#B9C6DF"
          fillOpacity="0.7"
        />
        <rect
          opacity="0.4"
          x="40"
          y="101.336"
          width="64"
          height="4"
          rx="2"
          fill="#B9C6DF"
          fillOpacity="0.7"
        />
      </g>
      <rect
        x="0.5"
        y="0.5"
        width="119"
        height="119"
        rx="11.5"
        stroke="#B9C6DF"
        strokeOpacity="0.5"
      />
      <defs>
        <clipPath
          id="bgblur_1_5420_46422_clip_path"
          transform="translate(1.31765 -78.6824)"
        >
          <rect x="8" y="88" width="24" height="24" rx="6" />
        </clipPath>
        <clipPath id="clip0_5420_46422">
          <rect width="120" height="120" rx="12" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ProfitabilityChartIllustration;
