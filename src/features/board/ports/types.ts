export type PortDataType =
  | 'ticker'
  | 'signal'
  | 'price'
  | 'direction'
  | 'timeframe'
  | 'any';

export interface PortDefinition {
  /** Unique ID used as React Flow Handle id (e.g. 'input_ticker_0') */
  id: string;
  /** Display label (e.g. 'Тикер') */
  label: string;
  /** Port direction */
  direction: 'input' | 'output';
  /** Data type for connection validation */
  dataType: PortDataType;
  /** Color override; falls back to dataType palette color */
  color?: string;
}

export interface PortConfig {
  inputs: PortDefinition[];
  outputs: PortDefinition[];
}
