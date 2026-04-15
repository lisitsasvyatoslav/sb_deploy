/**
 * NOTE: This component uses inline styles intentionally.
 * The style values are calculated dynamically at runtime and cannot be
 * replaced with static Tailwind classes.
 */

interface SelectionAreaProps {
  selectionBox: {
    isSelecting: boolean;
    start: { x: number; y: number } | null;
    current: { x: number; y: number } | null;
  };
}

const SelectionArea = ({ selectionBox }: SelectionAreaProps) => {
  if (
    !selectionBox.isSelecting ||
    !selectionBox.start ||
    !selectionBox.current
  ) {
    return null;
  }

  const left = Math.min(selectionBox.start.x, selectionBox.current.x);
  const top = Math.min(selectionBox.start.y, selectionBox.current.y);
  const width = Math.abs(selectionBox.start.x - selectionBox.current.x);
  const height = Math.abs(selectionBox.start.y - selectionBox.current.y);

  return (
    <div
      className="fixed border border-[var(--brand-primary)] bg-[var(--brand-primary-light)] pointer-events-none rounded-md"
      style={{
        left,
        top,
        width,
        height,
      }}
    />
  );
};

export default SelectionArea;
