/**
 * Chart Handler Registry
 *
 * Module-level Map that allows other parts of the app (e.g. ChatManager)
 * to access chart widget instances owned by ChartWidgetContent components.
 */

import type { TxChartHandler } from '@/types/txchart';

export type ChartHandler = TxChartHandler;

const registry = new Map<number, ChartHandler>();

export function registerChartHandler(
  cardId: number,
  handler: ChartHandler
): void {
  registry.set(cardId, handler);
}

export function getChartHandler(cardId: number): ChartHandler | undefined {
  return registry.get(cardId);
}

export function unregisterChartHandler(cardId: number): void {
  registry.delete(cardId);
}
