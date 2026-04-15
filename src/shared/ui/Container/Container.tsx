import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  height?: string;
  padding?: number | string;
  backgroundColor?: string;
  borderRadius?: string;
  border?: string;
  boxShadow?: string;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({
  children,
  height,
  padding,
  backgroundColor,
  borderRadius,
  border,
  boxShadow,
  className = '',
}) => {
  // Default Tailwind classes
  const defaultClasses =
    'bg-white rounded-xl border border-border-gray shadow-none';

  // Convert props to inline styles for backward compatibility
  const style: React.CSSProperties = {
    ...(height && { height }),
    ...(padding !== undefined && {
      padding: typeof padding === 'number' ? `${padding}px` : padding,
    }),
    ...(backgroundColor && { backgroundColor }),
    ...(borderRadius && { borderRadius }),
    ...(border && { border }),
    ...(boxShadow && { boxShadow }),
  };

  return (
    <div
      className={`${defaultClasses} ${className}`}
      style={Object.keys(style).length > 0 ? style : undefined}
    >
      <div className="h-full flex flex-col justify-between">{children}</div>
    </div>
  );
};

export default Container;
