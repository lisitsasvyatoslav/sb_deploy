import React from 'react';

interface StrategyDetailDescriptionProps {
  description?: string;
}

// TODO [MOCK] — используется когда API не вернул описание
const MOCK_DESCRIPTION = `Среднесрочная трендовая стратегия с управлением риском и фильтрацией входов. Основной фокус — стабильный рост капитала при контролируемой просадке.`;

const StrategyDetailDescription: React.FC<StrategyDetailDescriptionProps> = ({
  description,
}) => {
  const text = description || MOCK_DESCRIPTION;

  return (
    <p className="text-sm leading-relaxed text-text-secondary break-words overflow-hidden">
      {text}
    </p>
  );
};

export default StrategyDetailDescription;
