

import React from 'react';
import { Spice, Flavor, FlavorProfile } from './types';

// SVG Icons for Spices
const ChiliIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19.15,6.39c-1-1.47-2.3-2.63-3.83-3.37C14,2.38,12.7,2,11.5,2S9,2.38,7.68,3.02c-1.53,0.74-2.83,1.9-3.83,3.37C3,7.6,2.62,8.9,2.62,10.12S3,12.64,3.85,13.85c1.47,2,3.48,3.53,5.86,4.31,0.3,0.1,0.61,0.14,0.92,0.14,1.4,0,2.68-0.66,3.68-1.9,0.06-0.07,0.1-0.14,0.14-0.23,0.37-0.78,0.58-1.63,0.58-2.54,0-0.34-0.03-0.66-0.08-0.97,0.35-0.28,0.68-0.6,0.95-0.97,1.21-1.6,1.4-3.68,0.53-5.46M12.42,15.8c-0.5,0.72-1.3,1.11-2.19,1.11-0.19,0-0.38-0.02-0.56-0.06-1.95-0.68-3.66-2-4.9-3.82-0.71-1.04-1.03-2.16-1.03-3.23s0.32-2.19,1.03-3.23c0.86-1.26,2-2.27,3.32-2.88,1.14-0.55,2.26-0.83,3.33-0.83s2.19,0.28,3.33,0.83c1.32,0.61,2.46,1.62,3.32,2.88,0.59,0.86,0.78,1.91,0.49,2.92-0.19,0.65-0.56,1.23-1.06,1.69-0.31,0.28-0.66,0.52-1.04,0.69-0.08,0.6-0.29,1.17-0.6,1.69-0.53,0.9-1.3,1.55-2.23,1.88-0.1,0.04-0.19,0.05-0.28,0.05-0.3,0-0.6-0.08-0.85-0.26Z"/></svg>
);
const CuminIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Zm4-8a4,4,0,1,1-4-4A4,4,0,0,1,16,12Z" opacity=".3"/><path d="M12,6a6,6,0,1,0,6,6A6,6,0,0,0,12,6Zm0,10a4,4,0,1,1,4-4A4,4,0,0,1,12,16Z"/></svg>
);
const TurmericIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16.42,8.58a1,1,0,0,0-1.42,0L12,11.59,8.91,8.5a1,1,0,0,0-1.42,0,1,1,0,0,0,0,1.42L10.59,13,7.5,16.09a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,14.41l3.09,3.1a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L13.41,13l3.09-3.09a1,1,0,0,0,0-1.42Z"/><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".3"/></svg>
);
const CardamomIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z"/></svg>
);
const CloveIcon: React.FC<{className?: string}> = ({className}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM12 2C9.24 2 7 4.24 7 7c0 2.24 1.76 4 4 4h2c2.24 0 4-1.76 4-4s-1.76-5-4-5h-2zm0 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/></svg>
);
const TamarindIcon: React.FC<{className?: string}> = ({className}) => (
 <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20.25,6.5A3.25,3.25,0,0,0,17,3.25H7A3.25,3.25,0,0,0,3.75,6.5v11A3.25,3.25,0,0,0,7,20.75H17a3.25,3.25,0,0,0,3.25-3.25ZM18,17.5a.75.75,0,0,1-.75.75H6.75A.75.75,0,0,1,6,17.5V6.5A.75.75,0,0,1,6.75,5.75H17.25a.75.75,0,0,1,.75.75Z M14.5,9.5a.75.75,0,0,0-.75-.75h-4a.75.75,0,0,0,0,1.5h4A.75.75,0,0,0,14.5,9.5Zm-1,4a.75.75,0,0,0-.75-.75h-2a.75.75,0,0,0,0,1.5h2A.75.75,0,0,0,13.5,13.5Z"/></svg>
);

export const EMPTY_PROFILE: FlavorProfile = {
  [Flavor.HEAT]: 0,
  [Flavor.EARTHY]: 0,
  [Flavor.SWEET]: 0,
  [Flavor.TANGY]: 0,
  [Flavor.AROMATIC]: 0,
};

export const SPICES: Spice[] = [
  { id: 'chili', name: 'Red Chili', description: 'Brings fiery passion and heat.', icon: ChiliIcon,
    flavorProfile: { ...EMPTY_PROFILE, [Flavor.HEAT]: 30, [Flavor.EARTHY]: 5 } },
  { id: 'turmeric', name: 'Turmeric', description: 'A root of earthy warmth and vibrant color.', icon: TurmericIcon,
    flavorProfile: { ...EMPTY_PROFILE, [Flavor.EARTHY]: 25, [Flavor.AROMATIC]: 5 } },
  { id: 'cumin', name: 'Cumin Seed', description: 'Deep, earthy, and slightly smoky.', icon: CuminIcon,
    flavorProfile: { ...EMPTY_PROFILE, [Flavor.EARTHY]: 30, [Flavor.AROMATIC]: 10 } },
  { id: 'cardamom', name: 'Cardamom', description: 'Aromatic, sweet, and complex.', icon: CardamomIcon,
    flavorProfile: { ...EMPTY_PROFILE, [Flavor.SWEET]: 15, [Flavor.AROMATIC]: 30 } },
  { id: 'cloves', name: 'Cloves', description: 'Intensely aromatic with a hint of sweetness.', icon: CloveIcon,
    flavorProfile: { ...EMPTY_PROFILE, [Flavor.SWEET]: 10, [Flavor.AROMATIC]: 35 } },
  { id: 'tamarind', name: 'Tamarind', description: 'Adds a sour and tangy dimension.', icon: TamarindIcon,
    flavorProfile: { ...EMPTY_PROFILE, [Flavor.TANGY]: 35, [Flavor.SWEET]: 5 } },
];