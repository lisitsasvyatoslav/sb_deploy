/**
 * @deprecated This file is deprecated. Sparkles are now loaded from the API.
 * See src/services/api/sparkle.ts for the API client.
 *
 * The sparklies are stored in the database (sparkle_dialogs table)
 * and seeded via backend/seeds/sparkle_dialogs.py
 */

import { logger } from '@/shared/utils/logger';
import { Sparkly, WelcomeMessage } from '../types';

// Helper to create messages with IDs (kept for backward compatibility)
export const createMessage = (
  type: 'USER' | 'COPILOT',
  content: string,
  widget?: WelcomeMessage['widget'],
  widgetData?: WelcomeMessage['widgetData']
): WelcomeMessage => ({
  id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  type,
  content,
  createdAt: new Date().toISOString(),
  widget,
  widgetData,
});

// Empty array - sparklies are now loaded from API
export const SPARKLIES: Sparkly[] = [];

// Get sparkly by ID - deprecated, use sparkleApi.getBySlug instead
export const getSparklyById = (_id: string): Sparkly | undefined => {
  logger.warn(
    'sparklies',
    'getSparklyById is deprecated. Use sparkleApi.getBySlug instead.'
  );
  return undefined;
};

// Get all sparklies - deprecated, use sparkleApi.getAll instead
export const getAllSparklies = (): Sparkly[] => {
  logger.warn(
    'sparklies',
    'getAllSparklies is deprecated. Use sparkleApi.getAll instead.'
  );
  return [];
};
