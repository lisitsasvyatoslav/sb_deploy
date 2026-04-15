import { PortDefinition } from '@/features/board/ports/types';
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

interface PortColumnProps {
  direction: 'input' | 'output';
  ports: PortDefinition[];
  connectedHandleIds?: Set<string>;
  /** When true, output ports render as arrow icons (strategy cards) */
  useArrowOutputs?: boolean;
  /** When true, only render invisible handles (no visual dots/arrows) */
  hideIndicator?: boolean;
}

const StrategyArrow = () => (
  <svg
    width="7"
    height="11"
    viewBox="0 0 7 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0 10.2217L0 0.25045C0 0.0418421 0.240423 -0.0750123 0.404455 0.0538702L6.74981 5.0395C6.8772 5.1396 6.8772 5.33257 6.74981 5.43266L0.404455 10.4183C0.240423 10.5472 0 10.4303 0 10.2217Z"
      style={{ fill: 'var(--mind-accent)' }}
    />
  </svg>
);

const PortColumn: React.FC<PortColumnProps> = memo(
  ({
    direction,
    ports,
    connectedHandleIds,
    useArrowOutputs,
    hideIndicator,
  }) => {
    if (ports.length === 0) return null;

    const isInput = direction === 'input';
    const handlePosition = isInput ? Position.Left : Position.Right;
    const handleType = isInput ? 'target' : 'source';
    const isArrow = !isInput && useArrowOutputs;

    return (
      <div
        className={`flex flex-col justify-center gap-3 py-2 ${isInput ? 'pr-1' : 'pl-1'}`}
      >
        {ports.map((port) => {
          const isConnected = connectedHandleIds?.has(port.id) ?? false;
          const isTicker = port.dataType === 'ticker';
          const showBorder = isConnected || isTicker;

          return (
            <div
              key={port.id}
              className={`relative flex items-center justify-center ${hideIndicator ? ' w-0 h-0' : 'w-5 h-5'}`}
            >
              {/* Invisible handle centered on the dot for React Flow edge anchoring */}
              <Handle
                id={port.id}
                type={handleType}
                position={handlePosition}
                isConnectable={false}
                className="!absolute !left-1/2 !top-1/2 !-translate-x-1/2 !-translate-y-1/2 !opacity-0 port-handle !w-3 !h-3 !min-w-0 !min-h-0 !border-0 !p-0"
              />
              {/* Visual indicator (hidden when hideIndicator is set) */}
              {!hideIndicator &&
                (isArrow ? (
                  <StrategyArrow />
                ) : isInput ? (
                  <div
                    className={`flex items-center justify-center rounded-full w-[12px] h-[12px] ${
                      showBorder ? 'border border-solid border-accent' : ''
                    }`}
                  >
                    <div className="w-[6px] h-[6px] rounded-full bg-accent" />
                  </div>
                ) : (
                  <div
                    className={`w-1.5 h-1.5 rounded-full bg-accent ${
                      showBorder ? 'border border-solid border-accent' : ''
                    }`}
                  />
                ))}
            </div>
          );
        })}
      </div>
    );
  }
);

PortColumn.displayName = 'PortColumn';

export default PortColumn;
