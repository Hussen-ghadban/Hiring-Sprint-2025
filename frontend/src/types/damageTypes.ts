export interface Point {
  x: number;
  y: number;
}

export interface Damage {
  class: string;
  points?: Point[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface ImageWithDamageProps {
  src: string;
  damages?: Damage[];
}

export interface Report {
  newDamages: Damage[];
  estimatedCostRange: [number, number];
  summary: string;
}
