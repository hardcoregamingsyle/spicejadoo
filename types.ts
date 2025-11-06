// types.ts

export enum Flavor {
  Heat = "Heat",
  Sweetness = "Sweetness",
  Sourness = "Sourness",
  Umami = "Umami",
  Bitterness = "Bitterness",
  Aromatic = "Aromatic",
}

export interface FlavorProfile {
  Heat: number;
  Sweetness: number;
  Sourness: number;
  Umami: number;
  Bitterness: number;
  Aromatic: number;
}

export interface Spice {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  flavorProfile: FlavorProfile;
}

export interface Challenge {
  id: number;
  region: string;
  title: string;
  description: string;
  base: string;
  targetProfile: FlavorProfile;
}

export interface SelectedSpice {
  id: string;
  name: string;
  quantity: number;
}

export interface OracleJudgement {
  dishName: string;
  description: string;
  score: number;
  feedback: string;
}
