import { renderWidget } from '@/features/chat/components/widgets';
import { Message } from '@/types';
import { ReactNode } from 'react';

type RecommendedStrategy = { id: number };
type RecommendedStrategiesOutput = {
  recommendedStrategies: RecommendedStrategy[];
};

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

const isRecommendedStrategiesOutput = (
  v: unknown
): v is RecommendedStrategiesOutput => {
  if (!isObject(v) || !Array.isArray(v.recommendedStrategies)) return false;
  return v.recommendedStrategies.every(
    (item) =>
      isObject(item) && typeof item.id === 'number' && Number.isFinite(item.id)
  );
};

/** Returns true if output has a `recommendedStrategies` array (even empty). */
const hasRecommendedStrategiesField = (v: unknown): boolean =>
  isObject(v) &&
  Array.isArray((v as Record<string, unknown>).recommendedStrategies);

const getStrategyIdsFromMessageOutput = (message: Message): number[] => {
  const ids = new Set<number>();

  for (const plan of message.plans ?? []) {
    const outputs: Array<Record<string, unknown> | null | undefined> = [
      plan.output ?? undefined,
      ...(plan.executionSteps ?? []).map((s) => s.output ?? undefined),
    ];

    for (const out of outputs) {
      if (!isRecommendedStrategiesOutput(out)) continue;
      for (const s of out.recommendedStrategies) ids.add(Math.trunc(s.id));
    }
  }

  return Array.from(ids);
};

const messageHasStrategiesField = (message: Message): boolean => {
  for (const plan of message.plans ?? []) {
    const outputs: Array<unknown> = [
      plan.output,
      ...(plan.executionSteps ?? []).map((s) => s.output),
    ];
    if (outputs.some(hasRecommendedStrategiesField)) return true;
  }
  return false;
};

export const isMessageHaveWidget = (message: Message): boolean => {
  if (message.widget && message.widgetData) {
    return true;
  }

  return (
    process.env.NEXT_PUBLIC_FEATURE_STRATEGIES_CATALOG === 'true' &&
    messageHasStrategiesField(message)
  );
};

export const getMessageWidgetContent = (msg: Message): ReactNode | null => {
  if (msg.widget && msg.widgetData) {
    return renderWidget(msg.widget, msg.widgetData);
  }

  if (
    process.env.NEXT_PUBLIC_FEATURE_STRATEGIES_CATALOG === 'true' &&
    messageHasStrategiesField(msg)
  ) {
    const strategyIds = getStrategyIdsFromMessageOutput(msg);
    return renderWidget('strategies', { strategyIds });
  }

  return null;
};
