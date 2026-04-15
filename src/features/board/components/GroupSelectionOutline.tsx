import React from 'react';

interface GroupSelectionOutlineProps {
  visible: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
  borderWidth: number;
  borderRadius: number;
}

export const GroupSelectionOutline: React.FC<GroupSelectionOutlineProps> = ({
  visible,
  left,
  top,
  width,
  height,
  borderWidth,
  borderRadius,
}) => {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed z-40 border-selection-group bg-selection-group-fill box-border"
      style={{
        left,
        top,
        width,
        height,
        borderWidth,
        borderStyle: 'solid',
        borderRadius,
      }}
    />
  );
};

export default GroupSelectionOutline;
