export interface Damage {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  [key: string]: any;
}

// Estimated price map for damages
export const PRICE_MAP: Record<string, [number, number]> = {
  crack: [60, 120],
  dent: [40, 90],
  "glass shatter": [120, 250],
  "lamp broken": [70, 150],
  scratch: [40, 120],
  "tire flat": [20, 80],
};
