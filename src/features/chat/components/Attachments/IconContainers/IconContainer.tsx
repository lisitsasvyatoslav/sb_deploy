import React from 'react';

interface IconContainerProps {
  children: React.ReactNode;
  colorClassName?: string;
  color?: string;
}

/**
 * Reusable icon container with gradient overlay and 3D embossing effect.
 * Use `colorClassName` for Tailwind bg classes, or `color` for dynamic inline colors.
 */
const IconContainer: React.FC<IconContainerProps> = ({
  children,
  colorClassName,
  color,
}) => (
  <div
    className={`w-[32px] h-[32px] rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden ${colorClassName ?? ''}`}
    style={color ? { backgroundColor: color } : undefined}
  >
    {/* Outer ring gradient overlay for edge highlight */}
    <div className="absolute inset-0 rounded-full pointer-events-none bg-[linear-gradient(135deg,var(--whiteinverse-a12)_0%,var(--whiteinverse-a8)_100%)]" />
    {/* Inner circle gradient for 3D embossing effect */}
    <div className="absolute inset-[4%] rounded-full pointer-events-none bg-[linear-gradient(135deg,var(--whiteinverse-a12)_0%,transparent_50%,var(--whiteinverse-a12)_100%)]" />
    <div className="relative z-10">{children}</div>
  </div>
);

export default IconContainer;
