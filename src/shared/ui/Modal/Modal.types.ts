import { ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface EditorConfig {
  content?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  /** Optional card_data.id — used to link uploaded files to the card */
  cardDataId?: number;
}

export interface EditableTitleConfig {
  value: string;
  onChange?: (newValue: string) => void;
  onConfirm?: () => void;
  placeholder?: string;
  color?: string;
  /** Increment this value to programmatically focus and select the input. */
  focusTrigger?: number;
}

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
  maxWidth?: ModalSize | number;
  /** Full-screen mode — no padding, rounded corners, border, or shadow */
  fullScreen?: boolean;
  zIndex?: number;
  showCloseButton?: boolean;
  /** Render close button as absolute-positioned overlay (no 42px header) */
  floatingCloseButton?: boolean;
  expandable?: boolean;
  leftContent?: ReactNode;
  editorConfig?: EditorConfig;
  editableTitle?: EditableTitleConfig;
  colorWidget?: ReactNode;
  onAskAI?: () => void;
  onAskAIWithFile?: (
    fileId: string,
    filename: string,
    mimeType?: string
  ) => void;
  expandedBounds?: { left: number; right: number } | null;
  onExpandToOverlay?: () => void;
  /** Controlled expanded state — overrides ModalFrame's internal state */
  expanded?: boolean;
  /** Called when ModalFrame wants to change expanded state (e.g. Escape key) */
  onExpandedChange?: (expanded: boolean) => void;
  header?: ReactNode;
  /** Optional portal target element. Defaults to document.body */
  container?: Element | null;
}

export interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface ModalTitleProps {
  children: ReactNode;
  className?: string;
}

export interface ModalBodyProps {
  children?: ReactNode;
  className?: string;
  padding?: 'none' | 'default' | 'large';
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'between';
  /** Content rendered on the left side of the footer (forces justify-between layout) */
  leftContent?: ReactNode;
}
