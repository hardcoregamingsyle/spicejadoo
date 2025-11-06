
export enum Flavor {
  HEAT = 'Heat',
  EARTHY = 'Earthy',
  SWEET = 'Sweet',
  TANGY = 'Tangy',
  AROMATIC = 'Aromatic',
}

export interface FlavorProfile {
  [Flavor.HEAT]: number;
  [Flavor.EARTHY]: number;
  [Flavor.SWEET]: number;
  [Flavor.TANGY]: number;
  [Flavor.AROMATIC]: number;
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