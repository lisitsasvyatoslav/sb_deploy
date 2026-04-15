import { Card } from './board';

// ========== NOTIFICATIONS ==========
export interface NotificationData {
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  link?: string; // Optional link for clickable notifications
  linkText?: string; // Link text (default: "Перейти")
  ticker?: string; // Optional ticker symbol for icon display
  securityId?: number; // Optional security ID for ticker icon
}

// ========== DIALOG PROPS ==========
export interface CardEditDialogProps {
  card: Card;
  open: boolean;
  onClose: () => void;
  onSave: (card: Card) => void;
  onDelete: (cardId: number) => void;
}
