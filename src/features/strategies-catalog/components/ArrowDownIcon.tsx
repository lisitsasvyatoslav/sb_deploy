interface IconProps {
  style?: React.CSSProperties;
  className?: string;
}

export const ArrowDownIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 8 5"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    color="currentColor"
    className={className}
  >
    <path
      d="M7.28022 0.21967C7.5548 0.494257 7.57175 0.928508 7.33149 1.22309L7.28022 1.28022L4.28022 4.28022L4.22309 4.33149C3.92851 4.57175 3.49426 4.5548 3.21967 4.28022L0.21967 1.28022C-0.0732233 0.987324 -0.0732233 0.512563 0.21967 0.21967C0.512563 -0.0732233 0.987324 -0.0732233 1.28022 0.21967L3.74994 2.6894L6.21967 0.21967L6.2768 0.1684C6.57138 -0.0718624 7.00563 -0.054917 7.28022 0.21967Z"
      fill="currentColor"
      fillOpacity="0.6"
      style={style}
    />
  </svg>
);
