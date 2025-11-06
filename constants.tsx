import React from 'react';
import { Spice, FlavorProfile } from './types';
import { Challenge } from "./types";
// === SVG ICONS ===
const ChiliIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.15,6.39c-1-1.47-2.3-2.63-3.83-3.37C14,2.38,12.7,2,11.5,2S9,2.38,7.68,3.02c-1.53,0.74-2.83,1.9-3.83,3.37C3,7.6,2.62,8.9,2.62,10.12S3,12.64,3.85,13.85c1.47,2,3.48,3.53,5.86,4.31,0.3,0.1,0.61,0.14,0.92,0.14,1.4,0,2.68-0.66,3.68-1.9,0.06-0.07,0.1-0.14,0.14-0.23,0.37-0.78,0.58-1.63,0.58-2.54,0-0.34-0.03-0.66-0.08-0.97,0.35-0.28,0.68-0.6,0.95-0.97,1.21-1.6,1.4-3.68,0.53-5.46Z" />
  </svg>
);

const CuminIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" />
  </svg>
);

const TurmericIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" />
  </svg>
);

const CardamomIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
  </svg>
);

const CloveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 5.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
  </svg>
);

const TamarindIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.25,6.5A3.25,3.25,0,0,0,17,3.25H7A3.25,3.25,0,0,0,3.75,6.5v11A3.25,3.25,0,0,0,7,20.75H17a3.25,3.25,0,0,0,3.25-3.25Z" />
  </svg>
);

// === BASE FLAVOR PROFILE ===
export const EMPTY_PROFILE: FlavorProfile = {
  Heat: 0,
  Sweetness: 0,
  Sourness: 0,
  Umami: 0,
  Bitterness: 0,
  Aromatic: 0,
};

// === SPICE DEFINITIONS ===
export const SPICES: Spice[] = [
  {
    id: 'chili',
    name: 'Red Chili',
    description: 'Brings fiery passion and heat.',
    icon: ChiliIcon,
    flavorProfile: { ...EMPTY_PROFILE, Heat: 40, Bitterness: 5, Aromatic: 5 },
  },
  {
    id: 'turmeric',
    name: 'Turmeric',
    description: 'A root of earthy warmth and golden vibrance.',
    icon: TurmericIcon,
    flavorProfile: { ...EMPTY_PROFILE, Umami: 10, Bitterness: 15, Aromatic: 10 },
  },
  {
    id: 'cumin',
    name: 'Cumin Seed',
    description: 'Deep, earthy, and slightly smoky.',
    icon: CuminIcon,
    flavorProfile: { ...EMPTY_PROFILE, Umami: 20, Aromatic: 15 },
  },
  {
    id: 'cardamom',
    name: 'Cardamom',
    description: 'Sweet and fragrant — a perfume of Indian desserts.',
    icon: CardamomIcon,
    flavorProfile: { ...EMPTY_PROFILE, Sweetness: 20, Aromatic: 25 },
  },
  {
    id: 'clove',
    name: 'Clove',
    description: 'Intensely aromatic with warmth and bite.',
    icon: CloveIcon,
    flavorProfile: { ...EMPTY_PROFILE, Aromatic: 35, Bitterness: 5 },
  },
  {
    id: 'tamarind',
    name: 'Tamarind',
    description: 'Adds a tangy, sweet-sour kick to dishes.',
    icon: TamarindIcon,
    flavorProfile: { ...EMPTY_PROFILE, Sourness: 30, Sweetness: 5 },
  },
];


export const challenges: Challenge[] = [
  {
    id: 1,
    region: "South India",
    title: "Fiery Curry Base",
    description: "Create a curry blend that packs heat but stays balanced.",
    base: "Tomato & Onion",
    targetProfile: {
      Heat: 8,
      Sweetness: 2,
      Sourness: 3,
      Umami: 6,
      Bitterness: 2,
      Aromatic: 5,
    },
  },
  {
    id: 2,
    region: "North India",
    title: "Rich Butter Masala",
    description: "Blend spices to enhance a creamy butter gravy base.",
    base: "Cream & Tomato",
    targetProfile: {
      Heat: 4,
      Sweetness: 6,
      Sourness: 2,
      Umami: 7,
      Bitterness: 1,
      Aromatic: 8,
    },
  },
  {
    id: 3,
    region: "Coastal India",
    title: "Tangy Seafood Masala",
    description: "Bring out the tang and aroma of a coastal seafood dish.",
    base: "Coconut & Tamarind",
    targetProfile: {
      Heat: 5,
      Sweetness: 3,
      Sourness: 8,
      Umami: 6,
      Bitterness: 2,
      Aromatic: 7,
    },
  },
];
